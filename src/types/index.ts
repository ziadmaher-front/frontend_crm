// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User and Authentication types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'viewer';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Contact types
export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  company?: string;
  accountId?: string;
  leadSource?: LeadSource;
  status: ContactStatus;
  tags: string[];
  notes?: string;
  socialProfiles?: SocialProfile[];
  customFields?: Record<string, any>;
}

export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'customer';

export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  url: string;
}

// Account types
export interface Account extends BaseEntity {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: Address;
  employees?: number;
  revenue?: number;
  type: AccountType;
  status: AccountStatus;
  ownerId: string;
  parentAccountId?: string;
  tags: string[];
  customFields?: Record<string, any>;
}

export type AccountType = 'prospect' | 'customer' | 'partner' | 'competitor';
export type AccountStatus = 'active' | 'inactive' | 'pending';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Lead types
export interface Lead extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: LeadSource;
  status: LeadStatus;
  score?: number;
  ownerId: string;
  convertedContactId?: string;
  convertedAccountId?: string;
  convertedDealId?: string;
  convertedAt?: string;
  tags: string[];
  notes?: string;
  customFields?: Record<string, any>;
}

export type LeadSource = 
  | 'website' 
  | 'referral' 
  | 'social_media' 
  | 'email_campaign' 
  | 'cold_call' 
  | 'trade_show' 
  | 'advertisement' 
  | 'other';

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'unqualified' 
  | 'converted' 
  | 'lost';

// Deal types
export interface Deal extends BaseEntity {
  name: string;
  amount: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  ownerId: string;
  accountId?: string;
  contactId?: string;
  leadId?: string;
  source?: LeadSource;
  type: DealType;
  description?: string;
  competitors?: string[];
  tags: string[];
  customFields?: Record<string, any>;
}

export type DealStage = 
  | 'prospecting' 
  | 'qualification' 
  | 'proposal' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost';

export type DealType = 'new_business' | 'existing_business' | 'renewal' | 'upsell';

// Task types
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  assignedToId: string;
  createdById: string;
  relatedToType?: EntityType;
  relatedToId?: string;
  tags: string[];
  attachments?: Attachment[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EntityType = 'contact' | 'account' | 'lead' | 'deal' | 'task';

// Activity types
export interface Activity extends BaseEntity {
  type: ActivityType;
  subject: string;
  description?: string;
  startDate: string;
  endDate?: string;
  duration?: number; // in minutes
  status: ActivityStatus;
  ownerId: string;
  relatedToType?: EntityType;
  relatedToId?: string;
  attendees?: string[]; // user IDs
  location?: string;
  isAllDay: boolean;
  reminderMinutes?: number;
  tags: string[];
}

export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'task' 
  | 'note' 
  | 'demo' 
  | 'proposal' 
  | 'follow_up';

export type ActivityStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

// File and attachment types
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedById: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query and filter types
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FilterOption[];
  validation?: ValidationRule[];
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime' 
  | 'file' 
  | 'url';

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Dashboard and analytics types
export interface DashboardMetrics {
  totalLeads: number;
  totalContacts: number;
  totalAccounts: number;
  totalDeals: number;
  totalDealsValue: number;
  wonDeals: number;
  wonDealsValue: number;
  conversionRate: number;
  pendingTasks: number;
  overdueActivities: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// UI Component types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  onRowClick?: (record: T) => void;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Theme and UI types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  breakpoints: Record<string, string>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
  createdAt: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// Settings and configuration types
export interface AppSettings {
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// React component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorProps extends BaseComponentProps {
  error?: string | Error | null;
  onRetry?: () => void;
  showRetry?: boolean;
}