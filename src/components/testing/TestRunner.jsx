import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Bug,
  Zap,
  Shield,
  Database,
  Globe,
  Smartphone,
  Eye,
  Users,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  const testSuites = [
    {
      id: 'unit',
      name: 'Unit Tests',
      description: 'Component and utility function tests',
      icon: <FileText className="h-5 w-5" />,
      tests: [
        { id: 'components', name: 'React Components', status: 'pending', duration: 0, errors: [] },
        { id: 'utils', name: 'Utility Functions', status: 'pending', duration: 0, errors: [] },
        { id: 'hooks', name: 'Custom Hooks', status: 'pending', duration: 0, errors: [] },
        { id: 'services', name: 'API Services', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      description: 'Component interaction and data flow tests',
      icon: <Database className="h-5 w-5" />,
      tests: [
        { id: 'api-integration', name: 'API Integration', status: 'pending', duration: 0, errors: [] },
        { id: 'state-management', name: 'State Management', status: 'pending', duration: 0, errors: [] },
        { id: 'routing', name: 'Navigation & Routing', status: 'pending', duration: 0, errors: [] },
        { id: 'data-flow', name: 'Data Flow', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'e2e',
      name: 'End-to-End Tests',
      description: 'Full user workflow tests',
      icon: <Users className="h-5 w-5" />,
      tests: [
        { id: 'user-auth', name: 'User Authentication', status: 'pending', duration: 0, errors: [] },
        { id: 'contact-management', name: 'Contact Management', status: 'pending', duration: 0, errors: [] },
        { id: 'deal-pipeline', name: 'Deal Pipeline', status: 'pending', duration: 0, errors: [] },
        { id: 'reporting', name: 'Reports & Analytics', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Load time and responsiveness tests',
      icon: <Zap className="h-5 w-5" />,
      tests: [
        { id: 'load-time', name: 'Page Load Times', status: 'pending', duration: 0, errors: [] },
        { id: 'bundle-size', name: 'Bundle Size Analysis', status: 'pending', duration: 0, errors: [] },
        { id: 'memory-usage', name: 'Memory Usage', status: 'pending', duration: 0, errors: [] },
        { id: 'api-response', name: 'API Response Times', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'security',
      name: 'Security Tests',
      description: 'Security vulnerability and compliance tests',
      icon: <Shield className="h-5 w-5" />,
      tests: [
        { id: 'auth-security', name: 'Authentication Security', status: 'pending', duration: 0, errors: [] },
        { id: 'data-encryption', name: 'Data Encryption', status: 'pending', duration: 0, errors: [] },
        { id: 'xss-protection', name: 'XSS Protection', status: 'pending', duration: 0, errors: [] },
        { id: 'csrf-protection', name: 'CSRF Protection', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'accessibility',
      name: 'Accessibility Tests',
      description: 'WCAG compliance and usability tests',
      icon: <Eye className="h-5 w-5" />,
      tests: [
        { id: 'keyboard-nav', name: 'Keyboard Navigation', status: 'pending', duration: 0, errors: [] },
        { id: 'screen-reader', name: 'Screen Reader Support', status: 'pending', duration: 0, errors: [] },
        { id: 'color-contrast', name: 'Color Contrast', status: 'pending', duration: 0, errors: [] },
        { id: 'aria-labels', name: 'ARIA Labels', status: 'pending', duration: 0, errors: [] }
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile Tests',
      description: 'Mobile responsiveness and PWA tests',
      icon: <Smartphone className="h-5 w-5" />,
      tests: [
        { id: 'responsive-design', name: 'Responsive Design', status: 'pending', duration: 0, errors: [] },
        { id: 'touch-interactions', name: 'Touch Interactions', status: 'pending', duration: 0, errors: [] },
        { id: 'pwa-features', name: 'PWA Features', status: 'pending', duration: 0, errors: [] },
        { id: 'offline-mode', name: 'Offline Mode', status: 'pending', duration: 0, errors: [] }
      ]
    }
  ];

  const [suites, setSuites] = useState(testSuites);

  const testMetrics = [
    { name: 'Passed', value: 0, color: '#10b981' },
    { name: 'Failed', value: 0, color: '#ef4444' },
    { name: 'Pending', value: 28, color: '#f59e0b' },
    { name: 'Skipped', value: 0, color: '#6b7280' }
  ];

  const [metrics, setMetrics] = useState(testMetrics);

  const performanceData = [
    { time: '0s', cpu: 20, memory: 45, network: 0 },
    { time: '5s', cpu: 35, memory: 52, network: 15 },
    { time: '10s', cpu: 60, memory: 68, network: 30 },
    { time: '15s', cpu: 45, memory: 71, network: 25 },
    { time: '20s', cpu: 30, memory: 65, network: 10 },
    { time: '25s', cpu: 25, memory: 58, network: 5 },
    { time: '30s', cpu: 22, memory: 50, network: 2 }
  ];

  useEffect(() => {
    if (isRunning) {
      runTests();
    }
  }, [isRunning]);

  const runTests = async () => {
    const allTests = suites.flatMap(suite => 
      suite.tests.map(test => ({ ...test, suiteId: suite.id }))
    );
    
    let completedTests = 0;
    
    for (const test of allTests) {
      if (!isRunning) break;
      
      setCurrentTest(`${test.suiteId}.${test.id}`);
      
      // Update test status to running
      setSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(t => 
          t.id === test.id && suite.id === test.suiteId
            ? { ...t, status: 'running' }
            : t
        )
      })));
      
      // Simulate test execution
      const duration = Math.random() * 3000 + 500; // 0.5-3.5 seconds
      await new Promise(resolve => setTimeout(resolve, duration));
      
      if (!isRunning) break;
      
      // Simulate test result (90% pass rate)
      const passed = Math.random() > 0.1;
      const errors = passed ? [] : [
        `AssertionError: Expected 'true' but received 'false'`,
        `TypeError: Cannot read property 'length' of undefined`
      ].slice(0, Math.floor(Math.random() * 2) + 1);
      
      // Update test status
      setSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(t => 
          t.id === test.id && suite.id === test.suiteId
            ? { 
                ...t, 
                status: passed ? 'passed' : 'failed',
                duration: Math.round(duration),
                errors
              }
            : t
        )
      })));
      
      completedTests++;
      setOverallProgress((completedTests / allTests.length) * 100);
      
      // Update metrics
      setMetrics(prev => {
        const newMetrics = [...prev];
        const pendingIndex = newMetrics.findIndex(m => m.name === 'Pending');
        const targetIndex = newMetrics.findIndex(m => m.name === (passed ? 'Passed' : 'Failed'));
        
        if (pendingIndex !== -1) newMetrics[pendingIndex].value--;
        if (targetIndex !== -1) newMetrics[targetIndex].value++;
        
        return newMetrics;
      });
    }
    
    setIsRunning(false);
    setCurrentTest(null);
  };

  const handleStartTests = () => {
    setIsRunning(true);
    setOverallProgress(0);
    
    // Reset all tests
    setSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending',
        duration: 0,
        errors: []
      }))
    })));
    
    // Reset metrics
    setMetrics([
      { name: 'Passed', value: 0, color: '#10b981' },
      { name: 'Failed', value: 0, color: '#ef4444' },
      { name: 'Pending', value: 28, color: '#f59e0b' },
      { name: 'Skipped', value: 0, color: '#6b7280' }
    ]);
  };

  const handleStopTests = () => {
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStats = () => {
    const allTests = suites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      running: allTests.filter(t => t.status === 'running').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  };

  const stats = getTotalStats();

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Test Runner</h1>
          <p className="text-muted-foreground">Comprehensive testing suite for system stability</p>
        </div>
        <div className="flex items-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStartTests} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
          ) : (
            <Button onClick={handleStopTests} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Tests
            </Button>
          )}
        </div>
      </motion.div>

      {/* Overall Progress */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Running Tests...</span>
              </CardTitle>
              {currentTest && (
                <CardDescription>Currently testing: {currentTest}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Progress value={overallProgress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{Math.round(overallProgress)}% Complete</span>
                <span>{stats.passed + stats.failed} of {stats.total} tests</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Across all suites</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% failure rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting execution</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-6">
            {suites.map((suite) => (
              <motion.div
                key={suite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {suite.icon}
                      <div>
                        <CardTitle>{suite.name}</CardTitle>
                        <CardDescription>{suite.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suite.tests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <span className="font-medium">{test.name}</span>
                            <Badge className={getStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {test.duration > 0 && (
                              <span>{test.duration}ms</span>
                            )}
                            {test.errors.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {test.errors.length} error{test.errors.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Distribution</CardTitle>
                <CardDescription>Overview of test results</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: metric.color }}
                      />
                      <span className="text-sm">{metric.name}: {metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Failed Tests</CardTitle>
                <CardDescription>Tests that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suites.flatMap(suite => 
                    suite.tests
                      .filter(test => test.status === 'failed')
                      .map(test => (
                        <div key={`${suite.id}-${test.id}`} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="font-medium">{suite.name} - {test.name}</span>
                          </div>
                          <div className="space-y-1">
                            {test.errors.map((error, index) => (
                              <div key={index} className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                  {suites.flatMap(suite => suite.tests).filter(test => test.status === 'failed').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <p>No failed tests! 🎉</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance During Tests</CardTitle>
              <CardDescription>CPU, memory, and network usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={2} name="Network %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Coverage</CardTitle>
                <CardDescription>Test coverage across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Components</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilities</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Services</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hooks</span>
                      <span>91%</span>
                    </div>
                    <Progress value={91} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                API Services coverage is below the 80% threshold. Consider adding more integration tests.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestRunner;