// Modern State Management with Zustand
// Replacing Context API for better performance and developer experience

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Auth Store
export const useAuthStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Simulate API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });

            if (response.ok) {
              const userData = await response.json();
              set((state) => {
                state.user = userData.user;
                state.permissions = userData.permissions;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } else {
              throw new Error('Login failed');
            }
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
          }
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.permissions = [];
            state.isAuthenticated = false;
            state.error = null;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        hasPermission: (permission) => {
          const { permissions } = get();
          return permissions.includes(permission);
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          permissions: state.permissions,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// UI Store
export const useUIStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        sidebarOpen: true,
        theme: 'light',
        notifications: [],
        globalSearch: {
          query: '',
          results: [],
          isSearching: false,
        },
        modals: {
          createLead: false,
          createDeal: false,
          createContact: false,
          settings: false,
        },
        filters: {},
        loading: {},

        // Actions
        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        setSidebarOpen: (open) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        setTheme: (theme) => {
          set((state) => {
            state.theme = theme;
          });
          
          // Apply theme to document
          document.documentElement.setAttribute('data-theme', theme);
        },

        addNotification: (notification) => {
          set((state) => {
            state.notifications.push({
              ...notification,
              id: Date.now(),
              timestamp: new Date().toISOString(),
            });
          });

          // Auto-remove after 5 seconds
          setTimeout(() => {
            get().removeNotification(notification.id || Date.now());
          }, 5000);
        },

        removeNotification: (id) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        setGlobalSearch: (searchData) => {
          set((state) => {
            Object.assign(state.globalSearch, searchData);
          });
        },

        openModal: (modalName) => {
          set((state) => {
            state.modals[modalName] = true;
          });
        },

        closeModal: (modalName) => {
          set((state) => {
            state.modals[modalName] = false;
          });
        },

        setLoading: (key, value) => {
          set((state) => {
            state.loading[key] = value;
          });
        },

        setFilters: (entityType, filters) => {
          set((state) => {
            state.filters[entityType] = filters;
          });
        },
      })),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Entities Store (for CRM data)
export const useEntitiesStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        leads: [],
        contacts: [],
        deals: [],
        accounts: [],
        tasks: [],
        activities: [],
        products: [],
        quotes: [],
        
        // Loading states
        loading: {
          leads: false,
          contacts: false,
          deals: false,
          accounts: false,
          tasks: false,
        },
        
        // Error states
        errors: {},

        // Actions
        setEntities: (entityType, data) => {
          set((state) => {
            state[entityType] = data;
          });
        },

        addEntity: (entityType, entity) => {
          set((state) => {
            state[entityType].unshift(entity);
          });
        },

        updateEntity: (entityType, id, updates) => {
          set((state) => {
            const index = state[entityType].findIndex(item => item.id === id);
            if (index !== -1) {
              Object.assign(state[entityType][index], updates);
            }
          });
        },

        deleteEntity: (entityType, id) => {
          set((state) => {
            state[entityType] = state[entityType].filter(item => item.id !== id);
          });
        },

        setLoading: (entityType, loading) => {
          set((state) => {
            state.loading[entityType] = loading;
          });
        },

        setError: (entityType, error) => {
          set((state) => {
            state.errors[entityType] = error;
          });
        },

        clearError: (entityType) => {
          set((state) => {
            delete state.errors[entityType];
          });
        },

        // Selectors
        getEntityById: (entityType, id) => {
          const { [entityType]: entities } = get();
          return entities.find(entity => entity.id === id);
        },

        getEntitiesByFilter: (entityType, filterFn) => {
          const { [entityType]: entities } = get();
          return entities.filter(filterFn);
        },
      }))
    ),
    { name: 'EntitiesStore' }
  )
);

// Analytics Store
export const useAnalyticsStore = create()(
  devtools(
    immer((set, get) => ({
      metrics: {
        overview: {},
        revenue: {},
        pipeline: {},
        activities: {},
        performance: {},
      },
      dashboardData: null,
      reportsData: {},
      loading: false,
      lastUpdated: null,

      // Actions
      setMetrics: (key, data) => {
        set((state) => {
          state.metrics[key] = data;
          state.lastUpdated = new Date().toISOString();
        });
      },

      updateMetrics: (key, updates) => {
        set((state) => {
          Object.assign(state.metrics[key], updates);
          state.lastUpdated = new Date().toISOString();
        });
      },

      setDashboardData: (data) => {
        set((state) => {
          state.dashboardData = data;
          state.lastUpdated = new Date().toISOString();
        });
      },

      setReportData: (reportType, data) => {
        set((state) => {
          state.reportsData[reportType] = data;
        });
      },

      setLoading: (loading) => {
        set((state) => {
          state.loading = loading;
        });
      },

      // Computed values
      getTotalRevenue: () => {
        const { metrics } = get();
        return metrics.revenue?.total || 0;
      },

      getPipelineValue: () => {
        const { metrics } = get();
        return metrics.pipeline?.totalValue || 0;
      },

      getConversionRate: () => {
        const { metrics } = get();
        return metrics.performance?.conversionRate || 0;
      },
    }),
    { name: 'AnalyticsStore' }
  )
);

// Store hooks for easier usage
export const useStores = () => ({
  auth: useAuthStore(),
  ui: useUIStore(),
  entities: useEntitiesStore(),
  analytics: useAnalyticsStore(),
});

// Store selectors
export const authSelectors = {
  isAuthenticated: (state) => state.isAuthenticated,
  user: (state) => state.user,
  permissions: (state) => state.permissions,
  hasPermission: (permission) => (state) => state.permissions.includes(permission),
};

export const uiSelectors = {
  sidebarOpen: (state) => state.sidebarOpen,
  theme: (state) => state.theme,
  notifications: (state) => state.notifications,
  isLoading: (key) => (state) => state.loading[key] || false,
  modalOpen: (modalName) => (state) => state.modals[modalName] || false,
};

export const entitiesSelectors = {
  entities: (entityType) => (state) => state[entityType] || [],
  entityById: (entityType, id) => (state) => 
    state[entityType]?.find(entity => entity.id === id),
  isLoading: (entityType) => (state) => state.loading[entityType] || false,
  error: (entityType) => (state) => state.errors[entityType],
};

// Store actions for external use
export const storeActions = {
  auth: {
    login: (credentials) => useAuthStore.getState().login(credentials),
    logout: () => useAuthStore.getState().logout(),
  },
  ui: {
    addNotification: (notification) => useUIStore.getState().addNotification(notification),
    openModal: (modalName) => useUIStore.getState().openModal(modalName),
    closeModal: (modalName) => useUIStore.getState().closeModal(modalName),
  },
  entities: {
    setEntities: (entityType, data) => useEntitiesStore.getState().setEntities(entityType, data),
    addEntity: (entityType, entity) => useEntitiesStore.getState().addEntity(entityType, entity),
    updateEntity: (entityType, id, updates) => useEntitiesStore.getState().updateEntity(entityType, id, updates),
    deleteEntity: (entityType, id) => useEntitiesStore.getState().deleteEntity(entityType, id),
  },
};