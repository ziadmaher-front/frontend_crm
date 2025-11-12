import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Code, 
  Search, 
  Server, 
  Database, 
  Shield, 
  Zap, 
  GitBranch, 
  Package, 
  Settings, 
  Monitor, 
  Cloud, 
  Lock,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Layers,
  Network,
  Cpu,
  HardDrive,
  Globe,
  Key,
  Users,
  Activity,
  BarChart3,
  Workflow,
  Smartphone,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const SystemDocumentation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('architecture');

  const documentationSections = [
    {
      id: 'architecture',
      title: 'System Architecture',
      icon: Layers,
      description: 'High-level system design and components',
      content: {
        overview: `
          The Sales Pro CRM is built using a modern, scalable architecture:
          
          • Frontend: React 18 with TypeScript
          • State Management: Zustand with persistence
          • UI Framework: Tailwind CSS + shadcn/ui
          • Animation: Framer Motion
          • Build Tool: Vite
          • Backend: Node.js with Express
          • Database: PostgreSQL with Prisma ORM
          • Authentication: JWT with refresh tokens
          • Real-time: WebSocket connections
          • Caching: Redis for session and data caching
          • File Storage: AWS S3 compatible storage
          • Search: Elasticsearch for full-text search
        `,
        components: [
          {
            name: 'Frontend Layer',
            description: 'React-based SPA with modern tooling',
            technologies: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion']
          },
          {
            name: 'API Layer',
            description: 'RESTful API with GraphQL support',
            technologies: ['Node.js', 'Express', 'GraphQL', 'Apollo Server', 'JWT']
          },
          {
            name: 'Data Layer',
            description: 'Persistent storage and caching',
            technologies: ['PostgreSQL', 'Prisma', 'Redis', 'Elasticsearch']
          },
          {
            name: 'Infrastructure',
            description: 'Cloud services and deployment',
            technologies: ['Docker', 'Kubernetes', 'AWS/Azure', 'CDN', 'Load Balancer']
          }
        ]
      }
    },
    {
      id: 'database',
      title: 'Database Schema',
      icon: Database,
      description: 'Data models and relationships',
      content: {
        overview: `
          The database schema is designed for scalability and performance:
          
          Core Entities:
          • Users: System users with roles and permissions
          • Contacts: Individual people and their information
          • Companies: Organizations and business entities
          • Deals: Sales opportunities and pipeline management
          • Activities: Tasks, calls, meetings, and interactions
          • Products: Items and services being sold
          • Campaigns: Marketing campaigns and lead generation
          
          Supporting Tables:
          • Audit logs for compliance and tracking
          • File attachments and document storage
          • Custom fields for extensibility
          • Integration configurations
          • System settings and preferences
        `,
        relationships: [
          'Users → Contacts (many-to-many through assignments)',
          'Contacts → Companies (many-to-one)',
          'Deals → Contacts (many-to-many)',
          'Deals → Companies (many-to-one)',
          'Activities → Contacts/Companies/Deals (polymorphic)',
          'Products → Deals (many-to-many through line items)',
          'Campaigns → Contacts (many-to-many)'
        ]
      }
    },
    {
      id: 'api',
      title: 'API Documentation',
      icon: Network,
      description: 'REST and GraphQL API specifications',
      content: {
        overview: `
          The system provides both REST and GraphQL APIs:
          
          REST API Features:
          • RESTful resource endpoints
          • JSON request/response format
          • HTTP status codes for error handling
          • Pagination with cursor-based navigation
          • Filtering, sorting, and search capabilities
          • Rate limiting and throttling
          • API versioning (v1, v2)
          
          GraphQL API Features:
          • Single endpoint for all operations
          • Type-safe schema definition
          • Real-time subscriptions
          • Efficient data fetching
          • Introspection and playground
          • Custom scalars and directives
        `,
        endpoints: [
          { method: 'GET', path: '/api/v1/contacts', description: 'List contacts with filtering' },
          { method: 'POST', path: '/api/v1/contacts', description: 'Create new contact' },
          { method: 'GET', path: '/api/v1/contacts/:id', description: 'Get contact details' },
          { method: 'PUT', path: '/api/v1/contacts/:id', description: 'Update contact' },
          { method: 'DELETE', path: '/api/v1/contacts/:id', description: 'Delete contact' },
          { method: 'GET', path: '/api/v1/companies', description: 'List companies' },
          { method: 'POST', path: '/api/v1/companies', description: 'Create company' },
          { method: 'GET', path: '/api/v1/deals', description: 'List deals with pipeline info' },
          { method: 'POST', path: '/api/v1/deals', description: 'Create new deal' },
          { method: 'GET', path: '/api/v1/activities', description: 'List activities' },
          { method: 'POST', path: '/api/v1/activities', description: 'Create activity' }
        ]
      }
    },
    {
      id: 'security',
      title: 'Security Implementation',
      icon: Shield,
      description: 'Authentication, authorization, and data protection',
      content: {
        overview: `
          Comprehensive security measures implemented:
          
          Authentication:
          • JWT tokens with refresh token rotation
          • Multi-factor authentication (MFA)
          • Single Sign-On (SSO) integration
          • Password policies and complexity requirements
          • Account lockout and rate limiting
          
          Authorization:
          • Role-based access control (RBAC)
          • Permission-based resource access
          • Field-level security
          • Data isolation by organization
          
          Data Protection:
          • Encryption at rest (AES-256)
          • Encryption in transit (TLS 1.3)
          • Field-level encryption for sensitive data
          • Data masking and anonymization
          • GDPR compliance tools
          
          Security Monitoring:
          • Audit logging for all actions
          • Intrusion detection system
          • Vulnerability scanning
          • Security incident response
        `,
        compliance: [
          'GDPR - General Data Protection Regulation',
          'SOX - Sarbanes-Oxley Act',
          'HIPAA - Health Insurance Portability and Accountability Act',
          'ISO 27001 - Information Security Management',
          'SOC 2 Type II - Service Organization Control'
        ]
      }
    },
    {
      id: 'deployment',
      title: 'Deployment & Infrastructure',
      icon: Cloud,
      description: 'Hosting, scaling, and DevOps practices',
      content: {
        overview: `
          Modern cloud-native deployment strategy:
          
          Containerization:
          • Docker containers for all services
          • Multi-stage builds for optimization
          • Container registry for image management
          • Health checks and monitoring
          
          Orchestration:
          • Kubernetes for container orchestration
          • Horizontal pod autoscaling
          • Rolling deployments with zero downtime
          • Service mesh for inter-service communication
          
          Infrastructure as Code:
          • Terraform for infrastructure provisioning
          • Helm charts for Kubernetes deployments
          • GitOps workflow with ArgoCD
          • Environment-specific configurations
          
          Monitoring & Observability:
          • Prometheus for metrics collection
          • Grafana for visualization
          • ELK stack for log aggregation
          • Distributed tracing with Jaeger
          • Uptime monitoring and alerting
        `,
        environments: [
          { name: 'Development', description: 'Local development environment' },
          { name: 'Staging', description: 'Pre-production testing environment' },
          { name: 'Production', description: 'Live production environment' },
          { name: 'DR', description: 'Disaster recovery environment' }
        ]
      }
    },
    {
      id: 'performance',
      title: 'Performance Optimization',
      icon: Zap,
      description: 'Speed, scalability, and resource optimization',
      content: {
        overview: `
          Performance optimization strategies:
          
          Frontend Optimization:
          • Code splitting and lazy loading
          • Bundle size optimization
          • Image optimization and WebP format
          • Service worker for caching
          • Virtual scrolling for large lists
          • Memoization and React optimization
          
          Backend Optimization:
          • Database query optimization
          • Connection pooling
          • Caching strategies (Redis)
          • API response compression
          • Background job processing
          • Rate limiting and throttling
          
          Infrastructure Optimization:
          • CDN for static asset delivery
          • Load balancing across regions
          • Auto-scaling based on demand
          • Database read replicas
          • Caching layers at multiple levels
        `,
        metrics: [
          { metric: 'Page Load Time', target: '< 2 seconds', current: '1.8s' },
          { metric: 'API Response Time', target: '< 200ms', current: '150ms' },
          { metric: 'Database Query Time', target: '< 50ms', current: '35ms' },
          { metric: 'Uptime', target: '99.9%', current: '99.95%' },
          { metric: 'Error Rate', target: '< 0.1%', current: '0.05%' }
        ]
      }
    },
    {
      id: 'integrations',
      title: 'Third-party Integrations',
      icon: Package,
      description: 'External service connections and APIs',
      content: {
        overview: `
          Extensive integration capabilities:
          
          Email Integrations:
          • Gmail API for email sync
          • Outlook/Exchange integration
          • SMTP for transactional emails
          • Email tracking and analytics
          
          Calendar Integrations:
          • Google Calendar sync
          • Outlook Calendar integration
          • CalDAV protocol support
          • Meeting scheduling automation
          
          Communication Tools:
          • Slack notifications and bot
          • Microsoft Teams integration
          • Zoom meeting creation
          • WhatsApp Business API
          
          Marketing Platforms:
          • Mailchimp for email campaigns
          • HubSpot data synchronization
          • Facebook/LinkedIn lead ads
          • Google Analytics tracking
          
          Business Tools:
          • QuickBooks accounting sync
          • Xero financial integration
          • DocuSign for contracts
          • Zapier for workflow automation
        `,
        webhooks: [
          'Contact created/updated/deleted',
          'Deal stage changed',
          'Activity completed',
          'Campaign launched',
          'Payment received',
          'Document signed'
        ]
      }
    },
    {
      id: 'mobile',
      title: 'Mobile & PWA',
      icon: Smartphone,
      description: 'Mobile app and progressive web app features',
      content: {
        overview: `
          Mobile-first approach with PWA capabilities:
          
          Progressive Web App:
          • Service worker for offline functionality
          • App manifest for native-like experience
          • Push notifications
          • Background sync
          • Install prompts
          
          Mobile Optimization:
          • Responsive design for all screen sizes
          • Touch-friendly interface
          • Gesture support
          • Mobile-specific navigation
          • Optimized performance for mobile devices
          
          Offline Capabilities:
          • Local data storage with IndexedDB
          • Offline-first architecture
          • Sync when connection restored
          • Conflict resolution
          • Cached API responses
          
          Native Features:
          • Camera access for photo capture
          • GPS location services
          • Contact list integration
          • Calendar synchronization
          • Biometric authentication
        `,
        features: [
          'Offline contact viewing and editing',
          'Background data synchronization',
          'Push notifications for important updates',
          'Camera integration for document capture',
          'GPS check-ins for field sales',
          'Voice notes and recordings'
        ]
      }
    }
  ];

  const technicalSpecs = {
    frontend: [
      { name: 'React', version: '18.2.0', purpose: 'UI Framework' },
      { name: 'TypeScript', version: '5.0.0', purpose: 'Type Safety' },
      { name: 'Vite', version: '4.4.0', purpose: 'Build Tool' },
      { name: 'Tailwind CSS', version: '3.3.0', purpose: 'Styling' },
      { name: 'Framer Motion', version: '10.16.0', purpose: 'Animations' },
      { name: 'Zustand', version: '4.4.0', purpose: 'State Management' },
      { name: 'React Query', version: '4.32.0', purpose: 'Data Fetching' },
      { name: 'React Hook Form', version: '7.45.0', purpose: 'Form Handling' }
    ],
    backend: [
      { name: 'Node.js', version: '18.17.0', purpose: 'Runtime' },
      { name: 'Express', version: '4.18.0', purpose: 'Web Framework' },
      { name: 'GraphQL', version: '16.8.0', purpose: 'Query Language' },
      { name: 'Apollo Server', version: '4.9.0', purpose: 'GraphQL Server' },
      { name: 'Prisma', version: '5.2.0', purpose: 'Database ORM' },
      { name: 'JWT', version: '9.0.0', purpose: 'Authentication' },
      { name: 'bcrypt', version: '5.1.0', purpose: 'Password Hashing' },
      { name: 'Winston', version: '3.10.0', purpose: 'Logging' }
    ],
    database: [
      { name: 'PostgreSQL', version: '15.0', purpose: 'Primary Database' },
      { name: 'Redis', version: '7.0', purpose: 'Caching & Sessions' },
      { name: 'Elasticsearch', version: '8.9', purpose: 'Search Engine' },
      { name: 'MinIO', version: '2023.8.0', purpose: 'Object Storage' }
    ],
    infrastructure: [
      { name: 'Docker', version: '24.0', purpose: 'Containerization' },
      { name: 'Kubernetes', version: '1.28', purpose: 'Orchestration' },
      { name: 'Nginx', version: '1.25', purpose: 'Reverse Proxy' },
      { name: 'Prometheus', version: '2.46', purpose: 'Monitoring' },
      { name: 'Grafana', version: '10.1', purpose: 'Visualization' },
      { name: 'Terraform', version: '1.5', purpose: 'Infrastructure as Code' }
    ]
  };

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">System Documentation</h1>
          <p className="text-muted-foreground">Technical documentation for developers and administrators</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Documentation
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            API Playground
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search technical documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="technical">Technical Specs</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setActiveSection(section.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {section.title}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Content */}
            <div className="lg:col-span-3">
              {filteredSections.map((section) => {
                if (section.id !== activeSection) return null;
                
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Icon className="h-6 w-6 text-blue-600" />
                          <div>
                            <CardTitle className="text-2xl">{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {section.content.overview.split('\n').map((paragraph, index) => {
                            if (paragraph.trim() === '') return <br key={index} />;
                            
                            if (paragraph.trim().startsWith('•')) {
                              return (
                                <div key={index} className="flex items-start space-x-2 my-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{paragraph.trim().substring(1).trim()}</span>
                                </div>
                              );
                            }
                            
                            return <p key={index} className="my-3">{paragraph.trim()}</p>;
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional content based on section */}
                    {section.content.components && (
                      <Card>
                        <CardHeader>
                          <CardTitle>System Components</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.content.components.map((component, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">{component.name}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {component.technologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {section.content.endpoints && (
                      <Card>
                        <CardHeader>
                          <CardTitle>API Endpoints</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {section.content.endpoints.map((endpoint, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Badge 
                                    variant={
                                      endpoint.method === 'GET' ? 'default' :
                                      endpoint.method === 'POST' ? 'secondary' :
                                      endpoint.method === 'PUT' ? 'outline' : 'destructive'
                                    }
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm">{endpoint.path}</code>
                                </div>
                                <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {section.content.metrics && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {section.content.metrics.map((metric, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{metric.metric}</div>
                                  <div className="text-sm text-muted-foreground">Target: {metric.target}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600">{metric.current}</div>
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(technicalSpecs).map(([category, specs]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Stack</CardTitle>
                  <CardDescription>Technologies and versions used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{spec.name}</div>
                          <div className="text-sm text-muted-foreground">{spec.purpose}</div>
                        </div>
                        <Badge variant="outline">{spec.version}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Pipeline</CardTitle>
                <CardDescription>CI/CD workflow and stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Source', description: 'Code commit triggers pipeline', status: 'active' },
                    { stage: 'Build', description: 'Compile and bundle application', status: 'active' },
                    { stage: 'Test', description: 'Run unit and integration tests', status: 'active' },
                    { stage: 'Security Scan', description: 'Vulnerability and compliance checks', status: 'active' },
                    { stage: 'Deploy Staging', description: 'Deploy to staging environment', status: 'active' },
                    { stage: 'E2E Tests', description: 'End-to-end testing in staging', status: 'active' },
                    { stage: 'Deploy Production', description: 'Blue-green deployment to production', status: 'pending' }
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        step.status === 'active' ? 'bg-green-500' : 
                        step.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{step.stage}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
                <CardDescription>Deployment environments and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { env: 'Development', url: 'http://localhost:3000', status: 'running' },
                    { env: 'Staging', url: 'https://staging.crm.example.com', status: 'running' },
                    { env: 'Production', url: 'https://crm.example.com', status: 'running' },
                    { env: 'DR', url: 'https://dr.crm.example.com', status: 'standby' }
                  ].map((env, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{env.env}</div>
                        <div className="text-sm text-muted-foreground">{env.url}</div>
                      </div>
                      <Badge variant={env.status === 'running' ? 'default' : 'secondary'}>
                        {env.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Uptime', value: '99.95%', status: 'good' },
                    { metric: 'Response Time', value: '150ms', status: 'good' },
                    { metric: 'Error Rate', value: '0.05%', status: 'good' },
                    { metric: 'CPU Usage', value: '45%', status: 'good' },
                    { metric: 'Memory Usage', value: '62%', status: 'warning' },
                    { metric: 'Disk Usage', value: '78%', status: 'warning' }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{metric.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{metric.value}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts & Incidents</CardTitle>
                <CardDescription>Recent system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'warning', message: 'High memory usage detected', time: '2 hours ago' },
                    { type: 'info', message: 'Scheduled maintenance completed', time: '1 day ago' },
                    { type: 'error', message: 'Database connection timeout', time: '2 days ago', resolved: true }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {alert.type === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">{alert.time}</div>
                      </div>
                      {alert.resolved && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">↗ 15%</div>
                    <div className="text-sm text-muted-foreground">Performance improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2.1M</div>
                    <div className="text-sm text-muted-foreground">Requests processed today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">99.9%</div>
                    <div className="text-sm text-muted-foreground">SLA compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDocumentation;