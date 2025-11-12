// AI System Bootstrap Service
// Comprehensive initialization and coordination of all AI systems

import aiSystemIntegration from './aiSystemIntegration.js';
import { aiCacheService } from './aiCacheService.js';
import { performanceOptimizer, AIPerformanceConfig } from '../config/aiPerformanceConfig.js';

/**
 * AI System Bootstrap Service
 * Handles initialization, health monitoring, and graceful shutdown of all AI systems
 */
class AISystemBootstrap {
  constructor() {
    this.isInitialized = false;
    this.isShuttingDown = false;
    this.initializationPromise = null;
    this.healthCheckInterval = null;
    this.optimizationInterval = null;
    
    this.systemStatus = {
      status: 'not_initialized',
      components: {
        aiSystemIntegration: 'pending',
        cacheService: 'pending',
        performanceOptimizer: 'pending'
      },
      startTime: null,
      lastHealthCheck: null,
      errors: []
    };

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    this.handleUncaughtException = this.handleUncaughtException.bind(this);
    
    // Setup global error handlers
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize the entire AI system
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔄 AI System already initialized');
      return this.systemStatus;
    }

    if (this.initializationPromise) {
      console.log('⏳ AI System initialization in progress...');
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform the actual initialization
   */
  async _performInitialization() {
    try {
      console.log('🚀 Starting AI System Bootstrap...');
      this.systemStatus.status = 'initializing';
      this.systemStatus.startTime = new Date();

      // Phase 1: Initialize core services
      await this.initializeCoreServices();

      // Phase 2: Initialize AI system integration
      await this.initializeAISystem();

      // Phase 3: Setup monitoring and optimization
      await this.setupSystemMonitoring();

      // Phase 4: Perform initial health check
      await this.performInitialHealthCheck();

      // Phase 5: Setup periodic tasks
      this.setupPeriodicTasks();

      this.isInitialized = true;
      this.systemStatus.status = 'healthy';
      
      console.log('✅ AI System Bootstrap completed successfully');
      console.log('📊 System Status:', this.getSystemSummary());

      return this.systemStatus;

    } catch (error) {
      console.error('❌ AI System Bootstrap failed:', error);
      this.systemStatus.status = 'error';
      this.systemStatus.errors.push({
        timestamp: new Date(),
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Initialize core services
   */
  async initializeCoreServices() {
    console.log('🔧 Initializing core services...');

    try {
      // Initialize cache service
      console.log('  📦 Initializing cache service...');
      await aiCacheService.initialize();
      this.systemStatus.components.cacheService = 'healthy';
      console.log('  ✅ Cache service initialized');

      // Initialize performance optimizer
      console.log('  ⚡ Initializing performance optimizer...');
      performanceOptimizer.initialize();
      this.systemStatus.components.performanceOptimizer = 'healthy';
      console.log('  ✅ Performance optimizer initialized');

    } catch (error) {
      console.error('❌ Core services initialization failed:', error);
      throw new Error(`Core services initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize AI system integration
   */
  async initializeAISystem() {
    console.log('🤖 Initializing AI system integration...');

    try {
      // Wait for AI system to be ready
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (!aiSystemIntegration.isReady() && attempts < maxAttempts) {
        console.log(`  ⏳ Waiting for AI system... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!aiSystemIntegration.isReady()) {
        throw new Error('AI system failed to initialize within timeout period');
      }

      this.systemStatus.components.aiSystemIntegration = 'healthy';
      console.log('  ✅ AI system integration ready');

    } catch (error) {
      console.error('❌ AI system initialization failed:', error);
      this.systemStatus.components.aiSystemIntegration = 'error';
      throw new Error(`AI system initialization failed: ${error.message}`);
    }
  }

  /**
   * Setup system monitoring
   */
  async setupSystemMonitoring() {
    console.log('📊 Setting up system monitoring...');

    try {
      // Setup event listeners for AI system
      aiSystemIntegration.on('system:error', (error) => {
        console.error('🚨 AI System Error:', error);
        this.handleSystemError(error);
      });

      aiSystemIntegration.on('system:degraded', (status) => {
        console.warn('⚠️ AI System Degraded:', status);
        this.handleSystemDegradation(status);
      });

      aiSystemIntegration.on('system:recovered', (status) => {
        console.log('✅ AI System Recovered:', status);
        this.handleSystemRecovery(status);
      });

      console.log('  ✅ System monitoring setup complete');

    } catch (error) {
      console.error('❌ System monitoring setup failed:', error);
      throw new Error(`System monitoring setup failed: ${error.message}`);
    }
  }

  /**
   * Perform initial health check
   */
  async performInitialHealthCheck() {
    console.log('🏥 Performing initial health check...');

    try {
      // Check AI system health
      await aiSystemIntegration.performHealthCheck();
      
      // Check cache service health
      const cacheHealth = aiCacheService.healthCheck();
      if (cacheHealth.status !== 'healthy') {
        console.warn('⚠️ Cache service health check warning:', cacheHealth);
      }

      // Update system status
      this.systemStatus.lastHealthCheck = new Date();
      console.log('  ✅ Initial health check completed');

    } catch (error) {
      console.error('❌ Initial health check failed:', error);
      throw new Error(`Initial health check failed: ${error.message}`);
    }
  }

  /**
   * Setup periodic tasks
   */
  setupPeriodicTasks() {
    console.log('⏰ Setting up periodic tasks...');

    // Health check interval
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performPeriodicHealthCheck();
      } catch (error) {
        console.error('Periodic health check failed:', error);
      }
    }, AIPerformanceConfig.monitoring.healthCheckInterval || 30000);

    // System optimization interval
    this.optimizationInterval = setInterval(async () => {
      try {
        await this.performPeriodicOptimization();
      } catch (error) {
        console.error('Periodic optimization failed:', error);
      }
    }, AIPerformanceConfig.optimization.cacheOptimizationInterval || 300000);

    console.log('  ✅ Periodic tasks setup complete');
  }

  /**
   * Perform periodic health check
   */
  async performPeriodicHealthCheck() {
    if (this.isShuttingDown) return;

    try {
      await aiSystemIntegration.performHealthCheck();
      this.systemStatus.lastHealthCheck = new Date();
      
      // Update system status based on health check results
      const systemStatus = aiSystemIntegration.getSystemStatus();
      if (systemStatus.status !== this.systemStatus.status) {
        console.log(`🔄 System status changed: ${this.systemStatus.status} → ${systemStatus.status}`);
        this.systemStatus.status = systemStatus.status;
      }

    } catch (error) {
      console.error('Periodic health check error:', error);
      this.systemStatus.errors.push({
        timestamp: new Date(),
        error: 'Periodic health check failed',
        details: error.message
      });
    }
  }

  /**
   * Perform periodic optimization
   */
  async performPeriodicOptimization() {
    if (this.isShuttingDown) return;

    try {
      console.log('🔧 Performing periodic system optimization...');
      
      // Optimize AI system
      await aiSystemIntegration.optimizeSystem();
      
      // Optimize cache
      await aiCacheService.optimize();
      
      // Run performance optimizer
      performanceOptimizer.optimize();
      
      console.log('✅ Periodic optimization completed');

    } catch (error) {
      console.error('Periodic optimization error:', error);
    }
  }

  /**
   * Handle system errors
   */
  handleSystemError(error) {
    this.systemStatus.errors.push({
      timestamp: new Date(),
      type: 'system_error',
      error: error.message || error,
      severity: 'high'
    });

    // Implement error recovery strategies here
    console.log('🔄 Attempting error recovery...');
  }

  /**
   * Handle system degradation
   */
  handleSystemDegradation(status) {
    this.systemStatus.status = 'degraded';
    console.log('⚠️ System operating in degraded mode');
    
    // Implement degradation handling strategies here
  }

  /**
   * Handle system recovery
   */
  handleSystemRecovery(status) {
    this.systemStatus.status = 'healthy';
    console.log('✅ System recovered to healthy state');
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    } else if (typeof process !== 'undefined') {
      process.on('unhandledRejection', this.handleUnhandledRejection);
      process.on('uncaughtException', this.handleUncaughtException);
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    
    this.systemStatus.errors.push({
      timestamp: new Date(),
      type: 'unhandled_rejection',
      error: event.reason?.message || event.reason,
      severity: 'medium'
    });

    // Prevent default handling
    event.preventDefault();
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException(error) {
    console.error('🚨 Uncaught Exception:', error);
    
    this.systemStatus.errors.push({
      timestamp: new Date(),
      type: 'uncaught_exception',
      error: error.message,
      stack: error.stack,
      severity: 'critical'
    });
  }

  /**
   * Get system summary
   */
  getSystemSummary() {
    const uptime = this.systemStatus.startTime 
      ? Date.now() - this.systemStatus.startTime.getTime()
      : 0;

    return {
      status: this.systemStatus.status,
      uptime: Math.floor(uptime / 1000), // seconds
      components: this.systemStatus.components,
      errorCount: this.systemStatus.errors.length,
      lastHealthCheck: this.systemStatus.lastHealthCheck,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Get detailed system status
   */
  getDetailedStatus() {
    return {
      ...this.systemStatus,
      aiSystem: aiSystemIntegration.isReady() ? aiSystemIntegration.getSystemStatus() : null,
      cache: aiCacheService.getStatistics(),
      performance: performanceOptimizer.getMetrics?.() || {},
      uptime: this.systemStatus.startTime 
        ? Date.now() - this.systemStatus.startTime.getTime()
        : 0
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    if (this.isShuttingDown) {
      console.log('🔄 Shutdown already in progress...');
      return;
    }

    console.log('🔄 Starting AI System shutdown...');
    this.isShuttingDown = true;

    try {
      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.optimizationInterval) {
        clearInterval(this.optimizationInterval);
        this.optimizationInterval = null;
      }

      // Shutdown AI system
      if (aiSystemIntegration.isReady()) {
        await aiSystemIntegration.shutdown();
      }

      // Shutdown cache service
      await aiCacheService.shutdown();

      // Remove global error handlers
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      } else if (typeof process !== 'undefined') {
        process.removeListener('unhandledRejection', this.handleUnhandledRejection);
        process.removeListener('uncaughtException', this.handleUncaughtException);
      }

      this.isInitialized = false;
      this.systemStatus.status = 'shutdown';

      console.log('✅ AI System shutdown completed');

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Check if system is ready
   */
  isReady() {
    return this.isInitialized && this.systemStatus.status === 'healthy';
  }

  /**
   * Wait for system to be ready
   */
  async waitForReady(timeout = 60000) {
    const startTime = Date.now();
    
    while (!this.isReady() && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.isReady()) {
      throw new Error('AI System failed to become ready within timeout');
    }
    
    return true;
  }
}

// Create singleton instance
const aiSystemBootstrap = new AISystemBootstrap();

// Auto-initialize on import (can be disabled by setting environment variable)
if (typeof process === 'undefined' || process.env.AI_AUTO_INIT !== 'false') {
  // Initialize after a short delay to allow other modules to load
  setTimeout(() => {
    aiSystemBootstrap.initialize().catch(error => {
      console.error('Auto-initialization failed:', error);
    });
  }, 100);
}

export default aiSystemBootstrap;
export { AISystemBootstrap };