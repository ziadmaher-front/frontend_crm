// Modern Routing System with Protected Routes and Enhanced Navigation
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import Layout from '@/pages/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const OptimizedDashboard = lazy(() => import('@/pages/OptimizedDashboard'));
const Leads = lazy(() => import('@/pages/Leads'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Accounts = lazy(() => import('@/pages/Accounts'));
const Deals = lazy(() => import('@/pages/Deals'));
const Activities = lazy(() => import('@/pages/Activities'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));
const EmailTemplates = lazy(() => import('@/pages/EmailTemplates'));
const Reports = lazy(() => import('@/pages/Reports'));
const PurchaseOrders = lazy(() => import('@/pages/PurchaseOrders'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Approvals = lazy(() => import('@/pages/Approvals'));
const Documents = lazy(() => import('@/pages/Documents'));
const Forecasting = lazy(() => import('@/pages/Forecasting'));
const Security = lazy(() => import('@/pages/Security'));
const UserExperience = lazy(() => import('@/pages/UserExperience'));
const CreateUser = lazy(() => import('@/pages/admin/CreateUser'));

// AI & Intelligence
const AIDashboard = lazy(() => import('@/components/dashboard/AIDashboard'));
const AIPerformanceDashboard = lazy(() => import('@/pages/AIPerformanceDashboard'));
const EnhancedAIDashboard = lazy(() => import('@/pages/EnhancedAIDashboard'));
const AISystemMonitor = lazy(() => import('@/components/AISystemMonitor'));

// AI Feature Pages with error handling
const AILeadQualification = lazy(() => {
  console.log('Loading AILeadQualification...');
  return import('@/pages/AILeadQualification').catch(err => {
    console.error('Failed to load AILeadQualification:', err);
    return { default: () => <div className="p-8 text-center">Error loading AI Lead Qualification. Please refresh the page.</div> };
  });
});
const IntelligentDealInsights = lazy(() => {
  console.log('Loading IntelligentDealInsights...');
  return import('@/pages/IntelligentDealInsights').catch(err => {
    console.error('Failed to load IntelligentDealInsights:', err);
    return { default: () => <div className="p-8 text-center">Error loading Intelligent Deal Insights. Please refresh the page.</div> };
  });
});
const ConversationalAI = lazy(() => {
  console.log('Loading ConversationalAI...');
  return import('@/pages/ConversationalAI').catch(err => {
    console.error('Failed to load ConversationalAI:', err);
    return { default: () => <div className="p-8 text-center">Error loading Conversational AI. Please refresh the page.</div> };
  });
});
const RealTimeBI = lazy(() => {
  console.log('Loading RealTimeBI...');
  return import('@/pages/RealTimeBI').catch(err => {
    console.error('Failed to load RealTimeBI:', err);
    return { default: () => <div className="p-8 text-center">Error loading Real-Time BI. Please refresh the page.</div> };
  });
});
const WorkflowAutomation = lazy(() => {
  console.log('Loading WorkflowAutomation...');
  return import('@/pages/WorkflowAutomation').catch(err => {
    console.error('Failed to load WorkflowAutomation:', err);
    return { default: () => <div className="p-8 text-center">Error loading Workflow Automation. Please refresh the page.</div> };
  });
});
const PredictiveAnalytics = lazy(() => {
  console.log('Loading PredictiveAnalytics...');
  return import('@/components/PredictiveAnalytics').catch(err => {
    console.error('Failed to load PredictiveAnalytics:', err);
    return { default: () => <div className="p-8 text-center">Error loading Predictive Analytics. Please refresh the page.</div> };
  });
});

// Detail pages
const LeadDetails = lazy(() => import('@/pages/LeadDetails'));
const ContactDetails = lazy(() => import('@/pages/ContactDetails'));
const AccountDetails = lazy(() => import('@/pages/AccountDetails'));
// DealDetails doesn't exist yet - using Deals page for now
// const DealDetails = lazy(() => import('@/pages/DealDetails'));

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const OAuthCallback = lazy(() => import('@/pages/auth/OAuthCallback'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Error pages
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const Unauthorized = lazy(() => import('@/pages/errors/Unauthorized'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
);

// Error component for failed lazy loads
const LazyLoadError = ({ componentName }) => (
  <div className="flex flex-col items-center justify-center h-64 p-8">
    <div className="text-red-600 text-xl font-semibold mb-2">Failed to load {componentName}</div>
    <p className="text-gray-600 mb-4">Please refresh the page or contact support if the problem persists.</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Refresh Page
    </button>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, hasPermission, user, token } = useAuthStore();
  
  // Also check localStorage for token (in case state hasn't updated yet)
  const storedToken = localStorage.getItem('authToken');

  // If not authenticated or no user, redirect to login
  // Check both state token and localStorage token
  if (!isAuthenticated || !user || (!token && !storedToken)) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      hasStoredToken: !!storedToken,
    });
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Layout wrapper for authenticated routes
const AuthenticatedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

// Public layout for auth pages (redirect if already authenticated, except for admin on register page)
const PublicLayout = () => {
  const { isAuthenticated, user, token, hasPermission } = useAuthStore();
  const storedToken = localStorage.getItem('authToken');
  const location = useLocation();
  
  // Check if user is admin - check multiple ways
  const isAdmin = React.useMemo(() => {
    if (!user) {
      console.log('PublicLayout: No user object');
      return false;
    }
    
    console.log('PublicLayout: Checking admin status for user:', {
      userKeys: Object.keys(user),
      userProfile: user.profile,
      userRole: user.role,
      userPermissions: user.permissions,
    });
    
    try {
      // Check permissions - try multiple permission names
      if (hasPermission) {
        const hasManageUsers = hasPermission('manage_users');
        const hasManageSettings = hasPermission('manage_settings');
        const hasAdminPermission = hasPermission('admin') || hasPermission('administrator');
        
        console.log('PublicLayout: Permission checks:', {
          hasManageUsers,
          hasManageSettings,
          hasAdminPermission,
        });
        
        if (hasManageUsers || hasManageSettings || hasAdminPermission) {
          console.log('PublicLayout: User is admin (has permission)');
          return true;
        }
      }
    } catch (e) {
      console.warn('PublicLayout: Error checking permissions:', e);
    }
    
    // Check profile name (various possible field names)
    const profileName = user.profile?.name || user.profileId?.name || user.profile_name || user.profileName || user.profile?.profileName;
    if (profileName && (profileName.toLowerCase() === 'administrator' || profileName.toLowerCase().includes('admin'))) {
      console.log('PublicLayout: User is admin (Administrator profile):', profileName);
      return true;
    }
    
    // Check role name (various possible field names)
    const roleName = user.role?.name || user.roleId?.name || user.role_name || user.roleName || user.role?.roleName || user.role;
    if (roleName && (roleName.toLowerCase() === 'administrator' || roleName.toLowerCase().includes('admin'))) {
      console.log('PublicLayout: User is admin (Administrator role):', roleName);
      return true;
    }
    
    // Check if user has profileId or roleId that might indicate admin
    const profileId = user.profileId || user.profile?.id || user.profile_id;
    const roleId = user.roleId || user.role?.id || user.role_id;
    
    console.log('PublicLayout: User is NOT admin', { 
      user, 
      profileName, 
      roleName,
      profileId,
      roleId,
      allUserKeys: Object.keys(user),
    });
    return false;
  }, [user, hasPermission]);
  
  // Only redirect if truly authenticated (has user and token in state or localStorage)
  // BUT allow admins to access /auth/register for user creation
  if (isAuthenticated && user && (token || storedToken)) {
    // Don't redirect if admin is accessing register page
    if (location.pathname === '/auth/register' && isAdmin) {
      console.log('Admin accessing register page - allowing access');
      return (
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      );
    }
    // For non-admin authenticated users, redirect away from auth pages
    if (location.pathname.startsWith('/auth/')) {
      console.log('Authenticated user accessing auth page - redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

// Route configuration
const router = createBrowserRouter([
  // Protected routes - require authentication
  {
    path: '/',
    element: <AuthenticatedLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        ),
      },
      {
        path: 'optimized-dashboard',
        element: <OptimizedDashboard />,
      },
      
      // CRM Core Routes
      {
        path: 'leads',
        children: [
          {
            index: true,
            element: <Leads />,
          },
          {
            path: ':id',
            element: <LeadDetails />,
          },
        ],
      },
      {
        path: 'contacts',
        children: [
          {
            index: true,
            element: <Contacts />,
          },
          {
            path: ':id',
            element: <ContactDetails />,
          },
        ],
      },
      {
        path: 'accounts',
        children: [
          {
            index: true,
            element: <Accounts />,
          },
          {
            path: ':id',
            element: <AccountDetails />,
          },
        ],
      },
      {
        path: 'deals',
        element: <Deals />,
        // DealDetails page doesn't exist yet - using Deals page for detail view
        // {
        //   path: ':id',
        //   element: <DealDetails />,
        // },
      },
      
      // Activity Management
      {
        path: 'activities',
        element: <Activities />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      
      {
        path: 'quotes',
        element: <Quotes />,
      },
      {
        path: 'sales-orders',
        element: <PurchaseOrders />,
      },
      
      // Marketing
      {
        path: 'campaigns',
        element: <Campaigns />,
      },
      {
        path: 'email-templates',
        element: <EmailTemplates />,
      },
      
      // Analytics & Reporting
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'forecasting',
        element: <Forecasting />,
      },
      
      // AI & Intelligence
      {
        path: 'ai-dashboard',
        element: <AIDashboard />,
      },
      {
        path: 'aidashboard',
        element: <Navigate to="/ai-dashboard" replace />,
      },
      {
        path: 'ai-performance',
        element: <AIPerformanceDashboard />,
      },
      {
        path: 'enhanced-ai-dashboard',
        element: <EnhancedAIDashboard />,
      },
      {
        path: 'ai-system-monitor',
        element: <AISystemMonitor />,
      },
      {
        path: 'ai-lead-qualification',
        element: (
          <ErrorBoundary>
            <AILeadQualification />
          </ErrorBoundary>
        ),
      },
      {
        path: 'aileadqualification',
        element: <Navigate to="/ai-lead-qualification" replace />,
      },
      {
        path: 'AILeadQualification',
        element: <Navigate to="/ai-lead-qualification" replace />,
      },
      {
        path: 'intelligent-deal-insights',
        element: (
          <ErrorBoundary>
            <IntelligentDealInsights />
          </ErrorBoundary>
        ),
      },
      {
        path: 'IntelligentDealInsights',
        element: <Navigate to="/intelligent-deal-insights" replace />,
      },
      {
        path: 'conversational-ai',
        element: (
          <ErrorBoundary>
            <ConversationalAI />
          </ErrorBoundary>
        ),
      },
      {
        path: 'ConversationalAI',
        element: <Navigate to="/conversational-ai" replace />,
      },
      {
        path: 'real-time-bi',
        element: (
          <ErrorBoundary>
            <RealTimeBI />
          </ErrorBoundary>
        ),
      },
      {
        path: 'RealTimeBI',
        element: <Navigate to="/real-time-bi" replace />,
      },
      {
        path: 'workflow-automation',
        element: (
          <ErrorBoundary>
            <WorkflowAutomation />
          </ErrorBoundary>
        ),
      },
      {
        path: 'WorkflowAutomation',
        element: <Navigate to="/workflow-automation" replace />,
      },
      {
        path: 'predictive-analytics',
        element: (
          <ErrorBoundary>
            <PredictiveAnalytics />
          </ErrorBoundary>
        ),
      },
      {
        path: 'PredictiveAnalytics',
        element: <Navigate to="/predictive-analytics" replace />,
      },
      
      // Document Management
      {
        path: 'documents',
        element: <Documents />,
      },
      
      // Workflow & Approvals
      {
        path: 'approvals',
        element: <ProtectedRoute requiredPermission="manage_approvals">
          <Approvals />
        </ProtectedRoute>,
      },
      
      // User Management
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'security',
        element: <Security />,
      },
      {
        path: 'user-experience',
        element: <UserExperience />,
      },
    ],
  },
  
  // Authentication Routes (Public)
  {
    path: '/auth',
    element: <PublicLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'integrations/oauth/:provider/callback',
        element: <OAuthCallback />,
      },
    ],
  },
  
  // Error Routes
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// Navigation configuration for sidebar
export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'BarChart3',
    description: 'Overview and key metrics',
  },
  {
    id: 'optimizedDashboard',
    label: 'Optimized Dashboard',
    path: '/optimized-dashboard',
    icon: 'Gauge',
    description: 'Optimized metrics with caching and performance monitoring',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'Users',
    children: [
      {
        id: 'leads',
        label: 'Leads',
        path: '/leads',
        icon: 'UserPlus',
        badge: 'dynamic', // Will show count
      },
      {
        id: 'contacts',
        label: 'Contacts',
        path: '/contacts',
        icon: 'User',
      },
      {
        id: 'accounts',
        label: 'Accounts',
        path: '/accounts',
        icon: 'Building',
      },
      {
        id: 'deals',
        label: 'Deals',
        path: '/deals',
        icon: 'Target',
        badge: 'dynamic',
      },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: 'Calendar',
    children: [
      {
        id: 'activities',
        label: 'All Activities',
        path: '/activities',
        icon: 'Activity',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: 'CheckSquare',
        badge: 'dynamic',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    children: [
      {
        id: 'campaigns',
        label: 'Campaigns',
        path: '/campaigns',
        icon: 'Megaphone',
      },
      {
        id: 'email-templates',
        label: 'Email Templates',
        path: '/email-templates',
        icon: 'Mail',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'TrendingUp',
    children: [
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        icon: 'BarChart',
      },
      {
        id: 'forecasting',
        label: 'Forecasting',
        path: '/forecasting',
        icon: 'TrendingUp',
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Intelligence',
    icon: 'Brain',
    children: [
      {
        id: 'ai-dashboard',
        label: 'AI Dashboard',
        path: '/ai-dashboard',
        icon: 'Zap',
      },
      {
        id: 'ai-performance',
        label: 'Performance Monitor',
        path: '/ai-performance',
        icon: 'Activity',
      },
      {
        id: 'enhanced-ai-dashboard',
        label: 'Enhanced AI Dashboard',
        path: '/enhanced-ai-dashboard',
        icon: 'Brain',
      },
      {
        id: 'ai-system-monitor',
        label: 'System Monitor',
        path: '/ai-system-monitor',
        icon: 'Monitor',
      },
      {
        id: 'ai-lead-qualification',
        label: 'AI Lead Qualification',
        path: '/ai-lead-qualification',
        icon: 'Target',
      },
      {
        id: 'intelligent-deal-insights',
        label: 'Deal Insights',
        path: '/intelligent-deal-insights',
        icon: 'TrendingUp',
      },
      {
        id: 'conversational-ai',
        label: 'AI Assistant',
        path: '/conversational-ai',
        icon: 'MessageSquare',
      },
      {
        id: 'real-time-bi',
        label: 'Real-Time BI',
        path: '/real-time-bi',
        icon: 'BarChart3',
      },
      {
        id: 'workflow-automation',
        label: 'Workflow Builder',
        path: '/workflow-automation',
        icon: 'Bot',
      },
      {
        id: 'predictive-analytics',
        label: 'Predictive Analytics',
        path: '/predictive-analytics',
        icon: 'Brain',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/documents',
    icon: 'FolderOpen',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    icon: 'GitBranch',
    requiredPermission: 'manage_workflows',
    children: [
      {
        id: 'approvals',
        label: 'Approvals',
        path: '/approvals',
        icon: 'CheckCircle',
        requiredPermission: 'manage_approvals',
      },
    ],
  },
];

// Breadcrumb configuration
export const getBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: currentPath,
      isLast: index === segments.length - 1,
    });
  });
  
  return breadcrumbs;
};

// Router Provider Component
export const AppRouter = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default AppRouter;
