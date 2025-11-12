import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Server, 
  Database, 
  Shield, 
  Globe, 
  Zap, 
  Monitor, 
  FileText, 
  Settings, 
  Cloud, 
  Lock, 
  Activity, 
  Users, 
  Rocket, 
  Download, 
  Upload, 
  RefreshCw,
  CheckSquare,
  Square,
  Play,
  Pause,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ProductionReadiness = () => {
  const [checklistProgress, setChecklistProgress] = useState(0);
  const [deploymentConfig, setDeploymentConfig] = useState({
    environment: 'production',
    domain: 'crm.company.com',
    ssl: true,
    cdn: true,
    monitoring: true,
    backups: true,
    scaling: 'auto'
  });
  const [environmentVars, setEnvironmentVars] = useState([
    { key: 'NODE_ENV', value: 'production', required: true, secure: false },
    { key: 'DATABASE_URL', value: '***hidden***', required: true, secure: true },
    { key: 'JWT_SECRET', value: '***hidden***', required: true, secure: true },
    { key: 'SMTP_HOST', value: 'smtp.company.com', required: true, secure: false },
    { key: 'REDIS_URL', value: '***hidden***', required: true, secure: true },
    { key: 'CDN_URL', value: 'https://cdn.company.com', required: false, secure: false }
  ]);
  const [showSecrets, setShowSecrets] = useState(false);

  const readinessChecks = [
    {
      category: 'Infrastructure',
      icon: Server,
      checks: [
        { id: 'server-setup', name: 'Production Server Configuration', status: 'completed', critical: true },
        { id: 'load-balancer', name: 'Load Balancer Setup', status: 'completed', critical: true },
        { id: 'ssl-certificate', name: 'SSL Certificate Installation', status: 'completed', critical: true },
        { id: 'cdn-setup', name: 'CDN Configuration', status: 'completed', critical: false },
        { id: 'firewall', name: 'Firewall Rules', status: 'completed', critical: true },
        { id: 'backup-system', name: 'Backup System', status: 'in-progress', critical: true }
      ]
    },
    {
      category: 'Database',
      icon: Database,
      checks: [
        { id: 'db-optimization', name: 'Database Optimization', status: 'completed', critical: true },
        { id: 'db-backup', name: 'Database Backup Strategy', status: 'completed', critical: true },
        { id: 'db-monitoring', name: 'Database Monitoring', status: 'completed', critical: true },
        { id: 'db-scaling', name: 'Database Scaling Plan', status: 'pending', critical: false },
        { id: 'db-security', name: 'Database Security', status: 'completed', critical: true },
        { id: 'db-migration', name: 'Migration Scripts', status: 'completed', critical: true }
      ]
    },
    {
      category: 'Security',
      icon: Shield,
      checks: [
        { id: 'security-audit', name: 'Security Audit', status: 'completed', critical: true },
        { id: 'vulnerability-scan', name: 'Vulnerability Scanning', status: 'completed', critical: true },
        { id: 'access-control', name: 'Access Control Setup', status: 'completed', critical: true },
        { id: 'encryption', name: 'Data Encryption', status: 'completed', critical: true },
        { id: 'security-headers', name: 'Security Headers', status: 'completed', critical: true },
        { id: 'penetration-test', name: 'Penetration Testing', status: 'in-progress', critical: false }
      ]
    },
    {
      category: 'Performance',
      icon: Zap,
      checks: [
        { id: 'performance-test', name: 'Performance Testing', status: 'completed', critical: true },
        { id: 'load-test', name: 'Load Testing', status: 'completed', critical: true },
        { id: 'caching', name: 'Caching Strategy', status: 'completed', critical: false },
        { id: 'optimization', name: 'Code Optimization', status: 'completed', critical: false },
        { id: 'monitoring-setup', name: 'Performance Monitoring', status: 'completed', critical: true },
        { id: 'alerting', name: 'Alert Configuration', status: 'completed', critical: true }
      ]
    },
    {
      category: 'Monitoring',
      icon: Monitor,
      checks: [
        { id: 'uptime-monitoring', name: 'Uptime Monitoring', status: 'completed', critical: true },
        { id: 'error-tracking', name: 'Error Tracking', status: 'completed', critical: true },
        { id: 'log-aggregation', name: 'Log Aggregation', status: 'completed', critical: true },
        { id: 'metrics-dashboard', name: 'Metrics Dashboard', status: 'completed', critical: false },
        { id: 'alerting-rules', name: 'Alerting Rules', status: 'completed', critical: true },
        { id: 'health-checks', name: 'Health Check Endpoints', status: 'completed', critical: true }
      ]
    },
    {
      category: 'Documentation',
      icon: FileText,
      checks: [
        { id: 'deployment-guide', name: 'Deployment Guide', status: 'completed', critical: true },
        { id: 'api-docs', name: 'API Documentation', status: 'completed', critical: false },
        { id: 'user-manual', name: 'User Manual', status: 'completed', critical: false },
        { id: 'troubleshooting', name: 'Troubleshooting Guide', status: 'in-progress', critical: true },
        { id: 'runbook', name: 'Operations Runbook', status: 'pending', critical: true },
        { id: 'disaster-recovery', name: 'Disaster Recovery Plan', status: 'pending', critical: true }
      ]
    }
  ];

  const deploymentSteps = [
    { id: 1, name: 'Pre-deployment Checks', status: 'completed', duration: '15 min' },
    { id: 2, name: 'Database Migration', status: 'completed', duration: '10 min' },
    { id: 3, name: 'Build Application', status: 'completed', duration: '5 min' },
    { id: 4, name: 'Deploy to Staging', status: 'completed', duration: '8 min' },
    { id: 5, name: 'Run Integration Tests', status: 'completed', duration: '20 min' },
    { id: 6, name: 'Deploy to Production', status: 'ready', duration: '12 min' },
    { id: 7, name: 'Post-deployment Verification', status: 'pending', duration: '10 min' },
    { id: 8, name: 'Monitor & Validate', status: 'pending', duration: '30 min' }
  ];

  const performanceMetrics = [
    { name: 'Response Time', current: 180, target: 200, unit: 'ms', status: 'good' },
    { name: 'Throughput', current: 1200, target: 1000, unit: 'req/min', status: 'excellent' },
    { name: 'Error Rate', current: 0.1, target: 0.5, unit: '%', status: 'excellent' },
    { name: 'CPU Usage', current: 45, target: 70, unit: '%', status: 'good' },
    { name: 'Memory Usage', current: 60, target: 80, unit: '%', status: 'good' },
    { name: 'Disk Usage', current: 35, target: 80, unit: '%', status: 'excellent' }
  ];

  const securityChecks = [
    { name: 'HTTPS Enabled', status: 'passed', critical: true },
    { name: 'Security Headers', status: 'passed', critical: true },
    { name: 'Input Validation', status: 'passed', critical: true },
    { name: 'Authentication', status: 'passed', critical: true },
    { name: 'Authorization', status: 'passed', critical: true },
    { name: 'Data Encryption', status: 'passed', critical: true },
    { name: 'SQL Injection Protection', status: 'passed', critical: true },
    { name: 'XSS Protection', status: 'passed', critical: true },
    { name: 'CSRF Protection', status: 'passed', critical: true },
    { name: 'Rate Limiting', status: 'warning', critical: false }
  ];

  useEffect(() => {
    const totalChecks = readinessChecks.reduce((acc, category) => acc + category.checks.length, 0);
    const completedChecks = readinessChecks.reduce((acc, category) => 
      acc + category.checks.filter(check => check.status === 'completed').length, 0
    );
    setChecklistProgress((completedChecks / totalChecks) * 100);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Square className="h-4 w-4 text-gray-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const deployToProduction = () => {
    // Simulate deployment process
    console.log('Starting production deployment...');
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Production Readiness</h1>
          <p className="text-muted-foreground">System deployment validation and configuration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={deployToProduction}
            className="bg-green-600 hover:bg-green-700"
            disabled={checklistProgress < 90}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Deploy to Production
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Checklist
          </Button>
        </div>
      </motion.div>

      {/* Overall Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Production Readiness Score</CardTitle>
          <CardDescription>Overall system readiness for production deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold text-green-600">
              {Math.round(checklistProgress)}%
            </div>
            <Badge className={checklistProgress >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {checklistProgress >= 90 ? 'Ready for Production' : 'Needs Attention'}
            </Badge>
          </div>
          <Progress value={checklistProgress} className="h-3 mb-4" />
          
          {checklistProgress < 90 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete all critical checks before deploying to production. 
                {Math.ceil((90 - checklistProgress) / 100 * readinessChecks.reduce((acc, cat) => acc + cat.checks.length, 0))} items remaining.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Readiness Checklist</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readinessChecks.map((category, index) => {
              const Icon = category.icon;
              const completedChecks = category.checks.filter(check => check.status === 'completed').length;
              const criticalPending = category.checks.filter(check => check.critical && check.status !== 'completed').length;
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-6 w-6 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg">{category.category}</CardTitle>
                            <CardDescription>
                              {completedChecks}/{category.checks.length} completed
                            </CardDescription>
                          </div>
                        </div>
                        {criticalPending > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {criticalPending} critical
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={(completedChecks / category.checks.length) * 100} 
                        className="mb-4" 
                      />
                      
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {category.checks.map((check) => (
                            <div key={check.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(check.status)}
                                <span className="text-sm">{check.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {check.critical && (
                                  <Badge variant="outline" className="text-xs">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Pipeline</CardTitle>
                <CardDescription>Automated deployment process steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4 p-3 border rounded">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Estimated: {step.duration}
                        </div>
                      </div>
                      {step.status === 'ready' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Current system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                            {metric.current}{metric.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {metric.target}{metric.unit}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Validation</CardTitle>
              <CardDescription>Security checks and compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(check.status)}
                      <span className="text-sm">{check.name}</span>
                    </div>
                    {check.critical && (
                      <Badge variant="outline" className="text-xs">
                        Critical
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Configuration</CardTitle>
                <CardDescription>Production deployment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Input
                    id="environment"
                    value={deploymentConfig.environment}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={deploymentConfig.domain}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ssl">SSL/TLS Enabled</Label>
                  <Switch
                    id="ssl"
                    checked={deploymentConfig.ssl}
                    onCheckedChange={(checked) => setDeploymentConfig(prev => ({ ...prev, ssl: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cdn">CDN Enabled</Label>
                  <Switch
                    id="cdn"
                    checked={deploymentConfig.cdn}
                    onCheckedChange={(checked) => setDeploymentConfig(prev => ({ ...prev, cdn: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="monitoring">Monitoring Enabled</Label>
                  <Switch
                    id="monitoring"
                    checked={deploymentConfig.monitoring}
                    onCheckedChange={(checked) => setDeploymentConfig(prev => ({ ...prev, monitoring: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="backups">Automated Backups</Label>
                  <Switch
                    id="backups"
                    checked={deploymentConfig.backups}
                    onCheckedChange={(checked) => setDeploymentConfig(prev => ({ ...prev, backups: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Environment Variables</CardTitle>
                    <CardDescription>Production environment configuration</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {environmentVars.map((envVar, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{envVar.key}</div>
                          <div className="text-xs text-muted-foreground">
                            {envVar.secure && !showSecrets ? '***hidden***' : envVar.value}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {envVar.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {envVar.secure && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Healthy</div>
                <div className="text-sm text-muted-foreground">All systems operational</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Last 30 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">180ms</div>
                <div className="text-sm text-muted-foreground">Average response</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring Setup</CardTitle>
              <CardDescription>Production monitoring and alerting configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Health Checks</h4>
                  <div className="space-y-2">
                    {[
                      'Application Health',
                      'Database Connectivity',
                      'External API Status',
                      'Cache Availability',
                      'File System Access'
                    ].map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{check}</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Alert Rules</h4>
                  <div className="space-y-2">
                    {[
                      'High Error Rate (>1%)',
                      'Slow Response Time (>500ms)',
                      'High CPU Usage (>80%)',
                      'High Memory Usage (>90%)',
                      'Database Connection Issues'
                    ].map((rule, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{rule}</span>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionReadiness;