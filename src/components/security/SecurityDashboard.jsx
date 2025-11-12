import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Key,
  Smartphone,
  Mail,
  Settings,
  Scan,
  Database,
  FileText,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { AdvancedSecurityService } from '@/services/advancedSecurity';

const SecurityDashboard = () => {
  const [securityService] = useState(() => new AdvancedSecurityService());
  const [mfaSetup, setMfaSetup] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [threatDetectionEnabled, setThreatDetectionEnabled] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  
  const [securityMetrics, setSecurityMetrics] = useState({
    overallScore: 87,
    threats: {
      blocked: 1247,
      detected: 23,
      resolved: 1198,
      riskScore: 3.2
    },
    compliance: {
      gdpr: 95,
      sox: 88,
      hipaa: 92,
      iso27001: 85
    },
    authentication: {
      ssoUsers: 342,
      mfaEnabled: 89,
      failedLogins: 12,
      activeSessions: 156,
      suspiciousLogins: 3
    },
    encryption: {
      fieldsEncrypted: 156,
      keysRotated: 8,
      certificatesExpiring: 2,
      dataClassified: 98.5
    },
    incidents: {
      open: 2,
      resolved: 45,
      critical: 0,
      avgResolutionTime: 4.2
    }
  });

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(() => {
      updateRealTimeMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const logs = await securityService.getAuditLogs();
      setAuditLogs(logs.slice(0, 10));
      const analysis = await securityService.performRiskAnalysis('user123');
      setRiskAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const updateRealTimeMetrics = async () => {
    try {
      setSecurityMetrics(prev => ({
        ...prev,
        threats: {
          ...prev.threats,
          blocked: prev.threats.blocked + Math.floor(Math.random() * 5),
          detected: Math.max(0, prev.threats.detected + Math.floor(Math.random() * 3) - 1)
        },
        authentication: {
          ...prev.authentication,
          activeSessions: prev.authentication.activeSessions + Math.floor(Math.random() * 10) - 5
        }
      }));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const handleMfaSetup = async () => {
    try {
      const mfaData = await securityService.setupMFA('user123');
      setMfaSetup(true);
      console.log('MFA Setup:', mfaData);
    } catch (error) {
      console.error('MFA setup failed:', error);
    }
  };

  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      description: 'User john.doe@company.com has 5 failed login attempts',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'SSL Certificate Renewal',
      description: 'SSL certificate for api.company.com renewed successfully',
      timestamp: '1 hour ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      title: 'Suspicious API Activity',
      description: 'Unusual API access pattern detected from IP 192.168.1.100',
      timestamp: '3 hours ago',
      severity: 'high'
    }
  ]);

  const threatTrendData = [
    { name: 'Mon', blocked: 45, detected: 3, risk: 2.1 },
    { name: 'Tue', blocked: 52, detected: 1, risk: 1.8 },
    { name: 'Wed', blocked: 38, detected: 5, risk: 3.2 },
    { name: 'Thu', blocked: 67, detected: 2, risk: 2.5 },
    { name: 'Fri', blocked: 71, detected: 4, risk: 3.1 },
    { name: 'Sat', blocked: 29, detected: 1, risk: 1.5 },
    { name: 'Sun', blocked: 33, detected: 2, risk: 2.0 }
  ];

  const sessionAnalyticsData = [
    { time: '00:00', active: 12, suspicious: 0 },
    { time: '04:00', active: 8, suspicious: 1 },
    { time: '08:00', active: 45, suspicious: 2 },
    { time: '12:00', active: 89, suspicious: 1 },
    { time: '16:00', active: 156, suspicious: 3 },
    { time: '20:00', active: 78, suspicious: 1 },
    { time: '24:00', active: 34, suspicious: 0 }
  ];

  const encryptionStatusData = [
    { category: 'Customer Data', encrypted: 98, total: 100 },
    { category: 'Financial Records', encrypted: 100, total: 100 },
    { category: 'Communications', encrypted: 85, total: 100 },
    { category: 'System Logs', encrypted: 92, total: 100 },
    { category: 'Backups', encrypted: 100, total: 100 }
  ];

  const complianceData = [
    { name: 'GDPR', value: 95, color: '#10b981' },
    { name: 'SOX', value: 88, color: '#3b82f6' },
    { name: 'HIPAA', value: 92, color: '#8b5cf6' },
    { name: 'ISO 27001', value: 85, color: '#f59e0b' }
  ];

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your security posture</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <div className="text-right">
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityMetrics.overallScore)}`}>
              {securityMetrics.overallScore}%
            </div>
            <div className="text-sm text-muted-foreground">Security Score</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{securityMetrics.threats.blocked}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />+12% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{securityMetrics.threats.riskScore}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />-0.3 from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.authentication.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                {securityMetrics.authentication.suspiciousLogins} suspicious logins
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Encrypted</CardTitle>
              <Lock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.encryption.dataClassified}%</div>
              <p className="text-xs text-muted-foreground">
                {securityMetrics.encryption.fieldsEncrypted} fields protected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.incidents.open}</div>
              <p className="text-xs text-muted-foreground">
                {securityMetrics.incidents.avgResolutionTime}h avg resolution
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="mfa">MFA & Auth</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Trends</CardTitle>
                <CardDescription>Weekly threat detection and blocking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={threatTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="detected" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Health</CardTitle>
                <CardDescription>Current security status indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Firewall Status</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SSL Certificates</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Backup Status</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Vulnerability Scan</span>
                  </div>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Analysis</CardTitle>
                <CardDescription>Detailed threat detection and response metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={threatTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="blocked" fill="#10b981" />
                    <Bar dataKey="detected" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Weekly risk score trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={threatTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Scores</CardTitle>
                <CardDescription>Current compliance status across frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Details</CardTitle>
                <CardDescription>Detailed compliance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Multi-Factor Authentication</span>
                </CardTitle>
                <CardDescription>Configure and manage MFA settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable MFA</h4>
                    <p className="text-sm text-muted-foreground">Require second factor for authentication</p>
                  </div>
                  <Switch checked={mfaSetup} onCheckedChange={setMfaSetup} />
                </div>
                
                {!mfaSetup && (
                  <Button onClick={handleMfaSetup} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Setup MFA
                  </Button>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TOTP Apps</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Backup</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Backup</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Analytics</CardTitle>
                <CardDescription>Session and login analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sessionAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="suspicious" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Encryption Status</span>
                </CardTitle>
                <CardDescription>Monitor encryption coverage across data categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {encryptionStatusData.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">{item.encrypted}%</span>
                    </div>
                    <Progress value={item.encrypted} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Encryption Controls</CardTitle>
                <CardDescription>Manage encryption settings and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Encrypt Sensitive Data</h4>
                    <p className="text-sm text-muted-foreground">Automatically encrypt classified data</p>
                  </div>
                  <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
                </div>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Rotate Encryption Keys
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Key Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Scan className="h-4 w-4 mr-2" />
                    Scan for Unencrypted Data
                  </Button>
                </div>
                
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    {securityMetrics.encryption.certificatesExpiring} SSL certificates expiring within 30 days
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real-time Monitoring</span>
                </CardTitle>
                <CardDescription>Live security monitoring and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Threat Detection</h4>
                    <p className="text-sm text-muted-foreground">AI-powered threat detection</p>
                  </div>
                  <Switch checked={threatDetectionEnabled} onCheckedChange={setThreatDetectionEnabled} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{securityMetrics.threats.blocked}</div>
                    <div className="text-xs text-muted-foreground">Threats Blocked</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{securityMetrics.threats.detected}</div>
                    <div className="text-xs text-muted-foreground">Under Investigation</div>
                  </div>
                </div>
                
                {riskAnalysis && (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Current risk level: <strong>{riskAnalysis.riskLevel}</strong> 
                      (Score: {riskAnalysis.riskScore}/10)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Recent security events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {auditLogs.length > 0 ? auditLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 border rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground">{log.details}</div>
                        <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                      </div>
                      <Badge variant={log.severity === 'high' ? 'destructive' : 'secondary'}>
                        {log.severity}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No audit logs available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>Latest security events and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;