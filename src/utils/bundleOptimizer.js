/**
 * Bundle Optimizer
 * Runtime bundle analysis and optimization utilities
 */

class BundleOptimizer {
  constructor() {
    this.bundleStats = {
      chunks: new Map(),
      dependencies: new Map(),
      loadTimes: new Map(),
      sizes: new Map(),
      duplicates: new Set(),
      unusedCode: new Set()
    };
    
    this.config = {
      enableAnalysis: true,
      enableTreeShaking: true,
      enableDuplicateDetection: true,
      enableUnusedCodeDetection: true,
      reportingInterval: 30000, // 30 seconds
      maxBundleSize: 250 * 1024, // 250KB
      maxChunkSize: 100 * 1024, // 100KB
      compressionThreshold: 1024 // 1KB
    };

    this.performanceObserver = null;
    this.mutationObserver = null;
    
    this.initializeObservers();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize performance observers
   */
  initializeObservers() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            this.analyzeResourceLoad(entry);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['resource'] });
    }

    // Monitor DOM changes for unused code detection
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        this.analyzeDOMChanges(mutations);
      });

      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id']
      });
    }
  }

  /**
   * Analyze resource loading performance
   */
  analyzeResourceLoad(entry) {
    const url = new URL(entry.name);
    const filename = url.pathname.split('/').pop();
    
    if (filename.includes('chunk') || filename.includes('bundle')) {
      const chunkInfo = {
        name: filename,
        size: entry.transferSize || entry.encodedBodySize,
        loadTime: entry.responseEnd - entry.requestStart,
        cached: entry.transferSize === 0,
        compressed: entry.encodedBodySize < entry.decodedBodySize,
        compressionRatio: entry.decodedBodySize > 0 
          ? (entry.encodedBodySize / entry.decodedBodySize).toFixed(2)
          : 1
      };

      this.bundleStats.chunks.set(filename, chunkInfo);
      this.bundleStats.loadTimes.set(filename, chunkInfo.loadTime);
      this.bundleStats.sizes.set(filename, chunkInfo.size);

      // Check if chunk exceeds size limits
      if (chunkInfo.size > this.config.maxChunkSize) {
        console.warn(`Large chunk detected: ${filename} (${this.formatBytes(chunkInfo.size)})`);
        this.suggestChunkOptimization(filename, chunkInfo);
      }
    }
  }

  /**
   * Analyze DOM changes for unused code detection
   */
  analyzeDOMChanges(mutations) {
    const usedClasses = new Set();
    const usedIds = new Set();

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.extractUsedSelectors(node, usedClasses, usedIds);
          }
        });
      }
    });

    // Update usage tracking
    this.updateSelectorUsage(usedClasses, usedIds);
  }

  /**
   * Extract used CSS selectors from DOM elements
   */
  extractUsedSelectors(element, usedClasses, usedIds) {
    if (element.className) {
      element.className.split(' ').forEach(cls => {
        if (cls.trim()) usedClasses.add(cls.trim());
      });
    }

    if (element.id) {
      usedIds.add(element.id);
    }

    // Recursively check children
    Array.from(element.children).forEach(child => {
      this.extractUsedSelectors(child, usedClasses, usedIds);
    });
  }

  /**
   * Update selector usage tracking
   */
  updateSelectorUsage(usedClasses, usedIds) {
    // This would integrate with CSS analysis to detect unused styles
    // For now, we'll track the selectors that are being used
    if (!this.usedSelectors) {
      this.usedSelectors = {
        classes: new Set(),
        ids: new Set()
      };
    }

    usedClasses.forEach(cls => this.usedSelectors.classes.add(cls));
    usedIds.forEach(id => this.usedSelectors.ids.add(id));
  }

  /**
   * Analyze bundle dependencies
   */
  analyzeDependencies() {
    if (!window.__webpack_require__) return;

    try {
      const modules = window.__webpack_require__.cache || {};
      const dependencyGraph = new Map();

      Object.keys(modules).forEach(moduleId => {
        const module = modules[moduleId];
        if (module && module.exports) {
          const dependencies = this.extractModuleDependencies(module);
          dependencyGraph.set(moduleId, dependencies);
        }
      });

      this.bundleStats.dependencies = dependencyGraph;
      this.detectDuplicateDependencies(dependencyGraph);
    } catch (error) {
      console.warn('Dependency analysis failed:', error);
    }
  }

  /**
   * Extract dependencies from a module
   */
  extractModuleDependencies(module) {
    const dependencies = [];
    
    try {
      // This is a simplified approach - in practice, you'd need more sophisticated analysis
      const moduleString = module.toString();
      const requireMatches = moduleString.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      
      requireMatches.forEach(match => {
        const dep = match.match(/require\(['"]([^'"]+)['"]\)/)[1];
        dependencies.push(dep);
      });
    } catch (error) {
      // Module analysis failed
    }

    return dependencies;
  }

  /**
   * Detect duplicate dependencies across chunks
   */
  detectDuplicateDependencies(dependencyGraph) {
    const dependencyCount = new Map();

    dependencyGraph.forEach((deps, moduleId) => {
      deps.forEach(dep => {
        if (!dependencyCount.has(dep)) {
          dependencyCount.set(dep, []);
        }
        dependencyCount.get(dep).push(moduleId);
      });
    });

    // Find dependencies that appear in multiple modules
    dependencyCount.forEach((modules, dep) => {
      if (modules.length > 1) {
        this.bundleStats.duplicates.add({
          dependency: dep,
          modules: modules,
          count: modules.length
        });
      }
    });
  }

  /**
   * Analyze code coverage for unused code detection
   */
  async analyzeCoverage() {
    if (!window.coverage) return;

    try {
      const coverage = window.coverage;
      const unusedCode = [];

      Object.keys(coverage).forEach(filename => {
        const fileCoverage = coverage[filename];
        const { s: statements, f: functions, b: branches } = fileCoverage;

        // Check for unused statements
        Object.keys(statements).forEach(statementId => {
          if (statements[statementId] === 0) {
            unusedCode.push({
              type: 'statement',
              file: filename,
              id: statementId
            });
          }
        });

        // Check for unused functions
        Object.keys(functions).forEach(functionId => {
          if (functions[functionId] === 0) {
            unusedCode.push({
              type: 'function',
              file: filename,
              id: functionId
            });
          }
        });
      });

      this.bundleStats.unusedCode = new Set(unusedCode);
    } catch (error) {
      console.warn('Coverage analysis failed:', error);
    }
  }

  /**
   * Suggest chunk optimization strategies
   */
  suggestChunkOptimization(chunkName, chunkInfo) {
    const suggestions = [];

    if (chunkInfo.size > this.config.maxChunkSize) {
      suggestions.push({
        type: 'size',
        message: `Chunk ${chunkName} is ${this.formatBytes(chunkInfo.size)}. Consider splitting into smaller chunks.`,
        priority: 'high'
      });
    }

    if (chunkInfo.loadTime > 1000) {
      suggestions.push({
        type: 'performance',
        message: `Chunk ${chunkName} takes ${chunkInfo.loadTime}ms to load. Consider preloading or lazy loading.`,
        priority: 'medium'
      });
    }

    if (!chunkInfo.compressed || chunkInfo.compressionRatio > 0.8) {
      suggestions.push({
        type: 'compression',
        message: `Chunk ${chunkName} has poor compression ratio (${chunkInfo.compressionRatio}). Enable gzip/brotli compression.`,
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Generate bundle analysis report
   */
  generateReport() {
    const totalSize = Array.from(this.bundleStats.sizes.values())
      .reduce((sum, size) => sum + size, 0);
    
    const avgLoadTime = Array.from(this.bundleStats.loadTimes.values())
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0);

    const report = {
      summary: {
        totalChunks: this.bundleStats.chunks.size,
        totalSize: this.formatBytes(totalSize),
        averageLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        duplicateDependencies: this.bundleStats.duplicates.size,
        unusedCodeBlocks: this.bundleStats.unusedCode.size
      },
      chunks: Array.from(this.bundleStats.chunks.entries()).map(([name, info]) => ({
        name,
        size: this.formatBytes(info.size),
        loadTime: `${info.loadTime}ms`,
        cached: info.cached,
        compressed: info.compressed,
        compressionRatio: info.compressionRatio,
        suggestions: this.suggestChunkOptimization(name, info)
      })),
      duplicates: Array.from(this.bundleStats.duplicates).map(dup => ({
        dependency: dup.dependency,
        occurrences: dup.count,
        modules: dup.modules
      })),
      unusedCode: Array.from(this.bundleStats.unusedCode).slice(0, 10), // Top 10
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Size-based recommendations
    const largeChunks = Array.from(this.bundleStats.chunks.entries())
      .filter(([, info]) => info.size > this.config.maxChunkSize);

    if (largeChunks.length > 0) {
      recommendations.push({
        category: 'Bundle Size',
        priority: 'high',
        description: `${largeChunks.length} chunks exceed the recommended size limit`,
        action: 'Split large chunks using dynamic imports or route-based splitting'
      });
    }

    // Performance-based recommendations
    const slowChunks = Array.from(this.bundleStats.chunks.entries())
      .filter(([, info]) => info.loadTime > 1000);

    if (slowChunks.length > 0) {
      recommendations.push({
        category: 'Load Performance',
        priority: 'medium',
        description: `${slowChunks.length} chunks have slow load times`,
        action: 'Implement preloading, use CDN, or optimize chunk content'
      });
    }

    // Duplicate dependencies
    if (this.bundleStats.duplicates.size > 0) {
      recommendations.push({
        category: 'Code Duplication',
        priority: 'medium',
        description: `${this.bundleStats.duplicates.size} duplicate dependencies found`,
        action: 'Configure webpack splitChunks to extract common dependencies'
      });
    }

    // Unused code
    if (this.bundleStats.unusedCode.size > 0) {
      recommendations.push({
        category: 'Dead Code',
        priority: 'low',
        description: `${this.bundleStats.unusedCode.size} unused code blocks detected`,
        action: 'Enable tree shaking and remove unused imports'
      });
    }

    return recommendations;
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.analyzeDependencies();
      this.analyzeCoverage();
      
      if (this.config.enableAnalysis) {
        const report = this.generateReport();
        this.logOptimizationInsights(report);
      }
    }, this.config.reportingInterval);
  }

  /**
   * Log optimization insights to console
   */
  logOptimizationInsights(report) {
    console.group('📊 Bundle Optimization Report');
    console.log('Summary:', report.summary);
    
    if (report.recommendations.length > 0) {
      console.group('🎯 Recommendations');
      report.recommendations.forEach(rec => {
        console.log(`${rec.priority.toUpperCase()}: ${rec.description}`);
        console.log(`Action: ${rec.action}`);
      });
      console.groupEnd();
    }

    if (report.chunks.some(chunk => chunk.suggestions.length > 0)) {
      console.group('⚠️ Chunk Issues');
      report.chunks
        .filter(chunk => chunk.suggestions.length > 0)
        .forEach(chunk => {
          console.log(`${chunk.name}:`, chunk.suggestions);
        });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get optimization suggestions for current page
   */
  getPageOptimizations() {
    const currentChunks = Array.from(this.bundleStats.chunks.keys())
      .filter(chunk => {
        // Check if chunk is loaded on current page
        return document.querySelector(`script[src*="${chunk}"]`) !== null;
      });

    return currentChunks.map(chunk => {
      const chunkInfo = this.bundleStats.chunks.get(chunk);
      return {
        chunk,
        ...chunkInfo,
        suggestions: this.suggestChunkOptimization(chunk, chunkInfo)
      };
    });
  }

  /**
   * Export bundle analysis data
   */
  exportAnalysis() {
    const report = this.generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `bundle-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  /**
   * Clean up observers
   */
  cleanup() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
}

// Create singleton instance
const bundleOptimizer = new BundleOptimizer();

// Export for use in development tools
if (typeof window !== 'undefined') {
  window.bundleOptimizer = bundleOptimizer;
}

export default bundleOptimizer;

// Utility functions
export const getBundleStats = () => bundleOptimizer.generateReport();
export const getPageOptimizations = () => bundleOptimizer.getPageOptimizations();
export const exportBundleAnalysis = () => bundleOptimizer.exportAnalysis();

// Development helper to log bundle info
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    const report = bundleOptimizer.generateReport();
    bundleOptimizer.logOptimizationInsights(report);
  }
};

// Webpack plugin integration helper
export const createBundleAnalysisPlugin = () => {
  return {
    name: 'bundle-analysis',
    apply(compiler) {
      compiler.hooks.done.tap('bundle-analysis', (stats) => {
        const compilation = stats.compilation;
        const chunks = Array.from(compilation.chunks);
        
        chunks.forEach(chunk => {
          const size = chunk.size();
          const files = Array.from(chunk.files);
          
          console.log(`Chunk: ${chunk.name || chunk.id}`);
          console.log(`Size: ${bundleOptimizer.formatBytes(size)}`);
          console.log(`Files: ${files.join(', ')}`);
          
          if (size > bundleOptimizer.config.maxChunkSize) {
            console.warn(`⚠️ Large chunk detected: ${chunk.name || chunk.id}`);
          }
        });
      });
    }
  };
};