import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CubeIcon,
  ServerIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  GlobeAltIcon,
  CloudIcon,
  CpuChipIcon,
  DatabaseIcon,
  BoltIcon,
  PuzzlePieceIcon,
  BookOpenIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  EyeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

// API Documentation Engine
class APIDocumentationEngine {
  constructor() {
    this.endpoints = new Map();
    this.components = new Map();
    this.schemas = new Map();
    this.examples = new Map();
    
    this.initializeDocumentation();
  }

  // Initialize all documentation
  initializeDocumentation() {
    this.initializeEndpoints();
    this.initializeComponents();
    this.initializeSchemas();
    this.initializeExamples();
  }

  // Initialize API endpoints
  initializeEndpoints() {
    // Authentication Endpoints
    this.addEndpoint('auth', 'Authentication', [
      {
        id: 'login',
        method: 'POST',
        path: '/api/auth/login',
        summary: 'User login',
        description: 'Authenticate user with email and password',
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' }
        ],
        responses: {
          200: { description: 'Login successful', schema: 'AuthResponse' },
          401: { description: 'Invalid credentials', schema: 'ErrorResponse' },
          422: { description: 'Validation error', schema: 'ValidationErrorResponse' }
        },
        example: 'login'
      },
      {
        id: 'logout',
        method: 'POST',
        path: '/api/auth/logout',
        summary: 'User logout',
        description: 'Invalidate user session and token',
        parameters: [],
        responses: {
          200: { description: 'Logout successful', schema: 'SuccessResponse' },
          401: { description: 'Unauthorized', schema: 'ErrorResponse' }
        },
        example: 'logout'
      },
      {
        id: 'refresh',
        method: 'POST',
        path: '/api/auth/refresh',
        summary: 'Refresh token',
        description: 'Get new access token using refresh token',
        parameters: [
          { name: 'refresh_token', type: 'string', required: true, description: 'Valid refresh token' }
        ],
        responses: {
          200: { description: 'Token refreshed', schema: 'AuthResponse' },
          401: { description: 'Invalid refresh token', schema: 'ErrorResponse' }
        },
        example: 'refresh'
      }
    ]);

    // Customer Endpoints
    this.addEndpoint('customers', 'Customers', [
      {
        id: 'list-customers',
        method: 'GET',
        path: '/api/customers',
        summary: 'List customers',
        description: 'Get paginated list of customers with optional filtering',
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page (default: 20)' },
          { name: 'search', type: 'string', required: false, description: 'Search term' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'sort', type: 'string', required: false, description: 'Sort field' },
          { name: 'order', type: 'string', required: false, description: 'Sort order (asc/desc)' }
        ],
        responses: {
          200: { description: 'Customers retrieved', schema: 'CustomerListResponse' },
          401: { description: 'Unauthorized', schema: 'ErrorResponse' },
          403: { description: 'Forbidden', schema: 'ErrorResponse' }
        },
        example: 'list-customers'
      },
      {
        id: 'create-customer',
        method: 'POST',
        path: '/api/customers',
        summary: 'Create customer',
        description: 'Create a new customer record',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Customer name' },
          { name: 'email', type: 'string', required: true, description: 'Customer email' },
          { name: 'phone', type: 'string', required: false, description: 'Customer phone' },
          { name: 'company', type: 'string', required: false, description: 'Customer company' },
          { name: 'address', type: 'object', required: false, description: 'Customer address' },
          { name: 'tags', type: 'array', required: false, description: 'Customer tags' }
        ],
        responses: {
          201: { description: 'Customer created', schema: 'CustomerResponse' },
          400: { description: 'Bad request', schema: 'ErrorResponse' },
          422: { description: 'Validation error', schema: 'ValidationErrorResponse' }
        },
        example: 'create-customer'
      },
      {
        id: 'get-customer',
        method: 'GET',
        path: '/api/customers/{id}',
        summary: 'Get customer',
        description: 'Get customer details by ID',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Customer ID' }
        ],
        responses: {
          200: { description: 'Customer retrieved', schema: 'CustomerResponse' },
          404: { description: 'Customer not found', schema: 'ErrorResponse' }
        },
        example: 'get-customer'
      },
      {
        id: 'update-customer',
        method: 'PUT',
        path: '/api/customers/{id}',
        summary: 'Update customer',
        description: 'Update customer information',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Customer ID' },
          { name: 'name', type: 'string', required: false, description: 'Customer name' },
          { name: 'email', type: 'string', required: false, description: 'Customer email' },
          { name: 'phone', type: 'string', required: false, description: 'Customer phone' },
          { name: 'company', type: 'string', required: false, description: 'Customer company' },
          { name: 'address', type: 'object', required: false, description: 'Customer address' },
          { name: 'tags', type: 'array', required: false, description: 'Customer tags' }
        ],
        responses: {
          200: { description: 'Customer updated', schema: 'CustomerResponse' },
          404: { description: 'Customer not found', schema: 'ErrorResponse' },
          422: { description: 'Validation error', schema: 'ValidationErrorResponse' }
        },
        example: 'update-customer'
      },
      {
        id: 'delete-customer',
        method: 'DELETE',
        path: '/api/customers/{id}',
        summary: 'Delete customer',
        description: 'Delete customer record',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Customer ID' }
        ],
        responses: {
          200: { description: 'Customer deleted', schema: 'SuccessResponse' },
          404: { description: 'Customer not found', schema: 'ErrorResponse' }
        },
        example: 'delete-customer'
      }
    ]);

    // Deal Endpoints
    this.addEndpoint('deals', 'Deals', [
      {
        id: 'list-deals',
        method: 'GET',
        path: '/api/deals',
        summary: 'List deals',
        description: 'Get paginated list of deals with filtering options',
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page' },
          { name: 'stage', type: 'string', required: false, description: 'Filter by stage' },
          { name: 'owner', type: 'string', required: false, description: 'Filter by owner' },
          { name: 'value_min', type: 'number', required: false, description: 'Minimum deal value' },
          { name: 'value_max', type: 'number', required: false, description: 'Maximum deal value' }
        ],
        responses: {
          200: { description: 'Deals retrieved', schema: 'DealListResponse' }
        },
        example: 'list-deals'
      },
      {
        id: 'create-deal',
        method: 'POST',
        path: '/api/deals',
        summary: 'Create deal',
        description: 'Create a new deal in the pipeline',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'Deal title' },
          { name: 'value', type: 'number', required: true, description: 'Deal value' },
          { name: 'customer_id', type: 'string', required: true, description: 'Customer ID' },
          { name: 'stage', type: 'string', required: true, description: 'Deal stage' },
          { name: 'expected_close_date', type: 'string', required: false, description: 'Expected close date' },
          { name: 'probability', type: 'number', required: false, description: 'Win probability (0-100)' }
        ],
        responses: {
          201: { description: 'Deal created', schema: 'DealResponse' }
        },
        example: 'create-deal'
      }
    ]);

    // Task Endpoints
    this.addEndpoint('tasks', 'Tasks', [
      {
        id: 'list-tasks',
        method: 'GET',
        path: '/api/tasks',
        summary: 'List tasks',
        description: 'Get user tasks with filtering and sorting',
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'priority', type: 'string', required: false, description: 'Filter by priority' },
          { name: 'due_date', type: 'string', required: false, description: 'Filter by due date' }
        ],
        responses: {
          200: { description: 'Tasks retrieved', schema: 'TaskListResponse' }
        },
        example: 'list-tasks'
      }
    ]);

    // Analytics Endpoints
    this.addEndpoint('analytics', 'Analytics', [
      {
        id: 'dashboard-metrics',
        method: 'GET',
        path: '/api/analytics/dashboard',
        summary: 'Dashboard metrics',
        description: 'Get key performance indicators for dashboard',
        parameters: [
          { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d, 1y)' }
        ],
        responses: {
          200: { description: 'Metrics retrieved', schema: 'DashboardMetricsResponse' }
        },
        example: 'dashboard-metrics'
      },
      {
        id: 'sales-report',
        method: 'GET',
        path: '/api/analytics/sales',
        summary: 'Sales analytics',
        description: 'Get detailed sales analytics and reports',
        parameters: [
          { name: 'start_date', type: 'string', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date (YYYY-MM-DD)' },
          { name: 'group_by', type: 'string', required: false, description: 'Group by (day, week, month)' }
        ],
        responses: {
          200: { description: 'Sales data retrieved', schema: 'SalesAnalyticsResponse' }
        },
        example: 'sales-report'
      }
    ]);

    // Integration Endpoints
    this.addEndpoint('integrations', 'Integrations', [
      {
        id: 'list-integrations',
        method: 'GET',
        path: '/api/integrations',
        summary: 'List integrations',
        description: 'Get available and configured integrations',
        parameters: [],
        responses: {
          200: { description: 'Integrations retrieved', schema: 'IntegrationListResponse' }
        },
        example: 'list-integrations'
      },
      {
        id: 'connect-integration',
        method: 'POST',
        path: '/api/integrations/{provider}/connect',
        summary: 'Connect integration',
        description: 'Connect to a third-party service',
        parameters: [
          { name: 'provider', type: 'string', required: true, description: 'Integration provider' },
          { name: 'credentials', type: 'object', required: true, description: 'Authentication credentials' }
        ],
        responses: {
          200: { description: 'Integration connected', schema: 'IntegrationResponse' }
        },
        example: 'connect-integration'
      }
    ]);
  }

  // Initialize component documentation
  initializeComponents() {
    this.addComponent('dashboard', 'Dashboard Components', [
      {
        id: 'Dashboard',
        name: 'Dashboard',
        description: 'Main dashboard component with widgets and analytics',
        props: [
          { name: 'widgets', type: 'array', required: false, description: 'Custom widget configuration' },
          { name: 'layout', type: 'string', required: false, description: 'Dashboard layout (grid, list)' },
          { name: 'refreshInterval', type: 'number', required: false, description: 'Auto-refresh interval in ms' }
        ],
        example: 'dashboard-component'
      },
      {
        id: 'KPICard',
        name: 'KPI Card',
        description: 'Key performance indicator display card',
        props: [
          { name: 'title', type: 'string', required: true, description: 'KPI title' },
          { name: 'value', type: 'number', required: true, description: 'KPI value' },
          { name: 'change', type: 'number', required: false, description: 'Change percentage' },
          { name: 'trend', type: 'string', required: false, description: 'Trend direction (up, down, stable)' },
          { name: 'format', type: 'string', required: false, description: 'Value format (currency, percentage, number)' }
        ],
        example: 'kpi-card-component'
      }
    ]);

    this.addComponent('customers', 'Customer Components', [
      {
        id: 'CustomerList',
        name: 'Customer List',
        description: 'Paginated customer list with search and filters',
        props: [
          { name: 'customers', type: 'array', required: true, description: 'Customer data array' },
          { name: 'onEdit', type: 'function', required: false, description: 'Edit customer callback' },
          { name: 'onDelete', type: 'function', required: false, description: 'Delete customer callback' },
          { name: 'searchable', type: 'boolean', required: false, description: 'Enable search functionality' },
          { name: 'filterable', type: 'boolean', required: false, description: 'Enable filter options' }
        ],
        example: 'customer-list-component'
      },
      {
        id: 'CustomerForm',
        name: 'Customer Form',
        description: 'Form component for creating/editing customers',
        props: [
          { name: 'customer', type: 'object', required: false, description: 'Customer data for editing' },
          { name: 'onSubmit', type: 'function', required: true, description: 'Form submission callback' },
          { name: 'onCancel', type: 'function', required: false, description: 'Form cancellation callback' },
          { name: 'mode', type: 'string', required: false, description: 'Form mode (create, edit)' }
        ],
        example: 'customer-form-component'
      }
    ]);

    this.addComponent('deals', 'Deal Components', [
      {
        id: 'DealPipeline',
        name: 'Deal Pipeline',
        description: 'Kanban-style deal pipeline with drag-and-drop',
        props: [
          { name: 'deals', type: 'array', required: true, description: 'Deal data array' },
          { name: 'stages', type: 'array', required: true, description: 'Pipeline stages' },
          { name: 'onStageChange', type: 'function', required: false, description: 'Stage change callback' },
          { name: 'onDealClick', type: 'function', required: false, description: 'Deal click callback' },
          { name: 'draggable', type: 'boolean', required: false, description: 'Enable drag-and-drop' }
        ],
        example: 'deal-pipeline-component'
      }
    ]);

    this.addComponent('analytics', 'Analytics Components', [
      {
        id: 'Chart',
        name: 'Chart',
        description: 'Configurable chart component with multiple types',
        props: [
          { name: 'data', type: 'array', required: true, description: 'Chart data' },
          { name: 'type', type: 'string', required: true, description: 'Chart type (line, bar, pie, area)' },
          { name: 'xAxis', type: 'string', required: false, description: 'X-axis data key' },
          { name: 'yAxis', type: 'string', required: false, description: 'Y-axis data key' },
          { name: 'colors', type: 'array', required: false, description: 'Custom color palette' },
          { name: 'responsive', type: 'boolean', required: false, description: 'Responsive chart sizing' }
        ],
        example: 'chart-component'
      }
    ]);
  }

  // Initialize data schemas
  initializeSchemas() {
    this.addSchema('AuthResponse', {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Request success status' },
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/schemas/User' },
            access_token: { type: 'string', description: 'JWT access token' },
            refresh_token: { type: 'string', description: 'JWT refresh token' },
            expires_in: { type: 'integer', description: 'Token expiration time in seconds' }
          }
        }
      }
    });

    this.addSchema('User', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
        name: { type: 'string', description: 'User full name' },
        email: { type: 'string', description: 'User email address' },
        role: { type: 'string', description: 'User role' },
        avatar: { type: 'string', description: 'User avatar URL' },
        created_at: { type: 'string', description: 'Account creation timestamp' },
        updated_at: { type: 'string', description: 'Last update timestamp' }
      }
    });

    this.addSchema('Customer', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Customer ID' },
        name: { type: 'string', description: 'Customer name' },
        email: { type: 'string', description: 'Customer email' },
        phone: { type: 'string', description: 'Customer phone number' },
        company: { type: 'string', description: 'Customer company' },
        address: { $ref: '#/schemas/Address' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Customer tags' },
        status: { type: 'string', description: 'Customer status' },
        created_at: { type: 'string', description: 'Creation timestamp' },
        updated_at: { type: 'string', description: 'Last update timestamp' }
      }
    });

    this.addSchema('Deal', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Deal ID' },
        title: { type: 'string', description: 'Deal title' },
        value: { type: 'number', description: 'Deal value' },
        currency: { type: 'string', description: 'Deal currency' },
        stage: { type: 'string', description: 'Deal stage' },
        probability: { type: 'number', description: 'Win probability (0-100)' },
        customer: { $ref: '#/schemas/Customer' },
        owner: { $ref: '#/schemas/User' },
        expected_close_date: { type: 'string', description: 'Expected close date' },
        created_at: { type: 'string', description: 'Creation timestamp' },
        updated_at: { type: 'string', description: 'Last update timestamp' }
      }
    });

    this.addSchema('Task', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        status: { type: 'string', description: 'Task status' },
        priority: { type: 'string', description: 'Task priority' },
        assignee: { $ref: '#/schemas/User' },
        due_date: { type: 'string', description: 'Task due date' },
        created_at: { type: 'string', description: 'Creation timestamp' },
        updated_at: { type: 'string', description: 'Last update timestamp' }
      }
    });

    this.addSchema('Address', {
      type: 'object',
      properties: {
        street: { type: 'string', description: 'Street address' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State/Province' },
        postal_code: { type: 'string', description: 'Postal code' },
        country: { type: 'string', description: 'Country' }
      }
    });

    this.addSchema('ErrorResponse', {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Request success status (false)' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Error code' },
            message: { type: 'string', description: 'Error message' },
            details: { type: 'object', description: 'Additional error details' }
          }
        }
      }
    });

    this.addSchema('ValidationErrorResponse', {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Request success status (false)' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Error code' },
            message: { type: 'string', description: 'Error message' },
            validation_errors: {
              type: 'object',
              description: 'Field-specific validation errors'
            }
          }
        }
      }
    });
  }

  // Initialize code examples
  initializeExamples() {
    // API Examples
    this.addExample('login', {
      title: 'User Login',
      description: 'Authenticate user with email and password',
      request: {
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: 'user@example.com',
          password: 'password123'
        }
      },
      response: {
        status: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 'user_123',
              name: 'John Doe',
              email: 'user@example.com',
              role: 'sales_rep'
            },
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expires_in: 3600
          }
        }
      }
    });

    this.addExample('create-customer', {
      title: 'Create Customer',
      description: 'Create a new customer record',
      request: {
        method: 'POST',
        url: '/api/customers',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        body: {
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '+1-555-0123',
          company: 'Acme Corp',
          address: {
            street: '123 Business Ave',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA'
          },
          tags: ['enterprise', 'high-value']
        }
      },
      response: {
        status: 201,
        body: {
          success: true,
          data: {
            id: 'cust_456',
            name: 'Acme Corporation',
            email: 'contact@acme.com',
            phone: '+1-555-0123',
            company: 'Acme Corp',
            address: {
              street: '123 Business Ave',
              city: 'New York',
              state: 'NY',
              postal_code: '10001',
              country: 'USA'
            },
            tags: ['enterprise', 'high-value'],
            status: 'active',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          }
        }
      }
    });

    // Component Examples
    this.addExample('dashboard-component', {
      title: 'Dashboard Component Usage',
      description: 'How to use the Dashboard component',
      code: `import { Dashboard } from '@/components/dashboard/Dashboard';

const MyDashboard = () => {
  const widgets = [
    { id: 'revenue', type: 'kpi', title: 'Revenue', value: 125000 },
    { id: 'customers', type: 'kpi', title: 'Customers', value: 1250 },
    { id: 'deals', type: 'chart', title: 'Deals Pipeline', data: [...] }
  ];

  return (
    <Dashboard
      widgets={widgets}
      layout="grid"
      refreshInterval={30000}
    />
  );
};`
    });

    this.addExample('customer-list-component', {
      title: 'Customer List Component',
      description: 'Display and manage customer list',
      code: `import { CustomerList } from '@/components/customers/CustomerList';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);

  const handleEdit = (customer) => {
    // Handle customer edit
  };

  const handleDelete = (customerId) => {
    // Handle customer deletion
  };

  return (
    <CustomerList
      customers={customers}
      onEdit={handleEdit}
      onDelete={handleDelete}
      searchable={true}
      filterable={true}
    />
  );
};`
    });
  }

  // Helper methods
  addEndpoint(category, name, endpoints) {
    this.endpoints.set(category, { name, endpoints });
  }

  addComponent(category, name, components) {
    this.components.set(category, { name, components });
  }

  addSchema(name, schema) {
    this.schemas.set(name, schema);
  }

  addExample(id, example) {
    this.examples.set(id, example);
  }

  // Search functionality
  searchDocumentation(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    // Search endpoints
    for (const [category, data] of this.endpoints) {
      for (const endpoint of data.endpoints) {
        if (
          endpoint.summary.toLowerCase().includes(searchTerm) ||
          endpoint.description.toLowerCase().includes(searchTerm) ||
          endpoint.path.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            type: 'endpoint',
            category,
            item: endpoint,
            categoryName: data.name
          });
        }
      }
    }

    // Search components
    for (const [category, data] of this.components) {
      for (const component of data.components) {
        if (
          component.name.toLowerCase().includes(searchTerm) ||
          component.description.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            type: 'component',
            category,
            item: component,
            categoryName: data.name
          });
        }
      }
    }

    // Search schemas
    for (const [name, schema] of this.schemas) {
      if (name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'schema',
          category: 'schemas',
          item: { name, ...schema },
          categoryName: 'Schemas'
        });
      }
    }

    return results;
  }

  // Get all data
  getEndpoints() {
    return Array.from(this.endpoints.entries()).map(([id, data]) => ({ id, ...data }));
  }

  getComponents() {
    return Array.from(this.components.entries()).map(([id, data]) => ({ id, ...data }));
  }

  getSchemas() {
    return Array.from(this.schemas.entries()).map(([name, schema]) => ({ name, ...schema }));
  }

  getExample(id) {
    return this.examples.get(id);
  }
}

// Method Badge Component
const MethodBadge = ({ method }) => {
  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`${getMethodColor(method)} font-mono text-xs`}>
      {method.toUpperCase()}
    </Badge>
  );
};

// Code Block Component
const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        onClick={copyToClipboard}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
      >
        {copied ? (
          <CheckCircleIcon className="h-4 w-4" />
        ) : (
          <ClipboardDocumentIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

// Endpoint Documentation Component
const EndpointDoc = ({ endpoint, example }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MethodBadge method={endpoint.method} />
            <div>
              <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
              <CardDescription>{endpoint.summary}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{endpoint.description}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="mt-4">
            {endpoint.parameters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoint.parameters.map(param => (
                    <TableRow key={param.name}>
                      <TableCell className="font-mono text-sm">{param.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{param.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {param.required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{param.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No parameters required</p>
            )}
          </TabsContent>

          <TabsContent value="responses" className="mt-4">
            <div className="space-y-4">
              {Object.entries(endpoint.responses).map(([status, response]) => (
                <div key={status} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant={status.startsWith('2') ? 'default' : 'destructive'}
                      className="font-mono"
                    >
                      {status}
                    </Badge>
                    <span className="font-medium">{response.description}</span>
                  </div>
                  {response.schema && (
                    <div className="text-sm text-gray-600">
                      Schema: <code className="bg-gray-100 px-1 rounded">{response.schema}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="example" className="mt-4">
            {example ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Request</h4>
                  <CodeBlock 
                    code={JSON.stringify({
                      method: example.request.method,
                      url: example.request.url,
                      headers: example.request.headers,
                      ...(example.request.body && { body: example.request.body })
                    }, null, 2)} 
                    language="json"
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response</h4>
                  <CodeBlock 
                    code={JSON.stringify(example.response.body, null, 2)} 
                    language="json"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No example available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Component Documentation Component
const ComponentDoc = ({ component, example }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CubeIcon className="h-5 w-5" />
          <span>{component.name}</span>
        </CardTitle>
        <CardDescription>{component.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="props" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="props">Props</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
          </TabsList>

          <TabsContent value="props" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prop</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {component.props.map(prop => (
                  <TableRow key={prop.name}>
                    <TableCell className="font-mono text-sm">{prop.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prop.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {prop.required ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="secondary">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{prop.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="example" className="mt-4">
            {example ? (
              <div>
                <h4 className="font-semibold mb-2">{example.title}</h4>
                <p className="text-gray-600 mb-4">{example.description}</p>
                <CodeBlock code={example.code} language="javascript" />
              </div>
            ) : (
              <p className="text-gray-500">No example available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Schema Documentation Component
const SchemaDoc = ({ schema }) => {
  const renderProperty = (name, property, level = 0) => {
    const indent = level * 20;
    
    return (
      <div key={name} style={{ marginLeft: `${indent}px` }} className="border-l border-gray-200 pl-4 mb-2">
        <div className="flex items-center space-x-2">
          <code className="text-sm font-mono bg-gray-100 px-1 rounded">{name}</code>
          <Badge variant="outline" className="text-xs">{property.type}</Badge>
          {property.description && (
            <span className="text-sm text-gray-600">{property.description}</span>
          )}
        </div>
        {property.properties && (
          <div className="mt-2">
            {Object.entries(property.properties).map(([propName, propDef]) =>
              renderProperty(propName, propDef, level + 1)
            )}
          </div>
        )}
        {property.items && (
          <div className="mt-2">
            {renderProperty('items', property.items, level + 1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DatabaseIcon className="h-5 w-5" />
          <span>{schema.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {schema.properties && Object.entries(schema.properties).map(([name, property]) =>
            renderProperty(name, property)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Search Results Component
const SearchResults = ({ results, onResultClick }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onResultClick(result)}
        >
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <Badge variant="outline">{result.type}</Badge>
              <div>
                <div className="font-medium">
                  {result.type === 'endpoint' ? result.item.summary : result.item.name}
                </div>
                <div className="text-sm text-gray-600">
                  {result.categoryName} • {result.item.description || result.item.path}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main API Documentation Component
const APIDocumentation = () => {
  const [engine] = useState(() => new APIDocumentationEngine());
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const endpoints = engine.getEndpoints();
  const components = engine.getComponents();
  const schemas = engine.getSchemas();

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = engine.searchDocumentation(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, engine]);

  const handleSearchResultClick = (result) => {
    // Navigate to the specific documentation section
    if (result.type === 'endpoint') {
      setActiveTab('endpoints');
    } else if (result.type === 'component') {
      setActiveTab('components');
    } else if (result.type === 'schema') {
      setActiveTab('schemas');
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
                <p className="text-gray-600">Comprehensive documentation for developers and integrators</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4">
              <SearchResults 
                results={searchResults} 
                onResultClick={handleSearchResultClick}
              />
            </div>
          )}
        </div>

        {/* Documentation Tabs */}
        {searchResults.length === 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ServerIcon className="h-5 w-5 text-blue-600" />
                      <span>REST API</span>
                    </CardTitle>
                    <CardDescription>
                      Complete REST API with authentication, CRUD operations, and advanced features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Endpoints:</span>
                        <span className="font-medium">{endpoints.reduce((sum, cat) => sum + cat.endpoints.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentication:</span>
                        <span className="font-medium">JWT Bearer</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate Limiting:</span>
                        <span className="font-medium">1000/hour</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CubeIcon className="h-5 w-5 text-green-600" />
                      <span>React Components</span>
                    </CardTitle>
                    <CardDescription>
                      Reusable React components for building CRM interfaces
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Components:</span>
                        <span className="font-medium">{components.reduce((sum, cat) => sum + cat.components.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TypeScript:</span>
                        <span className="font-medium">Full Support</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Styling:</span>
                        <span className="font-medium">Tailwind CSS</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DatabaseIcon className="h-5 w-5 text-purple-600" />
                      <span>Data Schemas</span>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive data models and validation schemas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Schemas:</span>
                        <span className="font-medium">{schemas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validation:</span>
                        <span className="font-medium">JSON Schema</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium">OpenAPI 3.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Start */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RocketLaunchIcon className="h-5 w-5" />
                    <span>Quick Start</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Authentication</h4>
                      <CodeBlock 
                        code={`// Login to get access token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { data } = await response.json();
const accessToken = data.access_token;`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Make API Calls</h4>
                      <CodeBlock 
                        code={`// Use token for authenticated requests
const customers = await fetch('/api/customers', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  }
});`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Use Components</h4>
                      <CodeBlock 
                        code={`import { CustomerList } from '@/components/customers/CustomerList';

function App() {
  return (
    <CustomerList
      customers={customers}
      onEdit={handleEdit}
      searchable={true}
    />
  );
}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Endpoints Tab */}
            <TabsContent value="endpoints" className="space-y-6">
              {endpoints.map(category => (
                <div key={category.id}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <ServerIcon className="h-6 w-6" />
                    <span>{category.name}</span>
                  </h2>
                  {category.endpoints.map(endpoint => (
                    <EndpointDoc 
                      key={endpoint.id}
                      endpoint={endpoint}
                      example={engine.getExample(endpoint.example)}
                    />
                  ))}
                </div>
              ))}
            </TabsContent>

            {/* Components Tab */}
            <TabsContent value="components" className="space-y-6">
              {components.map(category => (
                <div key={category.id}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <CubeIcon className="h-6 w-6" />
                    <span>{category.name}</span>
                  </h2>
                  {category.components.map(component => (
                    <ComponentDoc 
                      key={component.id}
                      component={component}
                      example={engine.getExample(component.example)}
                    />
                  ))}
                </div>
              ))}
            </TabsContent>

            {/* Schemas Tab */}
            <TabsContent value="schemas" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                <DatabaseIcon className="h-6 w-6" />
                <span>Data Schemas</span>
              </h2>
              {schemas.map(schema => (
                <SchemaDoc key={schema.name} schema={schema} />
              ))}
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AcademicCapIcon className="h-5 w-5" />
                      <span>Getting Started</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Setting up authentication</li>
                      <li>• Making your first API call</li>
                      <li>• Understanding response formats</li>
                      <li>• Error handling best practices</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <WrenchScrewdriverIcon className="h-5 w-5" />
                      <span>Integration Guide</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Webhook configuration</li>
                      <li>• Third-party integrations</li>
                      <li>• Data synchronization</li>
                      <li>• Custom field mapping</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BeakerIcon className="h-5 w-5" />
                      <span>Testing Guide</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• API testing strategies</li>
                      <li>• Mock data generation</li>
                      <li>• Component testing</li>
                      <li>• End-to-end testing</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LightBulbIcon className="h-5 w-5" />
                      <span>Best Practices</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Performance optimization</li>
                      <li>• Security considerations</li>
                      <li>• Caching strategies</li>
                      <li>• Rate limiting handling</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
};

export default APIDocumentation;