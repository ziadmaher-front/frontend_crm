// AI System Status Component
// Real-time monitoring and status display for the AI system

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  Settings,
  TrendingUp,
  TrendingDown,
  Memory,
  Speed,
  Storage,
  NetworkCheck,
  Psychology,
  AutoAwesome,
  Analytics,
  Timeline,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import aiSystemBootstrap from '../services/aiSystemBootstrap.js';
import { useAISystem } from '../hooks/useAISystem.js';

const AISystemStatus = ({ compact = false, showDetails = true }) => {
  const theme = useTheme();
  const { systemStatus, isLoading, error, refreshStatus } = useAISystem();
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    metrics: true,
    alerts: true
  });

  // Auto-refresh system status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshStatus]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'ready':
        return theme.palette.success.main;
      case 'warning':
      case 'degraded':
        return theme.palette.warning.main;
      case 'error':
      case 'critical':
      case 'failed':
        return theme.palette.error.main;
      case 'initializing':
      case 'loading':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  }, [theme]);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'ready':
        return <CheckCircle sx={{ color: getStatusColor(status) }} />;
      case 'warning':
      case 'degraded':
        return <Warning sx={{ color: getStatusColor(status) }} />;
      case 'error':
      case 'critical':
      case 'failed':
        return <Error sx={{ color: getStatusColor(status) }} />;
      case 'initializing':
      case 'loading':
        return <CircularProgress size={20} sx={{ color: getStatusColor(status) }} />;
      default:
        return <Info sx={{ color: getStatusColor(status) }} />;
    }
  }, [getStatusColor]);

  const formatUptime = useCallback((uptime) => {
    if (!uptime) return 'N/A';
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  const formatBytes = useCallback((bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleComponentClick = useCallback((component) => {
    setSelectedComponent(component);
    setDetailsOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshStatus();
  }, [refreshStatus]);

  if (isLoading && !systemStatus) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" p={2}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading AI System Status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }>
            Failed to load AI system status: {error.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = systemStatus?.status || 'unknown';
  const components = systemStatus?.components || {};
  const metrics = systemStatus?.metrics || {};
  const alerts = systemStatus?.alerts || [];
  const uptime = systemStatus?.uptime || 0;

  if (compact) {
    return (
      <Card sx={{ minWidth: 200 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              {getStatusIcon(overallStatus)}
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                AI System
              </Typography>
            </Box>
            <Chip
              label={overallStatus.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(overallStatus),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          {uptime > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Uptime: {formatUptime(uptime)}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Main Status Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              {getStatusIcon(overallStatus)}
              <Typography variant="h6" sx={{ ml: 2 }}>
                AI System Status
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}>
                <IconButton
                  size="small"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  color={autoRefresh ? "primary" : "default"}
                >
                  <AutoAwesome />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh status">
                <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="System settings">
                <IconButton size="small">
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: getStatusColor(overallStatus), fontWeight: 'bold' }}>
                  {overallStatus.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Status
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatUptime(uptime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptime
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {Object.keys(components).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Components
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Badge badgeContent={alerts.length} color="error">
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {alerts.length}
                  </Typography>
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Active Alerts
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showDetails && (
        <Grid container spacing={2}>
          {/* Components Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI Components
                  </Typography>
                  <IconButton size="small" onClick={() => toggleSection('components')}>
                    {expandedSections.components ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {expandedSections.components && (
                  <List dense>
                    {Object.entries(components).map(([name, status]) => (
                      <ListItem
                        key={name}
                        button
                        onClick={() => handleComponentClick({ name, status })}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemIcon>
                          {getStatusIcon(status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          secondary={status}
                        />
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(status),
                            color: 'white',
                            minWidth: 80
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance Metrics
                  </Typography>
                  <IconButton size="small" onClick={() => toggleSection('metrics')}>
                    {expandedSections.metrics ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {expandedSections.metrics && (
                  <Box>
                    {/* Response Time */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Response Time</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {metrics.responseTime || 'N/A'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((metrics.responseTime || 0) / 3000 * 100, 100)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Memory Usage */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <Memory sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Memory Usage
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatBytes(metrics.memoryUsage || 0)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((metrics.memoryUsage || 0) / (512 * 1024 * 1024) * 100, 100)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Cache Hit Rate */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <Storage sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Cache Hit Rate
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {((metrics.cacheHitRate || 0) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.cacheHitRate || 0) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Throughput */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <Speed sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Throughput
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {metrics.throughput || 0} req/s
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((metrics.throughput || 0) / 100 * 100, 100)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">
                      <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Active Alerts ({alerts.length})
                    </Typography>
                    <IconButton size="small" onClick={() => toggleSection('alerts')}>
                      {expandedSections.alerts ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  
                  {expandedSections.alerts && (
                    <Box>
                      {alerts.map((alert, index) => (
                        <Alert
                          key={index}
                          severity={alert.severity || 'info'}
                          sx={{ mb: 1 }}
                          action={
                            <Button color="inherit" size="small">
                              Dismiss
                            </Button>
                          }
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {alert.title || 'System Alert'}
                          </Typography>
                          <Typography variant="body2">
                            {alert.message}
                          </Typography>
                          {alert.timestamp && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(alert.timestamp).toLocaleString()}
                            </Typography>
                          )}
                        </Alert>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Component Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Component Details: {selectedComponent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedComponent && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                {getStatusIcon(selectedComponent.status)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Status: {selectedComponent.status}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Detailed information about this component would be displayed here,
                including performance metrics, configuration, and operational data.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISystemStatus;