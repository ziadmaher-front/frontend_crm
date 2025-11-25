import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useEnhancedStore, { 
  useEnhancedData, 
  useEnhancedAnalytics, 
  useEnhancedUI, 
  useEnhancedActions 
} from '../store/enhancedStore';
import { generateMockData } from '../data/mockData';

// Enhanced entity hook with AI capabilities
export const useEnhancedEntity = (entityType, options = {}) => {
  const queryClient = useQueryClient();
  const actions = useEnhancedActions();
  const data = useEnhancedData(entityType);
  const ui = useEnhancedUI(entityType);
  
  // Query for fetching data
  const query = useQuery({
    queryKey: [entityType, 'enhanced'],
    queryFn: async () => {
      actions.setLoading(entityType, true);
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = generateMockData();
        const entityData = mockData[entityType] || [];
        
        // Update store with fetched data
        actions.setData(entityType, entityData);
        
        return entityData;
      } catch (error) {
        actions.setError(entityType, error.message);
        throw error;
      } finally {
        actions.setLoading(entityType, false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newItem) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const item = {
        ...newItem,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      actions.addItem(entityType, item);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityType]);
      actions.addNotification({
        type: 'success',
        title: `${entityType.slice(0, -1)} Created`,
        message: `New ${entityType.slice(0, -1)} has been created successfully.`,
      });
    },
    onError: (error) => {
      actions.setError(entityType, error.message);
      actions.addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: `Failed to create ${entityType.slice(0, -1)}: ${error.message}`,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      actions.updateItem(entityType, id, updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityType]);
      actions.addNotification({
        type: 'success',
        title: `${entityType.slice(0, -1)} Updated`,
        message: `${entityType.slice(0, -1)} has been updated successfully.`,
      });
    },
    onError: (error) => {
      actions.setError(entityType, error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      actions.deleteItem(entityType, id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityType]);
      actions.addNotification({
        type: 'success',
        title: `${entityType.slice(0, -1)} Deleted`,
        message: `${entityType.slice(0, -1)} has been deleted successfully.`,
      });
    },
    onError: (error) => {
      actions.setError(entityType, error.message);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      actions.bulkUpdate(entityType, ids, updates);
      return { ids, updates };
    },
    onSuccess: ({ ids }) => {
      queryClient.invalidateQueries([entityType]);
      actions.addNotification({
        type: 'success',
        title: 'Bulk Update Complete',
        message: `${ids.length} ${entityType} updated successfully.`,
      });
    },
  });

  // Computed data with AI insights
  const computedData = useMemo(() => {
    const filteredData = actions.getFilteredData(entityType);
    const stats = actions.getEntityStats(entityType);
    
    return {
      items: filteredData,
      stats,
      total: data.length,
      filtered: filteredData.length,
    };
  }, [data, ui.filters, actions, entityType]);

  // Action handlers
  const handlers = {
    create: useCallback((item) => createMutation.mutate(item), [createMutation]),
    update: useCallback((id, updates) => updateMutation.mutate({ id, updates }), [updateMutation]),
    delete: useCallback((id) => deleteMutation.mutate(id), [deleteMutation]),
    bulkUpdate: useCallback((ids, updates) => bulkUpdateMutation.mutate({ ids, updates }), [bulkUpdateMutation]),
    refresh: useCallback(() => {
      actions.refresh(entityType);
      queryClient.invalidateQueries([entityType]);
    }, [actions, entityType, queryClient]),
    setFilters: useCallback((filters) => actions.setFilters(entityType, filters), [actions, entityType]),
    clearFilters: useCallback(() => actions.clearFilters(entityType), [actions, entityType]),
    setSelected: useCallback((items) => actions.setSelectedItems(entityType, items), [actions, entityType]),
    getById: useCallback((id) => data.find(item => item.id === id), [data]),
  };

  return {
    // Data
    data: computedData.items,
    computedData,
    
    // State
    isLoading: query.isLoading || ui.loading,
    error: query.error || ui.error,
    filters: ui.filters,
    selectedItems: ui.selectedItems,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    
    // Actions
    ...handlers,
  };
};

// Specialized hooks for different entities
export const useEnhancedLeads = (options = {}) => {
  const entityHook = useEnhancedEntity('leads', options);
  const leadAnalytics = useEnhancedAnalytics('leadAnalytics');
  const actions = useEnhancedActions();

  // Lead-specific analytics
  useEffect(() => {
    if (entityHook.data.length > 0) {
      const statusDistribution = entityHook.data.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const convertedLeads = entityHook.data.filter(lead => lead.status === 'Converted').length;
      const conversionRate = entityHook.data.length > 0 ? (convertedLeads / entityHook.data.length) * 100 : 0;
      const qualifiedLeads = entityHook.data.filter(lead => lead.status === 'Qualified').length;

      // Generate AI insights
      const insights = [];
      if (conversionRate < 20) {
        insights.push('Conversion rate is below average. Consider improving lead qualification process.');
      }
      if (qualifiedLeads > convertedLeads * 2) {
        insights.push('High number of qualified leads not converting. Review sales process.');
      }
      if (statusDistribution['New'] > entityHook.data.length * 0.5) {
        insights.push('Many leads are still new. Increase outreach efforts.');
      }

      actions.updateLeadAnalytics({
        statusDistribution,
        conversionRate: Math.round(conversionRate * 10) / 10,
        qualifiedLeads,
        insights,
      });
    }
  }, [entityHook.data, actions]);

  return {
    ...entityHook,
    analytics: leadAnalytics,
    // Lead-specific methods
    convertToContact: useCallback((leadId) => {
      const lead = entityHook.getById(leadId);
      if (lead) {
        entityHook.update(leadId, { status: 'Converted' });
        // This would typically create a contact
        actions.addNotification({
          type: 'success',
          title: 'Lead Converted',
          message: `Lead ${lead.name} has been converted to a contact.`,
        });
      }
    }, [entityHook, actions]),
  };
};

export const useEnhancedContacts = (options = {}) => {
  const entityHook = useEnhancedEntity('contacts', options);
  
  return {
    ...entityHook,
    // Contact-specific methods
    getByAccount: useCallback((accountId) => {
      return entityHook.data.filter(contact => contact.accountId === accountId);
    }, [entityHook.data]),
  };
};

export const useEnhancedDeals = (options = {}) => {
  const entityHook = useEnhancedEntity('deals', options);
  const dealAnalytics = useEnhancedAnalytics('dealAnalytics');
  const actions = useEnhancedActions();

  // Deal-specific analytics
  useEffect(() => {
    if (entityHook.data.length > 0) {
      const stageDistribution = entityHook.data.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {});

      const stageValues = entityHook.data.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + (deal.amount || 0);
        return acc;
      }, {});

      const wonDeals = entityHook.data.filter(deal => deal.stage === 'Closed Won');
      const lostDeals = entityHook.data.filter(deal => deal.stage === 'Closed Lost');
      const closedDeals = wonDeals.length + lostDeals.length;
      const winRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;
      
      const averageDealSize = wonDeals.length > 0 
        ? wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / wonDeals.length 
        : 0;

      // Risk analysis
      const atRiskDeals = entityHook.data.filter(deal => {
        const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 14 && !['Closed Won', 'Closed Lost'].includes(deal.stage);
      }).length;

      // Generate recommendations
      const recommendations = [];
      if (winRate < 30) {
        recommendations.push('Win rate is low. Review qualification criteria and sales process.');
      }
      if (atRiskDeals > 0) {
        recommendations.push(`${atRiskDeals} deals haven't been updated recently. Follow up immediately.`);
      }
      if (stageDistribution['Proposal'] > stageDistribution['Negotiation']) {
        recommendations.push('Many deals stuck in proposal stage. Focus on moving deals forward.');
      }

      actions.updateDealAnalytics({
        stageDistribution,
        stageValues,
        winRate: Math.round(winRate * 10) / 10,
        averageDealSize: Math.round(averageDealSize),
        atRiskDeals,
        recommendations,
      });
    }
  }, [entityHook.data, actions]);

  return {
    ...entityHook,
    analytics: dealAnalytics,
    pipelineAnalytics: dealAnalytics, // Alias for compatibility
    // Deal-specific methods
    getByStage: useCallback((stage) => {
      return entityHook.data.filter(deal => deal.stage === stage);
    }, [entityHook.data]),
    getPipelineValue: useCallback(() => {
      return entityHook.data
        .filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage))
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);
    }, [entityHook.data]),
  };
};

export const useEnhancedAccounts = (options = {}) => {
  return useEnhancedEntity('accounts', options);
};

export const useEnhancedTasks = (options = {}) => {
  const entityHook = useEnhancedEntity('tasks', options);
  
  return {
    ...entityHook,
    // Task-specific methods
    getOverdue: useCallback(() => {
      const now = new Date();
      return entityHook.data.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed'
      );
    }, [entityHook.data]),
    getUpcoming: useCallback((days = 7) => {
      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return entityHook.data.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) >= now && 
        new Date(task.dueDate) <= future &&
        task.status !== 'Completed'
      );
    }, [entityHook.data]),
  };
};

export const useEnhancedDashboardAnalytics = () => {
  const dashboardAnalytics = useEnhancedAnalytics('dashboardAnalytics');
  const actions = useEnhancedActions();
  const leads = useEnhancedData('leads');
  const deals = useEnhancedData('deals');
  const contacts = useEnhancedData('contacts');

  // Generate dashboard analytics
  useEffect(() => {
    if (leads.length > 0 || deals.length > 0) {
      // Revenue trends (mock data for demonstration)
      const trends = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (11 - i));
        return {
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 100000) + 50000,
          deals: Math.floor(Math.random() * 20) + 5,
        };
      });

      // AI-powered forecasting
      const currentRevenue = deals
        .filter(deal => deal.stage === 'Closed Won')
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);
      
      const pipelineValue = deals
        .filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage))
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);

      const forecast = {
        nextMonth: Math.round(currentRevenue * 1.1 + pipelineValue * 0.3),
        nextQuarter: Math.round(currentRevenue * 1.35 + pipelineValue * 0.6),
      };

      actions.updateDashboardAnalytics({
        trends,
        forecast,
        metrics: {
          totalRevenue: currentRevenue,
          pipelineValue,
          totalLeads: leads.length,
          totalContacts: contacts.length,
        },
      });
    }
  }, [leads, deals, contacts, actions]);

  return {
    analytics: dashboardAnalytics,
    isLoading: false,
    error: null,
  };
};

// Real-time notifications hook
export const useRealTimeNotifications = () => {
  const { notifications } = useEnhancedStore((state) => state?.realTime || { notifications: [] });
  const actions = useEnhancedActions();

  // Disabled automatic notification generation
  // Notifications will only appear when triggered by user actions or real events
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Randomly generate notifications
  //     if (Math.random() < 0.1) { // 10% chance every 30 seconds
  //       const notificationTypes = [
  //         { type: 'info', title: 'New Lead', message: 'A new lead has been assigned to you.' },
  //         { type: 'success', title: 'Deal Won', message: 'Congratulations! You closed a deal.' },
  //         { type: 'warning', title: 'Task Due', message: 'You have a task due in 1 hour.' },
  //         { type: 'info', title: 'Meeting Reminder', message: 'Your meeting starts in 15 minutes.' },
  //       ];
  //       
  //       const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  //       actions.addNotification(randomNotification);
  //     }
  //   }, 30000); // Every 30 seconds

  //   return () => clearInterval(interval);
  // }, [actions]);

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    dismissNotification: actions?.dismissNotification || (() => {}),
    markAsRead: actions?.markNotificationRead || (() => {}),
    clearAll: actions?.clearAllNotifications || (() => {}),
  };
};

export default {
  useEnhancedEntity,
  useEnhancedLeads,
  useEnhancedContacts,
  useEnhancedDeals,
  useEnhancedAccounts,
  useEnhancedTasks,
  useEnhancedDashboardAnalytics,
  useRealTimeNotifications,
};
