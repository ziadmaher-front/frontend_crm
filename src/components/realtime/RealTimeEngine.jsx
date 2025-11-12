import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WifiIcon,
  SignalIcon,
  SignalSlashIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShareIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PhoneIcon,
  DocumentTextIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  CloudIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Real-time Engine for managing WebSocket connections and real-time features
class RealTimeEngine {
  constructor() {
    this.connections = new Map();
    this.subscriptions = new Map();
    this.presenceData = new Map();
    this.collaborationSessions = new Map();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.isConnected = false;
    this.connectionId = null;
    this.eventHandlers = new Map();
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      reconnections: 0,
      avgLatency: 0,
      uptime: 0,
      startTime: Date.now()
    };
  }

  // Initialize WebSocket connection
  async connect(url, options = {}) {
    try {
      const wsUrl = url || this.getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      
      this.connectionId = Math.random().toString(36).substr(2, 9);
      
      ws.onopen = (event) => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.processMessageQueue();
        this.emit('connected', { connectionId: this.connectionId });
        console.log('WebSocket connected:', this.connectionId);
      };

      ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
        this.metrics.messagesReceived++;
      };

      ws.onclose = (event) => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        this.emit('error', { error, connectionId: this.connectionId });
        console.error('WebSocket error:', error);
      };

      this.connections.set(this.connectionId, ws);
      return this.connectionId;
    } catch (error) {
      this.emit('error', { error });
      throw error;
    }
  }

  // Get WebSocket URL based on environment
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }

  // Handle incoming messages
  handleMessage(message) {
    const { type, data, timestamp, sender } = message;
    
    // Calculate latency if timestamp is provided
    if (timestamp) {
      const latency = Date.now() - timestamp;
      this.updateLatencyMetrics(latency);
    }

    switch (type) {
      case 'presence_update':
        this.handlePresenceUpdate(data);
        break;
      case 'collaboration_event':
        this.handleCollaborationEvent(data);
        break;
      case 'notification':
        this.handleNotification(data);
        break;
      case 'data_update':
        this.handleDataUpdate(data);
        break;
      case 'system_message':
        this.handleSystemMessage(data);
        break;
      case 'heartbeat':
        this.handleHeartbeat(data);
        break;
      default:
        this.emit('message', message);
    }
  }

  // Send message through WebSocket
  send(type, data, options = {}) {
    const message = {
      type,
      data,
      timestamp: Date.now(),
      sender: this.connectionId,
      ...options
    };

    if (this.isConnected) {
      const ws = this.connections.get(this.connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        this.metrics.messagesSent++;
        return true;
      }
    }

    // Queue message if not connected
    this.messageQueue.push(message);
    return false;
  }

  // Subscribe to specific events
  subscribe(eventType, callback) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Emit events to subscribers
  emit(eventType, data) {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Handle presence updates
  handlePresenceUpdate(data) {
    const { userId, status, metadata } = data;
    
    this.presenceData.set(userId, {
      status,
      metadata,
      lastSeen: Date.now()
    });
    
    this.emit('presence_update', { userId, status, metadata });
  }

  // Handle collaboration events
  handleCollaborationEvent(data) {
    const { sessionId, event, payload } = data;
    
    if (!this.collaborationSessions.has(sessionId)) {
      this.collaborationSessions.set(sessionId, {
        participants: new Set(),
        events: [],
        createdAt: Date.now()
      });
    }
    
    const session = this.collaborationSessions.get(sessionId);
    session.events.push({ event, payload, timestamp: Date.now() });
    
    this.emit('collaboration_event', { sessionId, event, payload });
  }

  // Handle notifications
  handleNotification(data) {
    this.emit('notification', data);
  }

  // Handle data updates
  handleDataUpdate(data) {
    this.emit('data_update', data);
  }

  // Handle system messages
  handleSystemMessage(data) {
    this.emit('system_message', data);
  }

  // Handle heartbeat
  handleHeartbeat(data) {
    // Respond to heartbeat
    this.send('heartbeat_response', { timestamp: Date.now() });
  }

  // Start heartbeat mechanism
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat mechanism
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Schedule reconnection
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect();
      this.metrics.reconnections++;
    }, delay);
  }

  // Process queued messages
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message.type, message.data, message);
    }
  }

  // Update latency metrics
  updateLatencyMetrics(latency) {
    this.metrics.avgLatency = (this.metrics.avgLatency + latency) / 2;
  }

  // Get connection metrics
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      isConnected: this.isConnected,
      connectionId: this.connectionId,
      queuedMessages: this.messageQueue.length,
      activeSubscriptions: this.subscriptions.size,
      presenceCount: this.presenceData.size,
      collaborationSessions: this.collaborationSessions.size
    };
  }

  // Join collaboration session
  joinCollaborationSession(sessionId, metadata = {}) {
    this.send('join_collaboration', {
      sessionId,
      metadata
    });
  }

  // Leave collaboration session
  leaveCollaborationSession(sessionId) {
    this.send('leave_collaboration', {
      sessionId
    });
  }

  // Update presence status
  updatePresence(status, metadata = {}) {
    this.send('presence_update', {
      status,
      metadata
    });
  }

  // Send collaboration event
  sendCollaborationEvent(sessionId, event, payload) {
    this.send('collaboration_event', {
      sessionId,
      event,
      payload
    });
  }

  // Disconnect
  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    this.connections.forEach((ws, connectionId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Client disconnect');
      }
    });
    
    this.connections.clear();
    this.subscriptions.clear();
    this.presenceData.clear();
    this.collaborationSessions.clear();
  }
}

// Real-time Context
const RealTimeContext = createContext(null);

// Real-time Provider
export const RealTimeProvider = ({ children, wsUrl, options = {} }) => {
  const [engine] = useState(() => new RealTimeEngine());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // Connect to WebSocket
    engine.connect(wsUrl, options);

    // Subscribe to connection events
    const unsubscribeConnected = engine.subscribe('connected', () => {
      setConnectionStatus('connected');
    });

    const unsubscribeDisconnected = engine.subscribe('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    const unsubscribeError = engine.subscribe('error', (data) => {
      setConnectionStatus('error');
      console.error('Real-time connection error:', data.error);
    });

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(engine.getMetrics());
    }, 5000);

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      clearInterval(metricsInterval);
      engine.disconnect();
    };
  }, [engine, wsUrl, options]);

  const value = {
    engine,
    connectionStatus,
    metrics,
    isConnected: connectionStatus === 'connected'
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Hook to use real-time features
export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

// Connection Status Component
const ConnectionStatus = () => {
  const { connectionStatus, metrics } = useRealTime();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: WifiIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Connected',
          description: 'Real-time features active'
        };
      case 'disconnected':
        return {
          icon: SignalSlashIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Disconnected',
          description: 'Attempting to reconnect...'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Connection Error',
          description: 'Check your internet connection'
        };
      default:
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Connecting',
          description: 'Establishing connection...'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`p-1 rounded-full ${config.bgColor}`}>
        <IconComponent className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="text-sm">
        <span className={`font-medium ${config.color}`}>{config.text}</span>
        {metrics.avgLatency && connectionStatus === 'connected' && (
          <span className="text-gray-500 ml-2">
            {Math.round(metrics.avgLatency)}ms
          </span>
        )}
      </div>
    </div>
  );
};

// Real-time Metrics Dashboard
const RealTimeMetrics = () => {
  const { metrics, connectionStatus } = useRealTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SignalIcon className="h-5 w-5" />
          <span>Real-time Metrics</span>
        </CardTitle>
        <CardDescription>
          Connection status and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Connection Status</Label>
            <ConnectionStatus />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Uptime</Label>
            <p className="text-lg font-semibold">
              {metrics.uptime ? Math.floor(metrics.uptime / 1000 / 60) : 0}m
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Messages Sent</Label>
            <p className="text-lg font-semibold">{metrics.messagesSent || 0}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Messages Received</Label>
            <p className="text-lg font-semibold">{metrics.messagesReceived || 0}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Avg Latency</Label>
            <p className="text-lg font-semibold">
              {metrics.avgLatency ? Math.round(metrics.avgLatency) : 0}ms
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Reconnections</Label>
            <p className="text-lg font-semibold">{metrics.reconnections || 0}</p>
          </div>
        </div>
        
        {metrics.queuedMessages > 0 && (
          <Alert>
            <InformationCircleIcon className="h-4 w-4" />
            <AlertTitle>Queued Messages</AlertTitle>
            <AlertDescription>
              {metrics.queuedMessages} messages waiting to be sent
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Real-time Presence Component
const RealTimePresence = ({ sessionId }) => {
  const { engine } = useRealTime();
  const { user } = useAuth();
  const [participants, setParticipants] = useState(new Map());

  useEffect(() => {
    // Join collaboration session
    engine.joinCollaborationSession(sessionId, {
      name: user.name,
      avatar: user.avatar,
      role: user.role
    });

    // Subscribe to presence updates
    const unsubscribe = engine.subscribe('presence_update', ({ userId, status, metadata }) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.set(userId, { status, metadata, lastSeen: Date.now() });
        return updated;
      });
    });

    // Update own presence
    engine.updatePresence('active', {
      page: window.location.pathname,
      timestamp: Date.now()
    });

    return () => {
      unsubscribe();
      engine.leaveCollaborationSession(sessionId);
    };
  }, [engine, sessionId, user]);

  const activeParticipants = Array.from(participants.entries())
    .filter(([_, data]) => data.status === 'active')
    .slice(0, 5); // Show max 5 participants

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {activeParticipants.map(([userId, data]) => (
          <Avatar key={userId} className="h-8 w-8 border-2 border-white">
            <AvatarImage src={data.metadata?.avatar} />
            <AvatarFallback className="text-xs">
              {data.metadata?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      {participants.size > 5 && (
        <Badge variant="secondary" className="text-xs">
          +{participants.size - 5} more
        </Badge>
      )}
      
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <EyeIcon className="h-4 w-4" />
        <span>{participants.size} online</span>
      </div>
    </div>
  );
};

// Real-time Notifications Component
const RealTimeNotifications = () => {
  const { engine } = useRealTime();
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = engine.subscribe('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show system notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
      
      // Add to notification system
      addNotification(notification);
    });

    return unsubscribe;
  }, [engine, addNotification]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5" />
          <span>Live Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent notifications
            </p>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`p-1 rounded-full ${
                  notification.type === 'success' ? 'bg-green-100' :
                  notification.type === 'error' ? 'bg-red-100' :
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {notification.type === 'success' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                  {notification.type === 'error' && <XCircleIcon className="h-4 w-4 text-red-600" />}
                  {notification.type === 'warning' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                  {notification.type === 'info' && <InformationCircleIcon className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time Data Sync Component
const RealTimeDataSync = ({ dataType, onDataUpdate }) => {
  const { engine } = useRealTime();
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    const unsubscribe = engine.subscribe('data_update', (update) => {
      if (update.type === dataType) {
        setSyncStatus('syncing');
        onDataUpdate(update.data);
        setLastSync(new Date());
        
        setTimeout(() => {
          setSyncStatus('synced');
        }, 500);
        
        setTimeout(() => {
          setSyncStatus('idle');
        }, 2000);
      }
    });

    return unsubscribe;
  }, [engine, dataType, onDataUpdate]);

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />;
      case 'synced':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      default:
        return <CloudIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {getSyncIcon()}
      <span>
        {syncStatus === 'syncing' && 'Syncing...'}
        {syncStatus === 'synced' && 'Synced'}
        {syncStatus === 'idle' && lastSync && `Last sync: ${lastSync.toLocaleTimeString()}`}
        {syncStatus === 'idle' && !lastSync && 'Waiting for updates'}
      </span>
    </div>
  );
};

// Main Real-time Features Component
const RealTimeFeatures = () => {
  const { engine, connectionStatus, metrics } = useRealTime();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Features</h1>
          <p className="text-gray-600">
            Live updates, collaboration, and notifications
          </p>
        </div>
        <ConnectionStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeMetrics />
        <RealTimeNotifications />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5" />
              <span>Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimePresence sessionId="main-session" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudIcon className="h-5 w-5" />
              <span>Data Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeDataSync 
              dataType="customers" 
              onDataUpdate={(data) => console.log('Customer data updated:', data)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>Live Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="font-semibold">{metrics.collaborationSessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Streams</span>
                <span className="font-semibold">{metrics.activeSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Queue Size</span>
                <span className="font-semibold">{metrics.queuedMessages || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeFeatures;
export { RealTimeEngine, RealTimeProvider, useRealTime, ConnectionStatus, RealTimePresence, RealTimeNotifications, RealTimeDataSync };