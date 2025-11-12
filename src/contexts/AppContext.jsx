import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Action types
export const ActionTypes = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Entity actions
  SET_ENTITIES: 'SET_ENTITIES',
  ADD_ENTITY: 'ADD_ENTITY',
  UPDATE_ENTITY: 'UPDATE_ENTITY',
  DELETE_ENTITY: 'DELETE_ENTITY',
  
  // UI state
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_THEME: 'SET_THEME',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // User state
  SET_USER: 'SET_USER',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  
  // Search and filters
  SET_GLOBAL_SEARCH: 'SET_GLOBAL_SEARCH',
  SET_FILTERS: 'SET_FILTERS',
  
  // Dashboard metrics
  SET_METRICS: 'SET_METRICS',
  UPDATE_METRICS: 'UPDATE_METRICS',
  
  // Accessibility settings
  SET_ACCESSIBILITY_SETTING: 'SET_ACCESSIBILITY_SETTING'
};

// Initial state
const initialState = {
  // Loading and error states
  loading: {
    global: false,
    entities: {},
    operations: {}
  },
  errors: {
    global: null,
    entities: {},
    operations: {}
  },
  
  // Entity data
  entities: {
    leads: [],
    contacts: [],
    deals: [],
    accounts: [],
    tasks: [],
    activities: [],
    products: [],
    quotes: []
  },
  
  // UI state
  ui: {
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
    globalSearch: {
      query: '',
      results: [],
      isSearching: false
    },
    filters: {
      leads: {},
      contacts: {},
      deals: {},
      accounts: {},
      tasks: {}
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      focusVisible: true,
      announcements: true,
      colorBlindFriendly: false
    }
  },
  
  // User state
  user: {
    profile: null,
    permissions: [],
    preferences: {}
  },
  
  // Dashboard metrics
  metrics: {
    overview: {},
    revenue: {},
    pipeline: {},
    activities: {},
    performance: {}
  }
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error
        }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: null
        }
      };
      
    case ActionTypes.SET_ENTITIES:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.entityType]: action.payload.data
        }
      };
      
    case ActionTypes.ADD_ENTITY:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.entityType]: [
            action.payload.entity,
            ...state.entities[action.payload.entityType]
          ]
        }
      };
      
    case ActionTypes.UPDATE_ENTITY:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.entityType]: state.entities[action.payload.entityType].map(
            item => item.id === action.payload.entity.id ? action.payload.entity : item
          )
        }
      };
      
    case ActionTypes.DELETE_ENTITY:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.entityType]: state.entities[action.payload.entityType].filter(
            item => item.id !== action.payload.id
          )
        }
      };
      
    case ActionTypes.SET_SIDEBAR_OPEN:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: action.payload
        }
      };
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };
      
    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: action.payload
        }
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            { ...action.payload, id: Date.now() }
          ]
        }
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            notification => notification.id !== action.payload
          )
        }
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: {
          ...state.user,
          profile: action.payload
        }
      };
      
    case ActionTypes.SET_PERMISSIONS:
      return {
        ...state,
        user: {
          ...state.user,
          permissions: action.payload
        }
      };
      
    case ActionTypes.SET_GLOBAL_SEARCH:
      return {
        ...state,
        ui: {
          ...state.ui,
          globalSearch: {
            ...state.ui.globalSearch,
            ...action.payload
          }
        }
      };
      
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: {
            ...state.ui.filters,
            [action.payload.entityType]: action.payload.filters
          }
        }
      };
      
    case ActionTypes.SET_METRICS:
      return {
        ...state,
        metrics: {
          ...state.metrics,
          [action.payload.key]: action.payload.data
        }
      };
      
    case ActionTypes.UPDATE_METRICS:
      return {
        ...state,
        metrics: {
          ...state.metrics,
          [action.payload.key]: {
            ...state.metrics[action.payload.key],
            ...action.payload.updates
          }
        }
      };
      
    case ActionTypes.SET_ACCESSIBILITY_SETTING:
      return {
        ...state,
        ui: {
          ...state.ui,
          accessibility: {
            ...state.ui.accessibility,
            [action.payload.key]: action.payload.value
          }
        }
      };
      
    default:
      return state;
  }
}

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hooks for using context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

// Combined hook for convenience
export function useApp() {
  return {
    state: useAppState(),
    dispatch: useAppDispatch()
  };
}

// Action creators
export const actions = {
  setLoading: (key, value) => ({
    type: ActionTypes.SET_LOADING,
    payload: { key, value }
  }),
  
  setError: (key, error) => ({
    type: ActionTypes.SET_ERROR,
    payload: { key, error }
  }),
  
  clearError: (key) => ({
    type: ActionTypes.CLEAR_ERROR,
    payload: { key }
  }),
  
  setEntities: (entityType, data) => ({
    type: ActionTypes.SET_ENTITIES,
    payload: { entityType, data }
  }),
  
  addEntity: (entityType, entity) => ({
    type: ActionTypes.ADD_ENTITY,
    payload: { entityType, entity }
  }),
  
  updateEntity: (entityType, entity) => ({
    type: ActionTypes.UPDATE_ENTITY,
    payload: { entityType, entity }
  }),
  
  deleteEntity: (entityType, id) => ({
    type: ActionTypes.DELETE_ENTITY,
    payload: { entityType, id }
  }),
  
  setSidebarOpen: (open) => ({
    type: ActionTypes.SET_SIDEBAR_OPEN,
    payload: open
  }),
  
  setTheme: (theme) => ({
    type: ActionTypes.SET_THEME,
    payload: theme
  }),
  
  addNotification: (notification) => ({
    type: ActionTypes.ADD_NOTIFICATION,
    payload: notification
  }),
  
  removeNotification: (id) => ({
    type: ActionTypes.REMOVE_NOTIFICATION,
    payload: id
  }),
  
  setUser: (user) => ({
    type: ActionTypes.SET_USER,
    payload: user
  }),
  
  setPermissions: (permissions) => ({
    type: ActionTypes.SET_PERMISSIONS,
    payload: permissions
  }),
  
  setGlobalSearch: (searchData) => ({
    type: ActionTypes.SET_GLOBAL_SEARCH,
    payload: searchData
  }),
  
  setFilters: (entityType, filters) => ({
    type: ActionTypes.SET_FILTERS,
    payload: { entityType, filters }
  }),
  
  setMetrics: (key, data) => ({
    type: ActionTypes.SET_METRICS,
    payload: { key, data }
  }),
  
  updateMetrics: (key, updates) => ({
    type: ActionTypes.UPDATE_METRICS,
    payload: { key, updates }
  })
};

// Selectors for computed state
export const selectors = {
  // Entity selectors
  getEntities: (state, entityType) => state.entities[entityType] || [],
  getEntityById: (state, entityType, id) => 
    state.entities[entityType]?.find(entity => entity.id === id),
  
  // Loading selectors
  isLoading: (state, key) => state.loading[key] || false,
  isGlobalLoading: (state) => state.loading.global,
  
  // Error selectors
  getError: (state, key) => state.errors[key],
  hasErrors: (state) => Object.values(state.errors).some(error => error !== null),
  
  // UI selectors
  isSidebarOpen: (state) => state.ui.sidebarOpen,
  getCurrentTheme: (state) => state.ui.theme,
  getNotifications: (state) => state.ui.notifications,
  getGlobalSearch: (state) => state.ui.globalSearch,
  getFilters: (state, entityType) => state.ui.filters[entityType] || {},
  
  // User selectors
  getCurrentUser: (state) => state.user.profile,
  getUserPermissions: (state) => state.user.permissions,
  hasPermission: (state, permission) => 
    state.user.permissions.includes(permission),
  
  // Metrics selectors
  getMetrics: (state, key) => state.metrics[key] || {},
  getAllMetrics: (state) => state.metrics
};

// Higher-order component for providing app context
export function withAppContext(Component) {
  const WrappedComponent = (props) => (
    <AppProvider>
      <Component {...props} />
    </AppProvider>
  );
  
  WrappedComponent.displayName = `withAppContext(${Component.displayName || Component.name})`;
  return WrappedComponent;
}