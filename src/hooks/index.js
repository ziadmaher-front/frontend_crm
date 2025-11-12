// Centralized Hooks System - Modern Business Logic Layer
export { default as useAuth } from './useAuth';
export { default as useApi } from './useApi';
export { default as usePagination } from './usePagination';
export { default as useSearch } from './useSearch';
export { default as useFilters } from './useFilters';
export { default as useSort } from './useSort';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useDebounce } from './useDebounce';
export { default as useInfiniteScroll } from './useInfiniteScroll';
export { default as useWebSocket } from './useWebSocket';
export { default as useNotifications } from './useNotifications';
export { default as usePermissions } from './usePermissions';
export { default as useTheme } from './useTheme';
export { default as useKeyboardShortcuts } from './useKeyboardShortcuts';
export { default as useClipboard } from './useClipboard';
export { default as useGeolocation } from './useGeolocation';
export { default as useOnlineStatus } from './useOnlineStatus';
export { default as useMediaQuery } from './useMediaQuery';
export { default as useClickOutside } from './useClickOutside';
export { default as useFocusTrap } from './useFocusTrap';
export { default as useIntersectionObserver } from './useIntersectionObserver';

// Business Logic Hooks
export { default as useLeads } from './business/useLeads';
export { default as useContacts } from './business/useContacts';
export { default as useAccounts } from './business/useAccounts';
export { default as useDeals } from './business/useDeals';
export { default as useActivities } from './business/useActivities';
export { default as useTasks } from './business/useTasks';
export { default as useProducts } from './business/useProducts';
export { default as useQuotes } from './business/useQuotes';
export { default as useCampaigns } from './business/useCampaigns';
export { default as useReports } from './business/useReports';
export { default as useForecasting } from './business/useForecasting';
export { default as useWorkflows } from './business/useWorkflows';
export { default as useAnalytics } from './business/useAnalytics';

// AI & ML Hooks
export { default as useAIInsights } from './ai/useAIInsights';
export { default as useLeadScoring } from './ai/useLeadScoring';
export { default as usePredictiveAnalytics } from './ai/usePredictiveAnalytics';
export { default as useRecommendations } from './ai/useRecommendations';
export { default as useSentimentAnalysis } from './ai/useSentimentAnalysis';
export { default as useNaturalLanguageQuery } from './ai/useNaturalLanguageQuery';

// Performance & Optimization Hooks
export { default as useVirtualization } from './performance/useVirtualization';
export { default as useMemoizedCallback } from './performance/useMemoizedCallback';
export { default as useOptimisticUpdates } from './performance/useOptimisticUpdates';
export { default as useBatchedUpdates } from './performance/useBatchedUpdates';
export { default as useResourcePreloader } from './performance/useResourcePreloader';

// Integration Hooks
export { default as useEmailIntegration } from './integrations/useEmailIntegration';
export { default as useCalendarIntegration } from './integrations/useCalendarIntegration';
export { default as useSocialMediaIntegration } from './integrations/useSocialMediaIntegration';
export { default as usePaymentIntegration } from './integrations/usePaymentIntegration';
export { default as useThirdPartySync } from './integrations/useThirdPartySync';