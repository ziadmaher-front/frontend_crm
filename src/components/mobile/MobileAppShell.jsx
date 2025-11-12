import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedPWAService } from '@/services/enhancedPWA';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowLeftIcon,
  ShareIcon,
  CloudArrowDownIcon,
  WifiIcon,
  SignalSlashIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TabletIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CameraIcon,
  MicrophoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Mobile App Shell Engine for PWA functionality
class MobileAppEngine {
  constructor() {
    this.isInstalled = false;
    this.deferredPrompt = null;
    this.serviceWorker = null;
    this.offlineData = new Map();
    this.syncQueue = [];
    this.deviceCapabilities = {};
    this.networkStatus = 'online';
    this.installPromptShown = false;
    this.updateAvailable = false;
    this.cacheVersion = '1.0.0';
    this.offlinePages = new Set();
    this.backgroundSync = null;
    this.pushSubscription = null;
    
    // Initialize enhanced PWA service
    this.pwaService = new EnhancedPWAService();
    
    this.initializePWA();
    this.detectDeviceCapabilities();
    this.setupNetworkMonitoring();
  }

  // Initialize PWA functionality
  async initializePWA() {
    try {
      // Initialize enhanced PWA service
      await this.pwaService.initialize();
      
      // Register enhanced service worker (skip in development)
      if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/enhanced-sw.js');
        this.serviceWorker = registration;
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          this.updateAvailable = true;
          this.emit('update-available');
        });
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
      } else {
        console.log('[MobileAppShell] Skipping enhanced service worker registration in development');
      }

      // Handle install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.emit('install-available');
      });

      // Check if already installed
      window.addEventListener('appinstalled', () => {
        this.isInstalled = true;
        this.deferredPrompt = null;
        this.emit('app-installed');
      });

      // Handle app state changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.handleAppBackground();
        } else {
          this.handleAppForeground();
        }
      });

      // Initialize background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        this.backgroundSync = true;
      }

      // Initialize push notifications
      if ('PushManager' in window) {
        await this.initializePushNotifications();
      }

    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }

  // Detect device capabilities
  detectDeviceCapabilities() {
    this.deviceCapabilities = {
      // Screen
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation: screen.orientation?.type || 'unknown',
      
      // Touch
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      
      // Sensors
      accelerometer: 'DeviceMotionEvent' in window,
      gyroscope: 'DeviceOrientationEvent' in window,
      geolocation: 'geolocation' in navigator,
      
      // Media
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator,
      
      // Storage
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      
      // Network
      onlineStatus: navigator.onLine,
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
      
      // Platform
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      
      // Features
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webShare: 'share' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement,
      vibration: 'vibrate' in navigator
    };
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      this.syncOfflineData();
      this.emit('network-online');
    });

    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
      this.emit('network-offline');
    });

    // Connection change events
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.emit('connection-change', {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        });
      });
    }
  }

  // Initialize push notifications
  async initializePushNotifications() {
    try {
      if (this.serviceWorker) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await this.serviceWorker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.getVapidKey()
          });
          this.pushSubscription = subscription;
          this.emit('push-subscription', subscription);
        }
      }
    } catch (error) {
      console.error('Push notification initialization error:', error);
    }
  }

  // Get VAPID key for push notifications
  getVapidKey() {
    // This should be your actual VAPID public key
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqI';
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'cache-updated':
        this.emit('cache-updated', data.payload);
        break;
      case 'sync-complete':
        this.emit('sync-complete', data.payload);
        break;
      case 'push-received':
        this.emit('push-received', data.payload);
        break;
      default:
        this.emit('sw-message', data);
    }
  }

  // Handle app going to background
  handleAppBackground() {
    // Save current state
    this.saveAppState();
    
    // Schedule background sync if available
    if (this.backgroundSync && this.syncQueue.length > 0) {
      this.scheduleBackgroundSync();
    }
    
    this.emit('app-background');
  }

  // Handle app coming to foreground
  handleAppForeground() {
    // Restore app state
    this.restoreAppState();
    
    // Check for updates
    this.checkForUpdates();
    
    // Sync data if online
    if (this.networkStatus === 'online') {
      this.syncOfflineData();
    }
    
    this.emit('app-foreground');
  }

  // Install PWA
  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        this.emit('app-installed');
      }
      
      this.deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  // Update PWA
  async updatePWA() {
    if (this.serviceWorker && this.updateAvailable) {
      const registration = this.serviceWorker;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  // Cache data for offline use
  async cacheData(key, data, expiry = null) {
    try {
      // Use enhanced PWA service for offline data storage
      await this.pwaService.storeOfflineData(key, data, expiry);
      
      // Also keep in memory for quick access
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null
      };
      this.offlineData.set(key, cacheEntry);
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // Fallback to memory storage
      this.offlineData.set(key, { data, timestamp: Date.now(), expiry });
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      // Try enhanced PWA service first
      const data = await this.pwaService.getOfflineData(key);
      if (data !== null) {
        return data;
      }
    } catch (error) {
      console.warn('Failed to retrieve data from PWA service:', error);
    }
    
    // Fallback to memory cache
    let cacheEntry = this.offlineData.get(key);
    
    // Try localStorage if not in memory
    if (!cacheEntry) {
      try {
        const stored = localStorage.getItem(`offline_${key}`);
        if (stored) {
          cacheEntry = JSON.parse(stored);
          this.offlineData.set(key, cacheEntry);
        }
      } catch (error) {
        console.warn('Failed to retrieve cached data:', error);
      }
    }
    
    // Check expiry
    if (cacheEntry) {
      if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
        this.offlineData.delete(key);
        localStorage.removeItem(`offline_${key}`);
        return null;
      }
      return cacheEntry.data;
    }
    
    return null;
  }

  // Queue data for sync when online
  async queueForSync(operation, data) {
    try {
      // Use enhanced PWA service for action queuing
      const actionId = await this.pwaService.queueAction(operation, data);
      
      // Also add to local queue for immediate processing if online
      const syncItem = {
        id: actionId,
        operation,
        data,
        timestamp: Date.now(),
        retries: 0
      };
      
      this.syncQueue.push(syncItem);
      
      // Try immediate sync if online
      if (this.networkStatus === 'online') {
        this.syncOfflineData();
      }
      
      return actionId;
    } catch (error) {
      console.warn('Failed to queue for sync:', error);
      // Fallback to local queue
      const syncItem = {
        id: Math.random().toString(36).substr(2, 9),
        operation,
        data,
        timestamp: Date.now(),
        retries: 0
      };
      
      this.syncQueue.push(syncItem);
      return syncItem.id;
    }
  }

  // Sync offline data when online
  async syncOfflineData() {
    if (this.networkStatus === 'offline') {
      return;
    }
    
    try {
      // Process sync queue using enhanced PWA service
      await this.pwaService.processSyncQueue();
      
      // Also process local queue
      if (this.syncQueue.length === 0) {
        return;
      }
      
      const itemsToSync = [...this.syncQueue];
      this.syncQueue = [];
      
      for (const item of itemsToSync) {
        try {
          await this.performSync(item);
          this.emit('sync-success', item);
        } catch (error) {
          item.retries++;
          if (item.retries < 3) {
            this.syncQueue.push(item);
          } else {
            this.emit('sync-failed', { item, error });
          }
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync-error', error);
    }
  }

  // Perform individual sync operation
  async performSync(item) {
    // This would integrate with your API
    const response = await fetch(`/api/${item.operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Schedule background sync
  scheduleBackgroundSync() {
    if (this.serviceWorker && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.serviceWorker.sync.register('background-sync');
    }
  }

  // Save app state
  saveAppState() {
    const state = {
      timestamp: Date.now(),
      url: window.location.href,
      scrollPosition: window.scrollY,
      // Add more state as needed
    };
    
    try {
      localStorage.setItem('app_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save app state:', error);
    }
  }

  // Restore app state
  restoreAppState() {
    try {
      const stored = localStorage.getItem('app_state');
      if (stored) {
        const state = JSON.parse(stored);
        // Restore state as needed
        if (state.scrollPosition) {
          window.scrollTo(0, state.scrollPosition);
        }
      }
    } catch (error) {
      console.warn('Failed to restore app state:', error);
    }
  }

  // Check for updates
  async checkForUpdates() {
    if (this.serviceWorker) {
      try {
        await this.serviceWorker.update();
      } catch (error) {
        console.warn('Update check failed:', error);
      }
    }
  }

  // Share content using Web Share API
  async shareContent(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.warn('Share failed:', error);
      }
    }
    return false;
  }

  // Request device permissions
  async requestPermissions(permissions = []) {
    const results = {};
    
    for (const permission of permissions) {
      try {
        switch (permission) {
          case 'notifications':
            results.notifications = await Notification.requestPermission();
            break;
          case 'geolocation':
            results.geolocation = await new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                () => resolve('granted'),
                () => resolve('denied')
              );
            });
            break;
          case 'camera':
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach(track => track.stop());
              results.camera = 'granted';
            } catch {
              results.camera = 'denied';
            }
            break;
          case 'microphone':
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
              results.microphone = 'granted';
            } catch {
              results.microphone = 'denied';
            }
            break;
        }
      } catch (error) {
        results[permission] = 'error';
      }
    }
    
    return results;
  }

  // Vibrate device
  vibrate(pattern = [200]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  // Get device info
  getDeviceInfo() {
    return {
      ...this.deviceCapabilities,
      networkStatus: this.networkStatus,
      isInstalled: this.isInstalled,
      updateAvailable: this.updateAvailable,
      cacheVersion: this.cacheVersion,
      syncQueueSize: this.syncQueue.length,
      offlineDataSize: this.offlineData.size
    };
  }

  // Event emitter functionality
  eventHandlers = new Map();

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }
}

// Mobile Navigation Component
const MobileNavigation = ({ isOpen, onClose, navigationItems }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// PWA Install Prompt
const PWAInstallPrompt = ({ engine }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setInstalling(false);
    };

    const unsubscribeInstall = engine.on('install-available', handleInstallAvailable);
    const unsubscribeInstalled = engine.on('app-installed', handleAppInstalled);

    return () => {
      unsubscribeInstall();
      unsubscribeInstalled();
    };
  }, [engine]);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await engine.installPWA();
    if (!success) {
      setInstalling(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          <p className="text-sm opacity-90">
            Add to home screen for quick access
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
            onClick={() => setShowPrompt(false)}
          >
            Later
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              'Install'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Offline Indicator
const OfflineIndicator = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center text-sm z-50"
    >
      <div className="flex items-center justify-center space-x-2">
        <SignalSlashIcon className="h-4 w-4" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </motion.div>
  );
};

// Update Available Banner
const UpdateBanner = ({ engine }) => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    const unsubscribe = engine.on('update-available', handleUpdateAvailable);
    return unsubscribe;
  }, [engine]);

  const handleUpdate = async () => {
    setUpdating(true);
    await engine.updatePWA();
  };

  if (!showUpdate) return null;

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-green-600 text-white p-3 z-50"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <CloudArrowDownIcon className="h-5 w-5" />
          <span className="text-sm">Update available</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            'Update'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

// Mobile App Shell Component
const MobileAppShell = ({ children }) => {
  const [engine] = useState(() => new MobileAppEngine());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const unsubscribeOnline = engine.on('network-online', handleOnline);
    const unsubscribeOffline = engine.on('network-offline', handleOffline);

    // Update device info
    setDeviceInfo(engine.getDeviceInfo());

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [engine]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, onClick: () => {} },
    { id: 'customers', label: 'Customers', icon: UserGroupIcon, onClick: () => {} },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, onClick: () => {} },
    { id: 'settings', label: 'Settings', icon: CogIcon, onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Update Banner */}
      <UpdateBanner engine={engine} />
      
      {/* Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} />
      
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileNavOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </Button>
          
          <h1 className="text-lg font-semibold">CRM Pro</h1>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <BellIcon className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navigationItems={navigationItems}
      />

      {/* Main Content */}
      <main className="pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="flex flex-col items-center py-2 px-1 h-auto"
              onClick={item.onClick}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt engine={engine} />

      {/* Device Info Debug Panel (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
          <div>Online: {isOnline ? 'Yes' : 'No'}</div>
          <div>Installed: {deviceInfo.isInstalled ? 'Yes' : 'No'}</div>
          <div>Touch: {deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
          <div>Screen: {deviceInfo.screenWidth}x{deviceInfo.screenHeight}</div>
          <div>Orientation: {deviceInfo.orientation}</div>
        </div>
      )}
    </div>
  );
};

export default MobileAppShell;
export { MobileAppEngine };
