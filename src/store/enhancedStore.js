import { create } from 'zustand';
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Stable fallbacks to avoid returning new object/array references on each render.
// New references from selectors can trigger infinite update loops with useSyncExternalStore.
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

// Enhanced CRM Store with AI capabilities and real-time features
const useEnhancedStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        // Core Data State
        data: {
          leads: [],
          contacts: [],
          deals: [],
          accounts: [],
          tasks: [],
          activities: [],
          notifications: [],
        },

        // AI Analytics State
        analytics: {
          leadAnalytics: {
            statusDistribution: {},
            conversionRate: 0,
            qualifiedLeads: 0,
            insights: [],
            trends: [],
          },
          dealAnalytics: {
            stageDistribution: {},
            stageValues: {},
            winRate: 0,
            averageDealSize: 0,
            atRiskDeals: 0,
            recommendations: [],
          },
          dashboardAnalytics: {
            trends: [],
            forecast: {
              nextMonth: 0,
              nextQuarter: 0,
            },
            metrics: {},
          },
        },

        // UI State
        ui: {
          loading: {
            app: false,
            leads: false,
            contacts: false,
            deals: false,
            accounts: false,
            tasks: false,
            analytics: false,
          },
          errors: {},
          filters: {
            leads: {},
            contacts: {},
            deals: {},
            accounts: {},
            tasks: {},
          },
          selectedItems: {
            leads: [],
            contacts: [],
            deals: [],
            accounts: [],
            tasks: [],
          },
        },

        // Real-time Features
        realTime: {
          isConnected: false,
          lastUpdate: null,
          notifications: [],
          activeUsers: [],
        },

        // AI Features State
        ai: {
          leadScoring: {
            enabled: true,
            model: 'advanced',
            threshold: 0.7,
          },
          dealInsights: {
            enabled: true,
            riskAnalysis: true,
            revenueForecasting: true,
          },
          conversationalAI: {
            enabled: true,
            sentimentAnalysis: true,
            autoResponses: false,
          },
        },

        // Actions
        actions: {
          // Data Management Actions
          setData: (entityType, data) =>
            set((state) => {
              state.data[entityType] = data;
            }),

          addItem: (entityType, item) =>
            set((state) => {
              state.data[entityType].push({
                ...item,
                id: item.id || Date.now().toString(),
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }),

          updateItem: (entityType, id, updates) =>
            set((state) => {
              const index = state.data[entityType].findIndex(item => item.id === id);
              if (index !== -1) {
                state.data[entityType][index] = {
                  ...state.data[entityType][index],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                };
              }
            }),

          deleteItem: (entityType, id) =>
            set((state) => {
              state.data[entityType] = state.data[entityType].filter(item => item.id !== id);
            }),

          bulkUpdate: (entityType, ids, updates) =>
            set((state) => {
              ids.forEach(id => {
                const index = state.data[entityType].findIndex(item => item.id === id);
                if (index !== -1) {
                  state.data[entityType][index] = {
                    ...state.data[entityType][index],
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  };
                }
              });
            }),

          // Analytics Actions
          setAnalytics: (analyticsType, data) =>
            set((state) => {
              state.analytics[analyticsType] = { ...state.analytics[analyticsType], ...data };
            }),

          updateLeadAnalytics: (analytics) =>
            set((state) => {
              state.analytics.leadAnalytics = { ...state.analytics.leadAnalytics, ...analytics };
            }),

          updateDealAnalytics: (analytics) =>
            set((state) => {
              state.analytics.dealAnalytics = { ...state.analytics.dealAnalytics, ...analytics };
            }),

          updateDashboardAnalytics: (analytics) =>
            set((state) => {
              state.analytics.dashboardAnalytics = { ...state.analytics.dashboardAnalytics, ...analytics };
            }),

          // UI State Actions
          setLoading: (entityType, loading) =>
            set((state) => {
              if (!state.ui) {
                state.ui = { 
                  loading: {
                    app: false,
                    leads: false,
                    contacts: false,
                    deals: false,
                    accounts: false,
                    tasks: false,
                    analytics: false,
                  }, 
                  errors: {}, 
                  filters: {},
                  selectedItems: {}
                };
              }
              if (!state.ui.loading) {
                state.ui.loading = {
                  app: false,
                  leads: false,
                  contacts: false,
                  deals: false,
                  accounts: false,
                  tasks: false,
                  analytics: false,
                };
              }
              state.ui.loading[entityType] = loading;
            }),

          setError: (entityType, error) =>
            set((state) => {
              if (!state.ui) {
                state.ui = { loading: {}, errors: {}, filters: {} };
              }
              if (!state.ui.errors) {
                state.ui.errors = {};
              }
              state.ui.errors[entityType] = error;
            }),

          clearError: (entityType) =>
            set((state) => {
              delete state.ui.errors[entityType];
            }),

          setFilters: (entityType, filters) =>
            set((state) => {
              state.ui.filters[entityType] = { ...state.ui.filters[entityType], ...filters };
            }),

          clearFilters: (entityType) =>
            set((state) => {
              state.ui.filters[entityType] = {};
            }),

          setSelectedItems: (entityType, items) =>
            set((state) => {
              state.ui.selectedItems[entityType] = items;
            }),

          // Real-time Actions
          setConnectionStatus: (isConnected) =>
            set((state) => {
              state.realTime.isConnected = isConnected;
              state.realTime.lastUpdate = new Date().toISOString();
            }),

          addNotification: (notification) =>
            set((state) => {
              state.realTime.notifications.unshift({
                ...notification,
                id: notification.id || Date.now().toString(),
                timestamp: new Date().toISOString(),
                read: false,
              });
              // Keep only last 50 notifications
              if (state.realTime.notifications.length > 50) {
                state.realTime.notifications = state.realTime.notifications.slice(0, 50);
              }
            }),

          markNotificationRead: (id) =>
            set((state) => {
              const notification = state.realTime.notifications.find(n => n.id === id);
              if (notification) {
                notification.read = true;
              }
            }),

          dismissNotification: (id) =>
            set((state) => {
              state.realTime.notifications = state.realTime.notifications.filter(n => n.id !== id);
            }),

          clearAllNotifications: () =>
            set((state) => {
              state.realTime.notifications = [];
            }),

          // AI Configuration Actions
          updateAIConfig: (feature, config) =>
            set((state) => {
              state.ai[feature] = { ...state.ai[feature], ...config };
            }),

          toggleAIFeature: (feature) =>
            set((state) => {
              state.ai[feature].enabled = !state.ai[feature].enabled;
            }),

          // Computed Getters
          getFilteredData: (entityType) => {
            const state = get();
            const data = state.data[entityType] || [];
            const filters = state.ui.filters[entityType] || {};
            
            if (Object.keys(filters).length === 0) return data;
            
            return data.filter(item => {
              return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                if (typeof value === 'string') {
                  return item[key]?.toLowerCase().includes(value.toLowerCase());
                }
                if (Array.isArray(value)) {
                  return value.includes(item[key]);
                }
                return item[key] === value;
              });
            });
          },

          getEntityStats: (entityType) => {
            const state = get();
            const data = (state && state.data && state.data[entityType]) ? state.data[entityType] : [];
            const filtered = state?.actions?.getFilteredData ? state.actions.getFilteredData(entityType) : [];
            
            return {
              total: data.length,
              filtered: filtered.length,
              selected: state?.ui?.selectedItems?.[entityType]?.length || 0,
              recent: data.filter(item => {
                const createdAt = new Date(item.createdAt);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return createdAt > weekAgo;
              }).length,
            };
          },

          // Utility Actions
          reset: () =>
            set((state) => {
              // Reset to initial state but preserve AI config
              const aiConfig = state.ai;
              Object.assign(state, {
                data: {
                  leads: [],
                  contacts: [],
                  deals: [],
                  accounts: [],
                  tasks: [],
                  activities: [],
                  notifications: [],
                },
                analytics: {
                  leadAnalytics: {
                    statusDistribution: {},
                    conversionRate: 0,
                    qualifiedLeads: 0,
                    insights: [],
                    trends: [],
                  },
                  dealAnalytics: {
                    stageDistribution: {},
                    stageValues: {},
                    winRate: 0,
                    averageDealSize: 0,
                    atRiskDeals: 0,
                    recommendations: [],
                  },
                  dashboardAnalytics: {
                    trends: [],
                    forecast: { nextMonth: 0, nextQuarter: 0 },
                    metrics: {},
                  },
                },
                ui: {
                  loading: {
                    leads: false,
                    contacts: false,
                    deals: false,
                    accounts: false,
                    tasks: false,
                    analytics: false,
                  },
                  errors: {},
                  filters: {
                    leads: {},
                    contacts: {},
                    deals: {},
                    accounts: {},
                    tasks: {},
                  },
                  selectedItems: {
                    leads: [],
                    contacts: [],
                    deals: [],
                    accounts: [],
                    tasks: [],
                  },
                },
                realTime: {
                  isConnected: false,
                  lastUpdate: null,
                  notifications: [],
                  activeUsers: [],
                },
                ai: aiConfig,
              });
            }),

          refresh: async (entityType) => {
            const state = get();
            state.actions.setLoading(entityType, true);
            state.actions.clearError(entityType);
            
            try {
              // This would typically call an API
              // For now, we'll simulate a refresh
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Update last refresh time
              set((state) => {
                state.realTime.lastUpdate = new Date().toISOString();
              });
            } catch (error) {
              state.actions.setError(entityType, error.message);
            } finally {
              state.actions.setLoading(entityType, false);
            }
          },
        },
      })),
      {
        name: 'enhanced-crm-store',
        partialize: (state) => ({
          ai: state.ai,
          ui: {
            filters: state.ui.filters,
          },
        }),
      }
    ),
    {
      name: 'enhanced-crm-store',
    }
  )
);

export default useEnhancedStore;

// Selector hooks for better performance
export const useEnhancedData = (entityType) => 
  useEnhancedStore((state) => state?.data?.[entityType] || EMPTY_ARR);

export const useEnhancedAnalytics = (analyticsType) => 
  useEnhancedStore((state) => state?.analytics?.[analyticsType] || EMPTY_OBJ);

export const useEnhancedUI = (entityType) => {
  const loading = useEnhancedStore((state) => state?.ui?.loading?.[entityType] || false);
  const error = useEnhancedStore((state) => state?.ui?.errors?.[entityType] || null);
  const filters = useEnhancedStore((state) => state?.ui?.filters?.[entityType] || EMPTY_OBJ);
  const selectedItems = useEnhancedStore((state) => state?.ui?.selectedItems?.[entityType] || EMPTY_ARR);
  return useMemo(() => ({ loading, error, filters, selectedItems }), [loading, error, filters, selectedItems]);
};

export const useRealTimeFeatures = () => 
  useEnhancedStore((state) => state?.realTime || { notifications: EMPTY_ARR, isConnected: false });

export const useAIConfig = () => 
  useEnhancedStore((state) => state?.ai || EMPTY_OBJ);

export const useEnhancedActions = () => 
  useEnhancedStore((state) => state?.actions || EMPTY_OBJ);
