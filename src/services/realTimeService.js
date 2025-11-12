import { EventEmitter } from 'events';

class RealTimeService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.subscriptions = new Set();
    this.channelCallbacks = new Map(); // Store callbacks for channels
    this.dataCache = new Map();
    this.heartbeatInterval = null;
    this.lastHeartbeat = null;
  }

  // Initialize WebSocket connection
  connect(url = 'ws://localhost:8080/ws') {
    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  // Setup WebSocket event listeners
  setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
      
      // Resubscribe to previous subscriptions
      this.subscriptions.forEach(subscription => {
        this.send('subscribe', subscription);
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, channel, payload, timestamp } = data;

    // Update cache
    if (channel) {
      this.dataCache.set(channel, {
        data: payload,
        timestamp: timestamp || Date.now()
      });
    }

    // Call channel-specific callback if exists
    if (channel && this.channelCallbacks.has(channel)) {
      const callback = this.channelCallbacks.get(channel);
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in channel callback for ${channel}:`, error);
      }
    }

    // Handle different message types
    switch (type) {
      case 'heartbeat':
        this.lastHeartbeat = Date.now();
        break;
      case 'data':
        this.emit(`data:${channel}`, payload);
        this.emit('data', { channel, payload });
        break;
      case 'update':
        this.emit(`update:${channel}`, payload);
        this.emit('update', { channel, payload });
        break;
      case 'notification':
        this.emit('notification', payload);
        break;
      default:
        this.emit('message', data);
    }
  }

  // Send message to server
  send(type, data) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, message queued');
      return false;
    }

    try {
      this.ws.send(JSON.stringify({
        type,
        data,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  // Subscribe to real-time data channel
  subscribe(channel, callback = null) {
    this.subscriptions.add(channel);
    
    // Store callback if provided
    if (callback && typeof callback === 'function') {
      this.channelCallbacks.set(channel, callback);
    }
    
    return this.send('subscribe', { channel });
  }

  // Unsubscribe from data channel
  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.channelCallbacks.delete(channel); // Clean up callback
    return this.send('unsubscribe', { channel });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get cached data for a channel
  getCachedData(channel) {
    return this.dataCache.get(channel);
  }

  // Clear cache
  clearCache() {
    this.dataCache.clear();
  }

  // Disconnect WebSocket
  disconnect() {
    this.stopHeartbeat();
    this.subscriptions.clear();
    this.clearCache();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions),
      cacheSize: this.dataCache.size,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}

// Real-time analytics data generators (for demo purposes)
class RealTimeAnalytics {
  constructor(realTimeService) {
    this.service = realTimeService;
    this.intervals = new Map();
  }

  // Start generating live metrics
  startLiveMetrics() {
    // Live sales data
    this.intervals.set('sales', setInterval(() => {
      const salesData = {
        revenue: Math.floor(Math.random() * 10000) + 50000,
        deals: Math.floor(Math.random() * 20) + 10,
        leads: Math.floor(Math.random() * 50) + 100,
        conversion: (Math.random() * 20 + 15).toFixed(1),
        timestamp: Date.now()
      };
      this.service.emit('data:live-sales', salesData);
    }, 5000));

    // Live activity feed
    this.intervals.set('activity', setInterval(() => {
      const activities = [
        'New lead created',
        'Deal closed',
        'Meeting scheduled',
        'Email sent',
        'Call completed',
        'Proposal sent',
        'Contract signed'
      ];
      
      const activityData = {
        type: activities[Math.floor(Math.random() * activities.length)],
        user: `User ${Math.floor(Math.random() * 10) + 1}`,
        timestamp: Date.now(),
        value: Math.floor(Math.random() * 5000) + 1000
      };
      this.service.emit('data:live-activity', activityData);
    }, 3000));

    // Live performance metrics
    this.intervals.set('performance', setInterval(() => {
      const performanceData = {
        activeUsers: Math.floor(Math.random() * 50) + 100,
        responseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: (Math.random() * 2).toFixed(2),
        throughput: Math.floor(Math.random() * 1000) + 500,
        timestamp: Date.now()
      };
      this.service.emit('data:live-performance', performanceData);
    }, 2000));

    // Live team metrics
    this.intervals.set('team', setInterval(() => {
      const teamData = {
        onlineMembers: Math.floor(Math.random() * 20) + 30,
        activeTasks: Math.floor(Math.random() * 100) + 50,
        completedToday: Math.floor(Math.random() * 30) + 10,
        productivity: (Math.random() * 30 + 70).toFixed(1),
        timestamp: Date.now()
      };
      this.service.emit('data:live-team', teamData);
    }, 4000));
  }

  // Stop generating live metrics
  stopLiveMetrics() {
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  // Generate real-time notifications
  generateNotification(type, message, priority = 'normal') {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      priority,
      timestamp: Date.now(),
      read: false
    };
    
    this.service.emit('notification', notification);
    return notification;
  }

  // Simulate real-time alerts
  startAlertSystem() {
    this.intervals.set('alerts', setInterval(() => {
      const alertTypes = [
        { type: 'success', message: 'New deal closed successfully!', priority: 'high' },
        { type: 'warning', message: 'Lead response time exceeding threshold', priority: 'medium' },
        { type: 'info', message: 'Weekly report is ready for review', priority: 'low' },
        { type: 'error', message: 'System performance degraded', priority: 'high' }
      ];

      if (Math.random() < 0.3) { // 30% chance of alert
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        this.generateNotification(alert.type, alert.message, alert.priority);
      }
    }, 10000));
  }
}

// Create singleton instances
const realTimeService = new RealTimeService();
const realTimeAnalytics = new RealTimeAnalytics(realTimeService);

// Auto-start demo data generation
if (typeof window !== 'undefined') {
  // Start generating demo data after a short delay
  setTimeout(() => {
    realTimeAnalytics.startLiveMetrics();
    realTimeAnalytics.startAlertSystem();
  }, 2000);
}

export { realTimeService, realTimeAnalytics };
export default realTimeService;