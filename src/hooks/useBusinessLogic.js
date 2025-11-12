// Custom hooks for business logic
// These hooks provide a clean interface between components and services

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  contactService,
  dealService,
  leadService,
  accountService,
  taskService,
  analyticsService
} from '@/services';

// Generic hook for CRUD operations
export const useEntity = (service, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchData = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getAll({ ...options, filters });
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service, filters]);

  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.create(itemData);
      if (result.success) {
        setData(prev => [result.data, ...prev]);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateItem = useCallback(async (id, itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.update(id, itemData);
      if (result.success) {
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, ...result.data } : item
        ));
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.delete(id);
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id));
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    createItem,
    updateItem,
    deleteItem,
    refresh
  };
};

// Contacts hook
export const useContacts = (initialFilters = {}) => {
  const entityHook = useEntity(contactService, initialFilters);
  
  const searchContacts = useCallback(async (query) => {
    const result = await contactService.searchByName(query);
    return result.success ? result.data : [];
  }, []);

  const getContactsByAccount = useCallback(async (accountId) => {
    const result = await contactService.getByAccount(accountId);
    return result.success ? result.data : [];
  }, []);

  return {
    ...entityHook,
    searchContacts,
    getContactsByAccount
  };
};

// Deals hook
export const useDeals = (initialFilters = {}) => {
  const entityHook = useEntity(dealService, initialFilters);
  const [pipelineData, setPipelineData] = useState({});
  const [revenueMetrics, setRevenueMetrics] = useState({});

  const fetchPipelineData = useCallback(async () => {
    const result = await dealService.getPipelineData();
    if (result.success) {
      setPipelineData(result.data);
    }
  }, []);

  const fetchRevenueMetrics = useCallback(async () => {
    const result = await dealService.getRevenueMetrics();
    if (result.success) {
      setRevenueMetrics(result.data);
    }
  }, []);

  const getDealsByStage = useCallback(async (stage) => {
    const result = await dealService.getByStage(stage);
    return result.success ? result.data : [];
  }, []);

  useEffect(() => {
    fetchPipelineData();
    fetchRevenueMetrics();
  }, [fetchPipelineData, fetchRevenueMetrics]);

  return {
    ...entityHook,
    pipelineData,
    revenueMetrics,
    getDealsByStage,
    refreshPipeline: fetchPipelineData,
    refreshMetrics: fetchRevenueMetrics
  };
};

// Leads hook
export const useLeads = (initialFilters = {}) => {
  const entityHook = useEntity(leadService, initialFilters);

  const getLeadsByStatus = useCallback(async (status) => {
    const result = await leadService.getByStatus(status);
    return result.success ? result.data : [];
  }, []);

  const getLeadsBySource = useCallback(async (source) => {
    const result = await leadService.getBySource(source);
    return result.success ? result.data : [];
  }, []);

  const convertLead = useCallback(async (leadId, contactData = {}) => {
    const result = await leadService.convertToContact(leadId, contactData);
    if (result.success) {
      // Refresh leads data after conversion
      entityHook.refresh();
      return result.data;
    }
    return null;
  }, [entityHook]);

  return {
    ...entityHook,
    getLeadsByStatus,
    getLeadsBySource,
    convertLead
  };
};

// Accounts hook
export const useAccounts = (initialFilters = {}) => {
  const entityHook = useEntity(accountService, initialFilters);

  const getAccountWithContacts = useCallback(async (accountId) => {
    const result = await accountService.getWithContacts(accountId);
    return result.success ? result.data : null;
  }, []);

  const getRevenueByIndustry = useCallback(async () => {
    const result = await accountService.getRevenueByIndustry();
    return result.success ? result.data : {};
  }, []);

  return {
    ...entityHook,
    getAccountWithContacts,
    getRevenueByIndustry
  };
};

// Tasks hook
export const useTasks = (initialFilters = {}) => {
  const entityHook = useEntity(taskService, initialFilters);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const fetchOverdueTasks = useCallback(async () => {
    const result = await taskService.getOverdueTasks();
    if (result.success) {
      setOverdueTasks(result.data);
    }
  }, []);

  const fetchUpcomingTasks = useCallback(async (days = 7) => {
    const result = await taskService.getUpcomingTasks(days);
    if (result.success) {
      setUpcomingTasks(result.data);
    }
  }, []);

  const getTasksByStatus = useCallback(async (status) => {
    const result = await taskService.getByStatus(status);
    return result.success ? result.data : [];
  }, []);

  useEffect(() => {
    fetchOverdueTasks();
    fetchUpcomingTasks();
  }, [fetchOverdueTasks, fetchUpcomingTasks]);

  return {
    ...entityHook,
    overdueTasks,
    upcomingTasks,
    getTasksByStatus,
    refreshOverdue: fetchOverdueTasks,
    refreshUpcoming: fetchUpcomingTasks
  };
};

// Dashboard analytics hook
export const useDashboardAnalytics = () => {
  const [metrics, setMetrics] = useState({});
  const [activityMetrics, setActivityMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getDashboardMetrics();
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivityMetrics = useCallback(async (period = 'month') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getActivityMetrics(period);
      if (result.success) {
        setActivityMetrics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchDashboardMetrics();
    fetchActivityMetrics();
  }, [fetchDashboardMetrics, fetchActivityMetrics]);

  useEffect(() => {
    fetchDashboardMetrics();
    fetchActivityMetrics();
  }, [fetchDashboardMetrics, fetchActivityMetrics]);

  return {
    metrics,
    activityMetrics,
    loading,
    error,
    refresh,
    fetchActivityMetrics
  };
};

// Search hook for global search functionality
export const useGlobalSearch = () => {
  const [results, setResults] = useState({
    contacts: [],
    deals: [],
    leads: [],
    accounts: [],
    tasks: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults({
        contacts: [],
        deals: [],
        leads: [],
        accounts: [],
        tasks: []
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [contacts, deals, leads, accounts, tasks] = await Promise.all([
        contactService.searchByName(query),
        dealService.getAll({ filters: { name: query } }),
        leadService.getAll({ filters: { name: query } }),
        accountService.getAll({ filters: { name: query } }),
        taskService.getAll({ filters: { subject: query } })
      ]);

      setResults({
        contacts: contacts.success ? contacts.data : [],
        deals: deals.success ? deals.data : [],
        leads: leads.success ? leads.data : [],
        accounts: accounts.success ? accounts.data : [],
        tasks: tasks.success ? tasks.data : []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalResults = useMemo(() => {
    return Object.values(results).reduce((total, arr) => total + arr.length, 0);
  }, [results]);

  return {
    results,
    totalResults,
    loading,
    error,
    search
  };
};