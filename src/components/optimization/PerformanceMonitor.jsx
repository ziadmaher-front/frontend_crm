import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  MemoryStick, 
  Cpu, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { performanceMonitor, componentAnalyzer } from '@/utils/performanceOptimizer.js';

/**
 * Performance monitoring dashboard component
 */
const PerformanceMonitor = ({ 
  isVisible = false, 
  onClose,
  enableRealTimeMonitoring = true,
  showDetailedMetrics = false 
}) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: { used: 0, total: 0 },
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    networkLatency: 0,
    componentCount: 0,
    reRenderCount: 0
  });
  
  const [performanceScore, setPerformanceScore] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Calculate FPS
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      return fps;
    }
    
    frameCountRef.current++;
    return null;
  }, []);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      };
    }
    return { used: 0, total: 0 };
  }, []);

  // Get network information
  const getNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    return { effectiveType: 'unknown', downlink: 0, rtt: 0 };
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = useCallback((currentMetrics) => {
    let score = 100;
    
    // FPS score (60 FPS = perfect)
    if (currentMetrics.fps < 30) score -= 30;
    else if (currentMetrics.fps < 45) score -= 15;
    else if (currentMetrics.fps < 55) score -= 5;
    
    // Memory usage score
    const memoryUsagePercent = (currentMetrics.memory.used / currentMetrics.memory.total) * 100;
    if (memoryUsagePercent > 80) score -= 20;
    else if (memoryUsagePercent > 60) score -= 10;
    else if (memoryUsagePercent > 40) score -= 5;
    
    // Load time score
    if (currentMetrics.loadTime > 3000) score -= 20;
    else if (currentMetrics.loadTime > 2000) score -= 10;
    else if (currentMetrics.loadTime > 1000) score -= 5;
    
    // Network latency score
    if (currentMetrics.networkLatency > 200) score -= 15;
    else if (currentMetrics.networkLatency > 100) score -= 8;
    else if (currentMetrics.networkLatency > 50) score -= 3;
    
    return Math.max(0, Math.min(100, score));
  }, []);

  // Generate performance alerts
  const generateAlerts = useCallback((currentMetrics) => {
    const newAlerts = [];
    
    if (currentMetrics.fps < 30) {
      newAlerts.push({
        type: 'error',
        message: 'Low FPS detected. Consider optimizing animations and renders.',
        metric: 'fps',
        value: currentMetrics.fps
      });
    }
    
    const memoryUsagePercent = (currentMetrics.memory.used / currentMetrics.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      newAlerts.push({
        type: 'warning',
        message: 'High memory usage detected. Check for memory leaks.',
        metric: 'memory',
        value: `${memoryUsagePercent.toFixed(1)}%`
      });
    }
    
    if (currentMetrics.loadTime > 3000) {
      newAlerts.push({
        type: 'warning',
        message: 'Slow page load time. Consider code splitting and lazy loading.',
        metric: 'loadTime',
        value: `${currentMetrics.loadTime}ms`
      });
    }
    
    if (currentMetrics.reRenderCount > 10) {
      newAlerts.push({
        type: 'info',
        message: 'High re-render count. Consider memoization.',
        metric: 'reRenders',
        value: currentMetrics.reRenderCount
      });
    }
    
    return newAlerts;
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const fps = calculateFPS();
    const memory = getMemoryUsage();
    const networkInfo = getNetworkInfo();
    
    const newMetrics = {
      fps: fps || metrics.fps,
      memory,
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
      renderTime: performance.now(),
      bundleSize: 0, // Would need to be calculated during build
      networkLatency: networkInfo.rtt || 0,
      componentCount: document.querySelectorAll('[data-react-component]').length,
      reRenderCount: componentAnalyzer.getTotalRerenders()
    };
    
    setMetrics(newMetrics);
    setPerformanceScore(calculatePerformanceScore(newMetrics));
    setAlerts(generateAlerts(newMetrics));
  }, [metrics.fps, calculateFPS, getMemoryUsage, getNetworkInfo, calculatePerformanceScore, generateAlerts]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsMonitoring(false);
    } else {
      intervalRef.current = setInterval(updateMetrics, 1000);
      setIsMonitoring(true);
    }
  }, [isMonitoring, updateMetrics]);

  // Auto-start monitoring when component becomes visible
  useEffect(() => {
    if (isVisible && enableRealTimeMonitoring && !isMonitoring) {
      toggleMonitoring();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, enableRealTimeMonitoring, isMonitoring, toggleMonitoring]);

  // Performance score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Alert icon
  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-4 z-50 bg-background/95 backdrop-blur-sm rounded-lg border shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Performance Monitor</h2>
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'Live' : 'Paused'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMonitoring}
              >
                {isMonitoring ? 'Pause' : 'Start'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {/* Performance Score */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                    {performanceScore}
                  </div>
                  <div className="flex-1">
                    <Progress value={performanceScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">FPS</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.fps}</div>
                  <div className="text-xs text-muted-foreground">frames/sec</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.memory.used}</div>
                  <div className="text-xs text-muted-foreground">MB used</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Load Time</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round(metrics.loadTime)}</div>
                  <div className="text-xs text-muted-foreground">ms</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Latency</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.networkLatency}</div>
                  <div className="text-xs text-muted-foreground">ms</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            {showDetailedMetrics && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Components:</span>
                      <span className="ml-2 font-medium">{metrics.componentCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Re-renders:</span>
                      <span className="ml-2 font-medium">{metrics.reRenderCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory Total:</span>
                      <span className="ml-2 font-medium">{metrics.memory.total} MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Render Time:</span>
                      <span className="ml-2 font-medium">{Math.round(metrics.renderTime)} ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded border">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{alert.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {alert.metric}: {alert.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  
  return {
    isVisible,
    show,
    hide,
    toggle,
    PerformanceMonitor: (props) => (
      <PerformanceMonitor 
        {...props} 
        isVisible={isVisible} 
        onClose={hide} 
      />
    )
  };
};

export default PerformanceMonitor;