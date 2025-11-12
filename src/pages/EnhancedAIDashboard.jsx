// Enhanced AI Dashboard
// Comprehensive dashboard for AI system monitoring and control

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Psychology as AIIcon,
  Speed as PerformanceIcon,
  Storage as CacheIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  AutoFixHigh as OptimizeIcon,
  Memory as MemoryIcon,
  CloudQueue as ProcessingIcon,
  Group as TeamIcon,
  AttachMoney as RevenueIcon,
  Person as LeadIcon,
  Business as DealIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAISystem, useAIPerformance } from '../hooks/useAISystem';

const EnhancedAIDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // Use AI system hooks
  const aiSystem = useAISystem({
    autoRefresh,
    refreshInterval: 3000,
    enableRealTimeUpdates: true
  });

  const aiPerformance = useAIPerformance({
    refreshInterval: 2000,
    maxHistoryLength: 100
  });

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'error': return 'error';
      case 'initializing': return 'info';
      default: return 'default';
    }
  };

  // Engine icons mapping
  const getEngineIcon = (engineName) => {
    const iconMap = {
      advanced: <AIIcon />,
      automation: <ProcessingIcon />,
      customerJourney: <TimelineIcon />,
      revenue: <RevenueIcon />,
      collaborative: <TeamIcon />
    };
    return iconMap[engineName] || <AIIcon />;
  };

  // Performance chart data
  const performanceChartData = useMemo(() => {
    return aiPerformance.performanceHistory.map((entry, index) => ({
      time: index,
      responseTime: entry.averageResponseTime || 0,
      successRate: ((entry.successfulRequests || 0) / (entry.totalRequests || 1)) * 100,
      cacheEfficiency: entry.cacheEfficiency || 0,
      totalRequests: entry.totalRequests || 0
    }));
  }, [aiPerformance.performanceHistory]);

  // Engine utilization data
  const engineUtilizationData = useMemo(() => {
    const utilization = aiSystem.metrics.engineUtilization || {};
    return Object.entries(utilization).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value || 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [aiSystem.metrics.engineUtilization]);

  // System overview cards
  const SystemOverviewCards = () => (
    <Grid container spacing={3}>
      {/* System Status */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Chip
                  label={aiSystem.systemStatus.status}
                  color={getStatusColor(aiSystem.systemStatus.status)}
                  icon={aiSystem.isReady ? <CheckCircleIcon /> : <WarningIcon />}
                />
              </Box>
              <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Requests */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4" color="primary">
                  {aiSystem.metrics.totalRequests || 0}
                </Typography>
              </Box>
              <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Success Rate */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h4" color="success.main">
                  {aiSystem.metrics.totalRequests > 0 
                    ? ((aiSystem.metrics.successfulRequests / aiSystem.metrics.totalRequests) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Box>
              <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Cache Efficiency */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Cache Efficiency
                </Typography>
                <Typography variant="h4" color="info.main">
                  {(aiSystem.metrics.cacheEfficiency || 0).toFixed(1)}%
                </Typography>
              </Box>
              <CacheIcon color="info" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Engine status grid
  const EngineStatusGrid = () => (
    <Grid container spacing={2}>
      {Object.entries(aiSystem.systemStatus.engines || {}).map(([name, status]) => (
        <Grid item xs={12} sm={6} md={4} key={name}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { elevation: 4 }
            }}
            onClick={() => setSelectedEngine(name)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" spacing={2}>
                <Box sx={{ mr: 2 }}>
                  {getEngineIcon(name)}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6">
                    {name.charAt(0).toUpperCase() + name.slice(1)} Engine
                  </Typography>
                  <Chip
                    size="small"
                    label={status}
                    color={getStatusColor(status)}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Utilization: {aiSystem.metrics.engineUtilization?.[name] || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Performance charts
  const PerformanceCharts = () => (
    <Grid container spacing={3}>
      {/* Response Time Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Response Time Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Success Rate Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Success Rate & Cache Efficiency
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="successRate" 
                  stackId="1"
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                />
                <Area 
                  type="monotone" 
                  dataKey="cacheEfficiency" 
                  stackId="2"
                  stroke="#ffc658" 
                  fill="#ffc658"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Engine Utilization */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Engine Utilization
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engineUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Request Volume */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Request Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="totalRequests" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // AI Operations Panel
  const AIOperationsPanel = () => (
    <Grid container spacing={3}>
      {/* Lead Operations */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LeadIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Lead Operations</Typography>
            </Box>
            <List dense>
              <ListItem button onClick={() => handleAIOperation('lead:score')}>
                <ListItemText primary="Score Lead" secondary="AI-powered lead scoring" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('lead:qualify')}>
                <ListItemText primary="Qualify Lead" secondary="Intelligent lead qualification" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('lead:enrich')}>
                <ListItemText primary="Enrich Lead" secondary="Data enrichment and insights" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Deal Operations */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <DealIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Deal Operations</Typography>
            </Box>
            <List dense>
              <ListItem button onClick={() => handleAIOperation('deal:predict')}>
                <ListItemText primary="Predict Deal" secondary="Deal outcome prediction" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('deal:optimize')}>
                <ListItemText primary="Optimize Deal" secondary="Deal optimization strategies" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('deal:forecast')}>
                <ListItemText primary="Forecast Deal" secondary="Revenue forecasting" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Operations */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TimelineIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Customer Operations</Typography>
            </Box>
            <List dense>
              <ListItem button onClick={() => handleAIOperation('customer:analyze')}>
                <ListItemText primary="Analyze Customer" secondary="Behavior analysis" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('customer:journey')}>
                <ListItemText primary="Map Journey" secondary="Customer journey mapping" />
              </ListItem>
              <ListItem button onClick={() => handleAIOperation('customer:segment')}>
                <ListItemText primary="Segment Customer" secondary="Intelligent segmentation" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Handle AI operations
  const handleAIOperation = async (operation) => {
    try {
      // This would typically open a dialog or form for the specific operation
      console.log(`Executing AI operation: ${operation}`);
      setTestDialogOpen(true);
    } catch (error) {
      console.error('AI operation failed:', error);
    }
  };

  // Control panel
  const ControlPanel = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Now">
            <IconButton onClick={aiSystem.refreshSystemStatus} disabled={aiSystem.isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Optimize System">
            <IconButton onClick={aiSystem.optimizeSystem} disabled={aiSystem.isLoading}>
              <OptimizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Health Check">
            <IconButton onClick={aiSystem.performHealthCheck} disabled={aiSystem.isLoading}>
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {aiSystem.isLoading && <CircularProgress size={20} />}
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Enhanced AI Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive AI system monitoring and control center
        </Typography>
      </Box>

      {/* Error Alert */}
      {aiSystem.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={aiSystem.clearError}
        >
          {aiSystem.error}
        </Alert>
      )}

      {/* Control Panel */}
      <ControlPanel />

      {/* Main Content */}
      <Box>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Performance" icon={<PerformanceIcon />} />
          <Tab label="Engines" icon={<AIIcon />} />
          <Tab label="Operations" icon={<ProcessingIcon />} />
        </Tabs>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <Box>
            <SystemOverviewCards />
            <Box mt={3}>
              <Typography variant="h5" gutterBottom>
                Engine Status
              </Typography>
              <EngineStatusGrid />
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <PerformanceCharts />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <EngineStatusGrid />
            {/* Additional engine details would go here */}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <AIOperationsPanel />
          </Box>
        )}
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI System Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            AI system configuration and advanced settings would be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Operation Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)}>
        <DialogTitle>AI Operation Test</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            AI operation testing interface would be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setTestDialogOpen(false)}>
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedAIDashboard;