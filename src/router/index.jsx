// Modern Routing System with Protected Routes and Enhanced Navigation
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
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
const Products = lazy(() => import('@/pages/Products'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const Campaigns = lazy(() => import('@/pages/Campaigns'));
const EmailTemplates = lazy(() => import('@/pages/EmailTemplates'));
const Reports = lazy(() => import('@/pages/Reports'));
const ProductLines = lazy(() => import('@/pages/ProductLines'));
const PurchaseOrders = lazy(() => import('@/pages/PurchaseOrders'));
const Manufacturers = lazy(() => import('@/pages/Manufacturers'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Approvals = lazy(() => import('@/pages/Approvals'));
const Documents = lazy(() => import('@/pages/Documents'));
const Forecasting = lazy(() => import('@/pages/Forecasting'));

// AI & Intelligence
const AIDashboard = lazy(() => import('@/components/dashboard/AIDashboard'));
const AIPerformanceDashboard = lazy(() => import('@/pages/AIPerformanceDashboard'));
const EnhancedAIDashboard = lazy(() => import('@/pages/EnhancedAIDashboard'));
const AISystemMonitor = lazy(() => import('@/components/AISystemMonitor'));

// Detail pages
const LeadDetails = lazy(() => import('@/pages/LeadDetails'));
const ContactDetails = lazy(() => import('@/pages/ContactDetails'));
const AccountDetails = lazy(() => import('@/pages/AccountDetails'));
// DealDetails doesn't exist yet - using Deals page for now
// const DealDetails = lazy(() => import('@/pages/DealDetails'));

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
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

// Public layout for auth pages (redirect if already authenticated)
const PublicLayout = () => {
  const { isAuthenticated, user, token } = useAuthStore();
  const storedToken = localStorage.getItem('authToken');
  
  // Only redirect if truly authenticated (has user and token in state or localStorage)
  if (isAuthenticated && user && (token || storedToken)) {
    return <Navigate to="/dashboard" replace />;
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
      
      // Product Management
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <Products />,
          },
          {
            path: 'lines',
            element: <ProductLines />,
          },
        ],
      },
      {
        path: 'quotes',
        element: <Quotes />,
      },
      {
        path: 'purchase-orders',
        element: <PurchaseOrders />,
      },
      {
        path: 'manufacturers',
        element: <Manufacturers />,
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
        element: <ProtectedRoute requiredPermission="manage_settings">
          <Settings />
        </ProtectedRoute>,
      },
    ],
  },
  
  // Authentication Routes
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
    id: 'products',
    label: 'Products',
    icon: 'Package',
    children: [
      {
        id: 'products',
        label: 'Products',
        path: '/products',
        icon: 'Package',
      },
      {
        id: 'quotes',
        label: 'Quotes',
        path: '/quotes',
        icon: 'FileText',
      },
      {
        id: 'purchase-orders',
        label: 'Purchase Orders',
        path: '/purchase-orders',
        icon: 'ShoppingCart',
      },
      {
        id: 'manufacturers',
        label: 'Manufacturers',
        path: '/manufacturers',
        icon: 'Factory',
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
