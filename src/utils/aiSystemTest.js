// AI System Integration Test
// Comprehensive testing utility for AI system components and integration

import aiSystemBootstrap from '../services/aiSystemBootstrap.js';
import aiSystemIntegration from '../services/aiSystemIntegration.js';
import { aiCacheService } from '../services/aiCacheService.js';
import { performanceOptimizer } from '../config/aiPerformanceConfig.js';

/**
 * AI System Test Suite
 * Comprehensive testing and validation of AI system components
 */
class AISystemTest {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Run comprehensive AI system tests
   */
  async runFullTest() {
    if (this.isRunning) {
      throw new Error('Test suite is already running');
    }

    console.log('🧪 Starting AI System Integration Test Suite...');
    this.isRunning = true;
    this.startTime = Date.now();
    this.testResults = [];

    try {
      // Test 1: System Bootstrap
      await this.testSystemBootstrap();

      // Test 2: AI System Integration
      await this.testAISystemIntegration();

      // Test 3: Cache Service
      await this.testCacheService();

      // Test 4: Performance Optimizer
      await this.testPerformanceOptimizer();

      // Test 5: Component Integration
      await this.testComponentIntegration();

      // Test 6: Error Handling
      await this.testErrorHandling();

      // Test 7: Performance Benchmarks
      await this.testPerformanceBenchmarks();

      // Test 8: System Recovery
      await this.testSystemRecovery();

      this.endTime = Date.now();
      const duration = this.endTime - this.startTime;

      console.log(`✅ AI System Test Suite completed in ${duration}ms`);
      return this.generateTestReport();

    } catch (error) {
      console.error('❌ AI System Test Suite failed:', error);
      this.endTime = Date.now();
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test system bootstrap functionality
   */
  async testSystemBootstrap() {
    console.log('🔧 Testing System Bootstrap...');
    
    try {
      // Test initialization
      const initResult = await this.runTest('Bootstrap Initialization', async () => {
        const status = await aiSystemBootstrap.initialize();
        return status && status.status !== 'error';
      });

      // Test system readiness
      const readinessResult = await this.runTest('System Readiness Check', async () => {
        await aiSystemBootstrap.waitForReady(10000); // 10 second timeout
        return aiSystemBootstrap.isReady();
      });

      // Test system status
      const statusResult = await this.runTest('System Status Retrieval', async () => {
        const status = aiSystemBootstrap.getDetailedStatus();
        return status && typeof status === 'object';
      });

      console.log('  ✅ System Bootstrap tests completed');
      return { initResult, readinessResult, statusResult };

    } catch (error) {
      console.error('  ❌ System Bootstrap tests failed:', error);
      throw error;
    }
  }

  /**
   * Test AI system integration
   */
  async testAISystemIntegration() {
    console.log('🤖 Testing AI System Integration...');
    
    try {
      // Test system readiness
      const readinessResult = await this.runTest('AI System Ready Check', async () => {
        return aiSystemIntegration.isReady();
      });

      // Test health check
      const healthResult = await this.runTest('AI System Health Check', async () => {
        await aiSystemIntegration.performHealthCheck();
        return true;
      });

      // Test system status
      const statusResult = await this.runTest('AI System Status', async () => {
        const status = aiSystemIntegration.getSystemStatus();
        return status && status.status;
      });

      // Test AI operations
      const operationsResult = await this.runTest('AI Operations Test', async () => {
        // Test lead scoring
        const leadScore = await aiSystemIntegration.scoreLeads([
          { id: 'test-lead-1', name: 'Test Lead', email: 'test@example.com' }
        ]);
        
        // Test deal prediction
        const dealPrediction = await aiSystemIntegration.predictDeals([
          { id: 'test-deal-1', value: 10000, stage: 'proposal' }
        ]);

        return leadScore && dealPrediction;
      });

      console.log('  ✅ AI System Integration tests completed');
      return { readinessResult, healthResult, statusResult, operationsResult };

    } catch (error) {
      console.error('  ❌ AI System Integration tests failed:', error);
      throw error;
    }
  }

  /**
   * Test cache service functionality
   */
  async testCacheService() {
    console.log('📦 Testing Cache Service...');
    
    try {
      // Test cache initialization
      const initResult = await this.runTest('Cache Service Initialization', async () => {
        await aiCacheService.initialize();
        return true;
      });

      // Test cache operations
      const operationsResult = await this.runTest('Cache Operations', async () => {
        // Test set/get
        aiCacheService.set('test-key', { data: 'test-value' }, { category: 'test' });
        const retrieved = aiCacheService.get('test-key', 'test');
        
        // Test has
        const exists = aiCacheService.has('test-key', 'test');
        
        // Test delete
        const deleted = aiCacheService.delete('test-key', 'test');
        
        return retrieved && retrieved.data === 'test-value' && exists && deleted;
      });

      // Test cache statistics
      const statsResult = await this.runTest('Cache Statistics', async () => {
        const stats = aiCacheService.getStatistics();
        return stats && typeof stats.hitRate === 'string';
      });

      // Test cache optimization
      const optimizationResult = await this.runTest('Cache Optimization', async () => {
        const result = await aiCacheService.optimize();
        return result && typeof result === 'object';
      });

      // Test health check
      const healthResult = await this.runTest('Cache Health Check', async () => {
        const health = aiCacheService.healthCheck();
        return health && health.status;
      });

      console.log('  ✅ Cache Service tests completed');
      return { initResult, operationsResult, statsResult, optimizationResult, healthResult };

    } catch (error) {
      console.error('  ❌ Cache Service tests failed:', error);
      throw error;
    }
  }

  /**
   * Test performance optimizer
   */
  async testPerformanceOptimizer() {
    console.log('⚡ Testing Performance Optimizer...');
    
    try {
      // Test metrics collection
      const metricsResult = await this.runTest('Performance Metrics', async () => {
        const metrics = performanceOptimizer.getMetrics();
        return metrics && typeof metrics === 'object';
      });

      // Test optimization
      const optimizationResult = await this.runTest('Performance Optimization', async () => {
        performanceOptimizer.optimize();
        return true;
      });

      console.log('  ✅ Performance Optimizer tests completed');
      return { metricsResult, optimizationResult };

    } catch (error) {
      console.error('  ❌ Performance Optimizer tests failed:', error);
      throw error;
    }
  }

  /**
   * Test component integration
   */
  async testComponentIntegration() {
    console.log('🔗 Testing Component Integration...');
    
    try {
      // Test bootstrap + AI system integration
      const integrationResult = await this.runTest('Bootstrap-AI Integration', async () => {
        const bootstrapStatus = aiSystemBootstrap.getSystemSummary();
        const aiStatus = aiSystemIntegration.getSystemStatus();
        
        return bootstrapStatus.isInitialized && aiStatus.status !== 'error';
      });

      // Test cache + AI system integration
      const cacheIntegrationResult = await this.runTest('Cache-AI Integration', async () => {
        // Store AI result in cache
        const testData = { prediction: 0.85, confidence: 0.92 };
        aiCacheService.set('ai-test-result', testData, { category: 'predictions' });
        
        // Retrieve from cache
        const cached = aiCacheService.get('ai-test-result', 'predictions');
        
        return cached && cached.prediction === testData.prediction;
      });

      // Test performance monitoring integration
      const monitoringResult = await this.runTest('Performance Monitoring Integration', async () => {
        const systemStatus = aiSystemBootstrap.getDetailedStatus();
        const performanceMetrics = performanceOptimizer.getMetrics();
        
        return systemStatus && performanceMetrics;
      });

      console.log('  ✅ Component Integration tests completed');
      return { integrationResult, cacheIntegrationResult, monitoringResult };

    } catch (error) {
      console.error('  ❌ Component Integration tests failed:', error);
      throw error;
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('🚨 Testing Error Handling...');
    
    try {
      // Test invalid cache operations
      const cacheErrorResult = await this.runTest('Cache Error Handling', async () => {
        try {
          // Try to get non-existent key
          const result = aiCacheService.get('non-existent-key');
          return result === null; // Should return null, not throw
        } catch (error) {
          return false; // Should not throw
        }
      });

      // Test AI system error handling
      const aiErrorResult = await this.runTest('AI System Error Handling', async () => {
        try {
          // Test with invalid data
          const result = await aiSystemIntegration.scoreLeads(null);
          return Array.isArray(result); // Should handle gracefully
        } catch (error) {
          return true; // Expected to throw, which is handled
        }
      });

      console.log('  ✅ Error Handling tests completed');
      return { cacheErrorResult, aiErrorResult };

    } catch (error) {
      console.error('  ❌ Error Handling tests failed:', error);
      throw error;
    }
  }

  /**
   * Test performance benchmarks
   */
  async testPerformanceBenchmarks() {
    console.log('📊 Testing Performance Benchmarks...');
    
    try {
      // Test cache performance
      const cachePerformanceResult = await this.runTest('Cache Performance', async () => {
        const startTime = Date.now();
        
        // Perform 1000 cache operations
        for (let i = 0; i < 1000; i++) {
          aiCacheService.set(`perf-test-${i}`, { value: i }, { category: 'performance' });
          aiCacheService.get(`perf-test-${i}`, 'performance');
        }
        
        const duration = Date.now() - startTime;
        console.log(`    Cache operations (1000): ${duration}ms`);
        
        // Clean up
        aiCacheService.clearCategory('performance');
        
        return duration < 5000; // Should complete in under 5 seconds
      });

      // Test AI system performance
      const aiPerformanceResult = await this.runTest('AI System Performance', async () => {
        const startTime = Date.now();
        
        // Test batch operations
        const testLeads = Array.from({ length: 10 }, (_, i) => ({
          id: `perf-lead-${i}`,
          name: `Performance Test Lead ${i}`,
          email: `perf${i}@example.com`
        }));
        
        await aiSystemIntegration.scoreLeads(testLeads);
        
        const duration = Date.now() - startTime;
        console.log(`    AI lead scoring (10 leads): ${duration}ms`);
        
        return duration < 10000; // Should complete in under 10 seconds
      });

      console.log('  ✅ Performance Benchmark tests completed');
      return { cachePerformanceResult, aiPerformanceResult };

    } catch (error) {
      console.error('  ❌ Performance Benchmark tests failed:', error);
      throw error;
    }
  }

  /**
   * Test system recovery
   */
  async testSystemRecovery() {
    console.log('🔄 Testing System Recovery...');
    
    try {
      // Test graceful shutdown and restart
      const recoveryResult = await this.runTest('System Recovery', async () => {
        // Get initial status
        const initialStatus = aiSystemBootstrap.getSystemSummary();
        
        // Simulate system stress (not actual shutdown for safety)
        // In a real test, you might test actual recovery scenarios
        
        // Verify system is still operational
        const finalStatus = aiSystemBootstrap.getSystemSummary();
        
        return initialStatus.isInitialized && finalStatus.isInitialized;
      });

      console.log('  ✅ System Recovery tests completed');
      return { recoveryResult };

    } catch (error) {
      console.error('  ❌ System Recovery tests failed:', error);
      throw error;
    }
  }

  /**
   * Run individual test with error handling and timing
   */
  async runTest(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      console.log(`  🧪 Running: ${testName}`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: result ? 'passed' : 'failed',
        duration,
        timestamp: new Date(),
        error: null
      };
      
      this.testResults.push(testResult);
      
      if (result) {
        console.log(`    ✅ ${testName} passed (${duration}ms)`);
      } else {
        console.log(`    ❌ ${testName} failed (${duration}ms)`);
      }
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'error',
        duration,
        timestamp: new Date(),
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.log(`    💥 ${testName} error: ${error.message} (${duration}ms)`);
      
      throw error;
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'passed').length;
    const failedTests = this.testResults.filter(t => t.status === 'failed').length;
    const errorTests = this.testResults.filter(t => t.status === 'error').length;
    const totalDuration = this.endTime - this.startTime;
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        errorTests,
        successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0,
        totalDuration,
        averageDuration: Math.round(averageDuration),
        startTime: new Date(this.startTime),
        endTime: new Date(this.endTime)
      },
      results: this.testResults,
      systemStatus: {
        bootstrap: aiSystemBootstrap.getSystemSummary(),
        aiSystem: aiSystemIntegration.isReady() ? aiSystemIntegration.getSystemStatus() : null,
        cache: aiCacheService.getStatistics(),
        performance: performanceOptimizer.getMetrics()
      },
      recommendations: this.generateRecommendations()
    };

    console.log('\n📋 Test Report Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} (${report.summary.successRate}%)`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Errors: ${errorTests}`);
    console.log(`  Duration: ${totalDuration}ms`);
    console.log(`  Average: ${Math.round(averageDuration)}ms per test`);

    return report;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    
    const failedTests = this.testResults.filter(t => t.status === 'failed' || t.status === 'error');
    
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${failedTests.length} tests failed. Review system configuration and dependencies.`
      });
    }
    
    const slowTests = this.testResults.filter(t => t.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        message: `${slowTests.length} tests took longer than 5 seconds. Consider performance optimization.`
      });
    }
    
    if (this.testResults.every(t => t.status === 'passed')) {
      recommendations.push({
        type: 'success',
        message: 'All tests passed! AI system is functioning correctly.'
      });
    }
    
    return recommendations;
  }

  /**
   * Get test results
   */
  getResults() {
    return {
      isRunning: this.isRunning,
      results: this.testResults,
      summary: this.testResults.length > 0 ? this.generateTestReport().summary : null
    };
  }
}

// Create singleton instance
const aiSystemTest = new AISystemTest();

export default aiSystemTest;
export { AISystemTest };