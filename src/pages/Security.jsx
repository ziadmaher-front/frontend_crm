import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Shield, 
  Key, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Lock,
  Eye,
  Activity
} from 'lucide-react';

import TwoFactorAuth from '../components/TwoFactorAuth';
import RoleBasedAccess from '../components/RoleBasedAccess';
import AuditLogs from '../components/AuditLogs';

const SecurityOverview = () => {
  const securityMetrics = {
    twoFactorEnabled: 85,
    activeUsers: 24,
    failedLogins: 3,
    auditEvents: 1247,
    lastSecurityScan: '2024-01-15',
    vulnerabilities: 0,
    complianceScore: 98
  };

  const securityAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      description: '3 failed login attempts detected from IP 192.168.1.100',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Security Scan Completed',
      description: 'Weekly security scan completed successfully with no vulnerabilities found',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Compliance Check Passed',
      description: 'All compliance requirements met for GDPR and SOC 2',
      timestamp: '3 days ago'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">2FA Adoption</p>
                <p className="text-2xl font-bold">{securityMetrics.twoFactorEnabled}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{securityMetrics.activeUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold">{securityMetrics.failedLogins}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Events</p>
                <p className="text-2xl font-bold">{securityMetrics.auditEvents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Security Scan</span>
              <Badge variant="secondary">{securityMetrics.lastSecurityScan}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vulnerabilities</span>
              <Badge className="bg-green-100 text-green-800">
                {securityMetrics.vulnerabilities} Found
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Score</span>
              <Badge className="bg-blue-100 text-blue-800">
                {securityMetrics.complianceScore}%
              </Badge>
            </div>
            <Button className="w-full mt-4">
              <Settings className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Security = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-gray-600">Manage security settings, access controls, and audit logs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <Lock className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="2fa" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>2FA</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Access Control</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SecurityOverview />
        </TabsContent>

        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Enhance your account security with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFactorAuth />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <RoleBasedAccess />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Security;