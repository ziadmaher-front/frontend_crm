// Audit Trail Hook for Security and Compliance
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { apiClient } from '../../utils/api';

// Audit event types
const AUDIT_EVENT_TYPES = {
  // Authentication events
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  LOGIN_FAILED: 'auth.login_failed',
  PASSWORD_CHANGED: 'auth.password_changed',
  PASSWORD_RESET: 'auth.password_reset',
  SESSION_EXPIRED: 'auth.session_expired',
  MFA_ENABLED: 'auth.mfa_enabled',
  MFA_DISABLED: 'auth.mfa_disabled',

  // User management events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ACTIVATED: 'user.activated',
  USER_DEACTIVATED: 'user.deactivated',
  USER_ROLE_ASSIGNED: 'user.role_assigned',
  USER_ROLE_REMOVED: 'user.role_removed',

  // Data events
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_ASSIGNED: 'lead.assigned',
  LEAD_STATUS_CHANGED: 'lead.status_changed',

  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  DEAL_CLOSED: 'deal.closed',
  DEAL_REOPENED: 'deal.reopened',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',

  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',
  CONTACT_MERGED: 'contact.merged',

  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  COMPANY_DELETED: 'company.deleted',

  // Activity events
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_UPDATED: 'activity.updated',
  ACTIVITY_DELETED: 'activity.deleted',
  ACTIVITY_COMPLETED: 'activity.completed',

  // System events
  SYSTEM_SETTINGS_CHANGED: 'system.settings_changed',
  INTEGRATION_CONFIGURED: 'system.integration_configured',
  BACKUP_CREATED: 'system.backup_created',
  BACKUP_RESTORED: 'system.backup_restored',
  MAINTENANCE_MODE_ENABLED: 'system.maintenance_enabled',
  MAINTENANCE_MODE_DISABLED: 'system.maintenance_disabled',

  // Security events
  PERMISSION_GRANTED: 'security.permission_granted',
  PERMISSION_REVOKED: 'security.permission_revoked',
  ROLE_CREATED: 'security.role_created',
  ROLE_UPDATED: 'security.role_updated',
  ROLE_DELETED: 'security.role_deleted',
  SECURITY_POLICY_CHANGED: 'security.policy_changed',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  ACCESS_DENIED: 'security.access_denied',

  // Data management events
  DATA_EXPORTED: 'data.exported',
  DATA_IMPORTED: 'data.imported',
  DATA_PURGED: 'data.purged',
  DATA_ARCHIVED: 'data.archived',
  DATA_RESTORED: 'data.restored',

  // Report events
  REPORT_CREATED: 'report.created',
  REPORT_UPDATED: 'report.updated',
  REPORT_DELETED: 'report.deleted',
  REPORT_SHARED: 'report.shared',
  REPORT_EXPORTED: 'report.exported',
};

// Audit severity levels
const AUDIT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Risk levels for events
const RISK_LEVELS = {
  [AUDIT_EVENT_TYPES.LOGIN_FAILED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.PASSWORD_CHANGED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.USER_DELETED]: AUDIT_SEVERITY.HIGH,
  [AUDIT_EVENT_TYPES.ROLE_CREATED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.ROLE_UPDATED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.ROLE_DELETED]: AUDIT_SEVERITY.HIGH,
  [AUDIT_EVENT_TYPES.PERMISSION_GRANTED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.PERMISSION_REVOKED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY]: AUDIT_SEVERITY.CRITICAL,
  [AUDIT_EVENT_TYPES.ACCESS_DENIED]: AUDIT_SEVERITY.HIGH,
  [AUDIT_EVENT_TYPES.DATA_EXPORTED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_EVENT_TYPES.DATA_PURGED]: AUDIT_SEVERITY.CRITICAL,
  [AUDIT_EVENT_TYPES.SYSTEM_SETTINGS_CHANGED]: AUDIT_SEVERITY.HIGH,
};

// Audit Trail Engine
class AuditTrailEngine {
  constructor() {
    this.eventQueue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Create audit event
  createAuditEvent(eventType, details = {}) {
    const event = {
      id: this.generateEventId(),
      eventType,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(eventType),
      userId: details.userId || null,
      sessionId: details.sessionId || null,
      ipAddress: details.ipAddress || this.getClientIP(),
      userAgent: details.userAgent || navigator.userAgent,
      resource: details.resource || null,
      resourceId: details.resourceId || null,
      action: details.action || null,
      oldValues: details.oldValues || null,
      newValues: details.newValues || null,
      metadata: details.metadata || {},
      success: details.success !== false,
      errorMessage: details.errorMessage || null,
      duration: details.duration || null,
      location: details.location || window.location.pathname,
      referrer: details.referrer || document.referrer,
    };

    return event;
  }

  // Generate unique event ID
  generateEventId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get severity for event type
  getSeverity(eventType) {
    return RISK_LEVELS[eventType] || AUDIT_SEVERITY.LOW;
  }

  // Get client IP (simplified - in real app, this would come from server)
  getClientIP() {
    // This is a placeholder - actual IP would be determined server-side
    return 'client-ip';
  }

  // Queue event for batch processing
  queueEvent(event) {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Flush events to server
  async flushEvents() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(eventsToProcess);
    } catch (error) {
      console.error('Failed to send audit events:', error);
      // Re-queue failed events for retry
      this.eventQueue.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  // Send events to server with retry logic
  async sendEvents(events, attempt = 1) {
    try {
      await apiClient.post('/audit/events', { events });
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.sendEvents(events, attempt + 1);
      }
      throw error;
    }
  }

  // Start auto-flush timer
  startAutoFlush() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Analyze audit patterns for anomalies
  analyzePatterns(events) {
    const analysis = {
      suspiciousActivities: [],
      riskScore: 0,
      recommendations: [],
    };

    // Failed login attempts
    const failedLogins = events.filter(e => e.eventType === AUDIT_EVENT_TYPES.LOGIN_FAILED);
    if (failedLogins.length > 5) {
      analysis.suspiciousActivities.push({
        type: 'multiple_failed_logins',
        count: failedLogins.length,
        severity: AUDIT_SEVERITY.HIGH,
      });
      analysis.riskScore += 30;
    }

    // Unusual access patterns
    const accessEvents = events.filter(e => e.eventType.includes('access'));
    const uniqueIPs = new Set(accessEvents.map(e => e.ipAddress));
    if (uniqueIPs.size > 10) {
      analysis.suspiciousActivities.push({
        type: 'multiple_ip_access',
        count: uniqueIPs.size,
        severity: AUDIT_SEVERITY.MEDIUM,
      });
      analysis.riskScore += 20;
    }

    // High-risk operations
    const highRiskEvents = events.filter(e => this.getSeverity(e.eventType) === AUDIT_SEVERITY.CRITICAL);
    if (highRiskEvents.length > 0) {
      analysis.suspiciousActivities.push({
        type: 'high_risk_operations',
        count: highRiskEvents.length,
        severity: AUDIT_SEVERITY.CRITICAL,
      });
      analysis.riskScore += 50;
    }

    // Generate recommendations
    if (analysis.riskScore > 50) {
      analysis.recommendations.push('Consider implementing additional security measures');
    }
    if (failedLogins.length > 3) {
      analysis.recommendations.push('Review and potentially lock suspicious accounts');
    }
    if (uniqueIPs.size > 5) {
      analysis.recommendations.push('Monitor access from multiple IP addresses');
    }

    return analysis;
  }

  // Generate compliance report
  generateComplianceReport(events, startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      totalEvents: events.length,
      eventsByType: {},
      eventsBySeverity: {},
      userActivity: {},
      securityEvents: [],
      dataAccessEvents: [],
      systemChanges: [],
      complianceMetrics: {},
    };

    events.forEach(event => {
      // Count by type
      report.eventsByType[event.eventType] = (report.eventsByType[event.eventType] || 0) + 1;

      // Count by severity
      report.eventsBySeverity[event.severity] = (report.eventsBySeverity[event.severity] || 0) + 1;

      // User activity
      if (event.userId) {
        if (!report.userActivity[event.userId]) {
          report.userActivity[event.userId] = { total: 0, events: [] };
        }
        report.userActivity[event.userId].total++;
        report.userActivity[event.userId].events.push(event.eventType);
      }

      // Security events
      if (event.eventType.startsWith('security.') || event.eventType.startsWith('auth.')) {
        report.securityEvents.push(event);
      }

      // Data access events
      if (event.eventType.includes('created') || event.eventType.includes('updated') || 
          event.eventType.includes('deleted') || event.eventType.includes('exported')) {
        report.dataAccessEvents.push(event);
      }

      // System changes
      if (event.eventType.startsWith('system.') || event.eventType.includes('settings')) {
        report.systemChanges.push(event);
      }
    });

    // Calculate compliance metrics
    report.complianceMetrics = {
      dataRetentionCompliance: this.checkDataRetentionCompliance(events),
      accessControlCompliance: this.checkAccessControlCompliance(events),
      auditTrailCompleteness: this.checkAuditTrailCompleteness(events),
    };

    return report;
  }

  // Check data retention compliance
  checkDataRetentionCompliance(events) {
    const oldestEvent = events.reduce((oldest, event) => {
      return new Date(event.timestamp) < new Date(oldest.timestamp) ? event : oldest;
    }, events[0]);

    const retentionPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    const isCompliant = Date.now() - new Date(oldestEvent?.timestamp).getTime() <= retentionPeriod;

    return {
      isCompliant,
      oldestEventDate: oldestEvent?.timestamp,
      retentionPeriodDays: 365,
    };
  }

  // Check access control compliance
  checkAccessControlCompliance(events) {
    const accessEvents = events.filter(e => e.eventType.includes('access') || e.eventType.includes('permission'));
    const deniedAccess = accessEvents.filter(e => e.eventType === AUDIT_EVENT_TYPES.ACCESS_DENIED);
    
    return {
      totalAccessEvents: accessEvents.length,
      deniedAccessEvents: deniedAccess.length,
      accessDenialRate: accessEvents.length > 0 ? (deniedAccess.length / accessEvents.length) * 100 : 0,
      isCompliant: deniedAccess.length < accessEvents.length * 0.1, // Less than 10% denial rate
    };
  }

  // Check audit trail completeness
  checkAuditTrailCompleteness(events) {
    const requiredEventTypes = [
      AUDIT_EVENT_TYPES.LOGIN,
      AUDIT_EVENT_TYPES.LOGOUT,
      AUDIT_EVENT_TYPES.USER_CREATED,
      AUDIT_EVENT_TYPES.USER_UPDATED,
    ];

    const presentEventTypes = new Set(events.map(e => e.eventType));
    const missingEventTypes = requiredEventTypes.filter(type => !presentEventTypes.has(type));

    return {
      completenessScore: ((requiredEventTypes.length - missingEventTypes.length) / requiredEventTypes.length) * 100,
      missingEventTypes,
      isCompliant: missingEventTypes.length === 0,
    };
  }
}

const useAuditTrail = () => {
  const [auditEngine] = useState(() => new AuditTrailEngine());
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Initialize auto-flush on mount
  useEffect(() => {
    auditEngine.startAutoFlush();
  }, [auditEngine]);

  // Fetch audit logs
  const {
    data: auditLogs = [],
    isLoading: logsLoading,
    error: logsError,
  } = useQuery(
    ['audit-logs'],
    () => apiClient.get('/audit/logs'),
    {
      enabled: isAuthenticated,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch audit statistics
  const {
    data: auditStats = {},
    isLoading: statsLoading,
  } = useQuery(
    ['audit-stats'],
    () => apiClient.get('/audit/stats'),
    {
      enabled: isAuthenticated,
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Log audit event
  const logEvent = useCallback((eventType, details = {}) => {
    const event = auditEngine.createAuditEvent(eventType, {
      ...details,
      userId: user?.id,
      sessionId: user?.sessionId,
    });

    auditEngine.queueEvent(event);

    // For critical events, also show notification
    if (auditEngine.getSeverity(eventType) === AUDIT_SEVERITY.CRITICAL) {
      addNotification({
        type: 'warning',
        title: 'Security Event',
        message: `Critical security event logged: ${eventType}`,
      });
    }

    return event;
  }, [auditEngine, user, addNotification]);

  // Batch log multiple events
  const logEvents = useCallback((events) => {
    events.forEach(({ eventType, details }) => {
      logEvent(eventType, details);
    });
  }, [logEvent]);

  // Search audit logs
  const searchLogsMutation = useMutation(
    (searchParams) => apiClient.post('/audit/search', searchParams),
    {
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Search Failed',
          message: error.message || 'Failed to search audit logs',
        });
      },
    }
  );

  // Export audit logs
  const exportLogsMutation = useMutation(
    (exportParams) => apiClient.post('/audit/export', exportParams),
    {
      onSuccess: () => {
        logEvent(AUDIT_EVENT_TYPES.DATA_EXPORTED, {
          resource: 'audit_logs',
          action: 'export',
        });
        addNotification({
          type: 'success',
          title: 'Export Started',
          message: 'Audit logs export has been initiated',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Export Failed',
          message: error.message || 'Failed to export audit logs',
        });
      },
    }
  );

  // Generate compliance report
  const generateReportMutation = useMutation(
    (reportParams) => apiClient.post('/audit/compliance-report', reportParams),
    {
      onSuccess: () => {
        logEvent(AUDIT_EVENT_TYPES.REPORT_CREATED, {
          resource: 'compliance_report',
          action: 'generate',
        });
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: 'Compliance report has been generated successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Report Failed',
          message: error.message || 'Failed to generate compliance report',
        });
      },
    }
  );

  // Analyze audit patterns
  const analyzePatterns = useCallback((events = auditLogs) => {
    return auditEngine.analyzePatterns(events);
  }, [auditEngine, auditLogs]);

  // Generate compliance report
  const generateComplianceReport = useCallback((startDate, endDate, events = auditLogs) => {
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });

    return auditEngine.generateComplianceReport(filteredEvents, startDate, endDate);
  }, [auditEngine, auditLogs]);

  // Get events by user
  const getEventsByUser = useCallback((userId, events = auditLogs) => {
    return events.filter(event => event.userId === userId);
  }, [auditLogs]);

  // Get events by type
  const getEventsByType = useCallback((eventType, events = auditLogs) => {
    return events.filter(event => event.eventType === eventType);
  }, [auditLogs]);

  // Get security events
  const getSecurityEvents = useCallback((events = auditLogs) => {
    return events.filter(event => 
      event.eventType.startsWith('security.') || 
      event.eventType.startsWith('auth.') ||
      event.severity === AUDIT_SEVERITY.CRITICAL
    );
  }, [auditLogs]);

  // Search logs
  const searchLogs = useCallback((searchParams) => {
    return searchLogsMutation.mutateAsync(searchParams);
  }, [searchLogsMutation]);

  // Export logs
  const exportLogs = useCallback((exportParams) => {
    return exportLogsMutation.mutateAsync(exportParams);
  }, [exportLogsMutation]);

  // Generate report
  const generateReport = useCallback((reportParams) => {
    return generateReportMutation.mutateAsync(reportParams);
  }, [generateReportMutation]);

  // Computed values
  const recentEvents = useMemo(() => {
    return auditLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
  }, [auditLogs]);

  const criticalEvents = useMemo(() => {
    return auditLogs.filter(event => event.severity === AUDIT_SEVERITY.CRITICAL);
  }, [auditLogs]);

  const eventsByType = useMemo(() => {
    const grouped = {};
    auditLogs.forEach(event => {
      grouped[event.eventType] = (grouped[event.eventType] || 0) + 1;
    });
    return grouped;
  }, [auditLogs]);

  return {
    // State
    auditLogs,
    auditStats,
    recentEvents,
    criticalEvents,
    eventsByType,
    isLoading: logsLoading || statsLoading,
    error: logsError,

    // Logging functions
    logEvent,
    logEvents,

    // Analysis functions
    analyzePatterns,
    generateComplianceReport,
    getEventsByUser,
    getEventsByType,
    getSecurityEvents,

    // Operations
    searchLogs,
    exportLogs,
    generateReport,

    // Mutation states
    isSearching: searchLogsMutation.isLoading,
    isExporting: exportLogsMutation.isLoading,
    isGeneratingReport: generateReportMutation.isLoading,

    // Constants
    AUDIT_EVENT_TYPES,
    AUDIT_SEVERITY,

    // Engine
    auditEngine,
  };
};

export default useAuditTrail;