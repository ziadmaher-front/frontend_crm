// Enhanced Leads Hook with AI-Powered Features
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntitiesStore, useAnalyticsStore } from '@/stores';
import { useApi } from '../useApi';
import { useNotifications } from '../useNotifications';
import { useAIInsights } from '../ai/useAIInsights';
import { useLeadScoring } from '../ai/useLeadScoring';
import { leadService } from '@/services/leadService';

export const useLeads = (options = {}) => {
  const {
    enableRealTime = true,
    enableAIScoring = true,
    enablePredictiveAnalytics = true,
    autoRefresh = 30000, // 30 seconds
  } = options;

  const queryClient = useQueryClient();
  const { get, post, put, delete: del, optimisticUpdate } = useApi();
  const { addNotification } = useNotifications();
  const { getAIInsights } = useAIInsights();
  const { calculateLeadScore, getBulkScores } = useLeadScoring();
  
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    dateRange: 'all',
    score: 'all',
  });
  
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc',
  });

  // Query keys
  const queryKeys = {
    all: ['leads'],
    lists: () => [...queryKeys.all, 'list'],
    list: (filters) => [...queryKeys.lists(), filters],
    details: () => [...queryKeys.all, 'detail'],
    detail: (id) => [...queryKeys.details(), id],
    analytics: () => [...queryKeys.all, 'analytics'],
    scoring: () => [...queryKeys.all, 'scoring'],
    conversion: () => [...queryKeys.all, 'conversion'],
  };

  // Fetch leads with advanced filtering and sorting
  const {
    data: leads = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: async () => {
      const params = {
        ...filters,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
        includeScore: enableAIScoring,
        includeInsights: enablePredictiveAnalytics,
      };
      
      const response = await get('/api/leads', params);
      
      // Enhance with AI scoring if enabled
      if (enableAIScoring && response.data) {
        const scoredLeads = await Promise.all(
          response.data.map(async (lead) => {
            if (!lead.score) {
              const score = await calculateLeadScore(lead);
              return { ...lead, score };
            }
            return lead;
          })
        );
        return { ...response, data: scoredLeads };
      }
      
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: autoRefresh,
    refetchIntervalInBackground: false,
  });

  // Fetch lead analytics
  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: () => get('/api/leads/analytics'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch conversion metrics
  const {
    data: conversionMetrics,
    isLoading: conversionLoading,
  } = useQuery({
    queryKey: queryKeys.conversion(),
    queryFn: () => get('/api/leads/conversion-metrics'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (leadData) => {
      // Calculate AI score before creating
      if (enableAIScoring) {
        leadData.score = await calculateLeadScore(leadData);
      }
      
      return post('/api/leads', leadData);
    },
    onMutate: async (newLead) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.lists() });
      
      const previousLeads = queryClient.getQueryData(queryKeys.list(filters));
      
      queryClient.setQueryData(queryKeys.list(filters), (old) => ({
        ...old,
        data: [{ ...newLead, id: 'temp-' + Date.now() }, ...(old?.data || [])],
      }));
      
      return { previousLeads };
    },
    onError: (err, newLead, context) => {
      queryClient.setQueryData(queryKeys.list(filters), context.previousLeads);
      addNotification({
        type: 'error',
        title: 'Failed to create lead',
        message: err.message,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics() });
      
      addNotification({
        type: 'success',
        title: 'Lead created successfully',
        message: `Lead "${data.name}" has been created.`,
      });
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Recalculate score if key fields changed
      if (enableAIScoring && hasScoreRelevantChanges(data)) {
        const currentLead = queryClient.getQueryData(queryKeys.detail(id));
        data.score = await calculateLeadScore({ ...currentLead, ...data });
      }
      
      return put(`/api/leads/${id}`, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
      
      const previousLead = queryClient.getQueryData(queryKeys.detail(id));
      
      queryClient.setQueryData(queryKeys.detail(id), (old) => ({
        ...old,
        ...data,
      }));
      
      return { previousLead };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(queryKeys.detail(id), context.previousLead);
      addNotification({
        type: 'error',
        title: 'Failed to update lead',
        message: err.message,
      });
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      
      addNotification({
        type: 'success',
        title: 'Lead updated successfully',
        message: `Lead "${data.name}" has been updated.`,
      });
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (id) => del(`/api/leads/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lists() });
      
      const previousLeads = queryClient.getQueryData(queryKeys.list(filters));
      
      queryClient.setQueryData(queryKeys.list(filters), (old) => ({
        ...old,
        data: old?.data?.filter(lead => lead.id !== id) || [],
      }));
      
      return { previousLeads };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.list(filters), context.previousLeads);
      addNotification({
        type: 'error',
        title: 'Failed to delete lead',
        message: err.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics() });
      
      addNotification({
        type: 'success',
        title: 'Lead deleted successfully',
      });
    },
  });

  // Convert lead to deal mutation
  const convertLeadMutation = useMutation({
    mutationFn: async ({ leadId, dealData }) => {
      return post(`/api/leads/${leadId}/convert`, dealData);
    },
    onSuccess: (data, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      
      addNotification({
        type: 'success',
        title: 'Lead converted successfully',
        message: `Lead has been converted to deal "${data.name}".`,
      });
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: 'Failed to convert lead',
        message: err.message,
      });
    },
  });

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }) => {
      return post('/api/leads/bulk-update', { ids, updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      addNotification({
        type: 'success',
        title: 'Bulk update completed',
        message: `${arguments[1].ids.length} leads updated successfully.`,
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => post('/api/leads/bulk-delete', { ids }),
    onSuccess: (data, ids) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      addNotification({
        type: 'success',
        title: 'Bulk delete completed',
        message: `${ids.length} leads deleted successfully.`,
      });
    },
  });

  // Advanced filtering and search
  const filteredLeads = useMemo(() => {
    if (!leads?.data) return [];
    
    return leads.data.filter(lead => {
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.source !== 'all' && lead.source !== filters.source) return false;
      if (filters.assignedTo !== 'all' && lead.assignedTo !== filters.assignedTo) return false;
      if (filters.score !== 'all') {
        const scoreRange = filters.score;
        if (scoreRange === 'high' && lead.score < 80) return false;
        if (scoreRange === 'medium' && (lead.score < 50 || lead.score >= 80)) return false;
        if (scoreRange === 'low' && lead.score >= 50) return false;
      }
      return true;
    });
  }, [leads?.data, filters]);

  // Lead insights and recommendations
  const getLeadInsights = useCallback(async (leadId) => {
    const lead = queryClient.getQueryData(queryKeys.detail(leadId));
    if (!lead) return null;
    
    return await getAIInsights('lead', lead);
  }, [getAIInsights, queryClient]);

  // Lead qualification
  const qualifyLead = useCallback(async (leadId, qualificationData) => {
    try {
      const response = await post(`/api/leads/${leadId}/qualify`, qualificationData);
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      
      addNotification({
        type: 'success',
        title: 'Lead qualified successfully',
      });
      
      return response;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to qualify lead',
        message: error.message,
      });
      throw error;
    }
  }, [post, queryClient, addNotification]);

  // Lead scoring utilities
  const rescoreLeads = useCallback(async (leadIds = null) => {
    const leadsToScore = leadIds || filteredLeads.map(lead => lead.id);
    const scores = await getBulkScores(leadsToScore);
    
    // Update cache with new scores
    leadsToScore.forEach(leadId => {
      queryClient.setQueryData(queryKeys.detail(leadId), (old) => ({
        ...old,
        score: scores[leadId],
      }));
    });
    
    queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
  }, [filteredLeads, getBulkScores, queryClient]);

  // Utility functions
  const hasScoreRelevantChanges = (data) => {
    const scoreFields = ['company', 'title', 'industry', 'revenue', 'employees', 'source'];
    return scoreFields.some(field => data.hasOwnProperty(field));
  };

  const getLeadsByStatus = useCallback((status) => {
    return filteredLeads.filter(lead => lead.status === status);
  }, [filteredLeads]);

  const getLeadsByScore = useCallback((scoreRange) => {
    return filteredLeads.filter(lead => {
      if (scoreRange === 'high') return lead.score >= 80;
      if (scoreRange === 'medium') return lead.score >= 50 && lead.score < 80;
      if (scoreRange === 'low') return lead.score < 50;
      return true;
    });
  }, [filteredLeads]);

  return {
    // Data
    leads: filteredLeads,
    analytics,
    conversionMetrics,
    
    // Loading states
    isLoading,
    analyticsLoading,
    conversionLoading,
    
    // Error states
    error,
    
    // Mutations
    createLead: createLeadMutation.mutate,
    updateLead: updateLeadMutation.mutate,
    deleteLead: deleteLeadMutation.mutate,
    convertLead: convertLeadMutation.mutate,
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    
    // Mutation states
    isCreating: createLeadMutation.isPending,
    isUpdating: updateLeadMutation.isPending,
    isDeleting: deleteLeadMutation.isPending,
    isConverting: convertLeadMutation.isPending,
    
    // Filters and sorting
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    
    // Advanced features
    getLeadInsights,
    qualifyLead,
    rescoreLeads,
    
    // Utilities
    getLeadsByStatus,
    getLeadsByScore,
    refetch,
  };
};

export default useLeads;