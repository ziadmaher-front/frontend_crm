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
  Book, 
  Search, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Building, 
  DollarSign, 
  Activity, 
  BarChart3, 
  Settings, 
  Shield, 
  Smartphone, 
  Globe, 
  Zap,
  FileText,
  Video,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Download,
  ExternalLink,
  Lightbulb,
  Target,
  Workflow,
  MessageSquare
} from 'lucide-react';

const UserGuide = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [completedTutorials, setCompletedTutorials] = useState(new Set());

  const guideStructure = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Play,
      description: 'Learn the basics of using the CRM system',
      sections: [
        {
          id: 'overview',
          title: 'System Overview',
          content: `
            Welcome to the Sales Pro CRM! This comprehensive customer relationship management system helps you:
            
            • Manage contacts and companies
            • Track deals through your sales pipeline
            • Schedule and log activities
            • Generate reports and analytics
            • Collaborate with your team
            
            The system is designed to be intuitive and powerful, with advanced features like:
            - Real-time collaboration
            - Mobile and offline support
            - Advanced security and compliance
            - Customizable workflows
            - Integration capabilities
          `
        },
        {
          id: 'navigation',
          title: 'Navigation Basics',
          content: `
            The main navigation is located in the sidebar and includes:
            
            • Dashboard - Overview of your sales metrics
            • Contacts - Manage individual contacts
            • Companies - Manage company accounts
            • Deals - Track your sales pipeline
            • Activities - Tasks, calls, meetings, emails
            • Reports - Analytics and reporting
            • Settings - System configuration
            
            Use the search bar at the top to quickly find contacts, companies, or deals.
            The notification bell shows important updates and reminders.
          `
        },
        {
          id: 'first-steps',
          title: 'First Steps',
          content: `
            To get started with your CRM:
            
            1. Complete your profile setup in Settings
            2. Import your existing contacts (or add them manually)
            3. Set up your sales pipeline stages
            4. Create your first deal
            5. Schedule follow-up activities
            
            Pro tip: Use the quick actions menu (+ button) to rapidly create new records.
          `
        }
      ]
    },
    {
      id: 'contacts',
      title: 'Contact Management',
      icon: Users,
      description: 'Managing contacts and building relationships',
      sections: [
        {
          id: 'adding-contacts',
          title: 'Adding Contacts',
          content: `
            There are several ways to add contacts:
            
            1. Manual Entry:
               • Click "Add Contact" button
               • Fill in contact details
               • Associate with a company
               • Add tags and notes
            
            2. Import from CSV:
               • Go to Contacts → Import
               • Download the template
               • Upload your CSV file
               • Map fields and import
            
            3. Email Integration:
               • Contacts are automatically created from email interactions
               • Sync with your email provider
            
            Best practices:
            • Always include email and phone
            • Add meaningful tags
            • Link to the correct company
            • Add notes about how you met
          `
        },
        {
          id: 'contact-profiles',
          title: 'Contact Profiles',
          content: `
            Each contact profile includes:
            
            • Basic Information: Name, title, email, phone
            • Company Association: Link to company record
            • Communication History: All interactions
            • Activities: Scheduled and completed tasks
            • Deals: Associated opportunities
            • Notes: Important information and context
            • Tags: Categorization and filtering
            
            Use the activity timeline to see all interactions with a contact.
            The relationship score shows engagement level.
          `
        },
        {
          id: 'contact-segmentation',
          title: 'Segmentation & Filtering',
          content: `
            Organize contacts using:
            
            • Tags: Custom labels for categorization
            • Filters: Industry, location, deal stage, etc.
            • Lists: Static or dynamic contact groups
            • Custom Fields: Additional data points
            
            Advanced filtering options:
            - Date ranges (created, modified, last contact)
            - Activity levels (hot, warm, cold)
            - Deal associations
            - Communication preferences
            
            Save frequently used filters as custom views.
          `
        }
      ]
    },
    {
      id: 'companies',
      title: 'Company Management',
      icon: Building,
      description: 'Managing company accounts and relationships',
      sections: [
        {
          id: 'company-setup',
          title: 'Setting Up Companies',
          content: `
            Company records serve as the foundation for B2B relationships:
            
            • Basic Info: Name, industry, size, location
            • Contact Information: Address, phone, website
            • Key Contacts: Decision makers and influencers
            • Deal History: All opportunities with this company
            • Activities: Meetings, calls, emails
            • Notes: Important company information
            
            Link multiple contacts to each company to see the full relationship map.
          `
        },
        {
          id: 'company-hierarchy',
          title: 'Company Hierarchies',
          content: `
            For complex organizations, set up hierarchies:
            
            • Parent Companies: Main corporate entity
            • Subsidiaries: Child companies
            • Divisions: Different business units
            • Locations: Multiple offices or sites
            
            This helps you understand:
            - Decision-making structures
            - Budget ownership
            - Relationship mapping
            - Cross-selling opportunities
          `
        }
      ]
    },
    {
      id: 'deals',
      title: 'Deal Management',
      icon: DollarSign,
      description: 'Managing your sales pipeline and opportunities',
      sections: [
        {
          id: 'creating-deals',
          title: 'Creating Deals',
          content: `
            To create a new deal:
            
            1. Click "Add Deal" or use the quick action menu
            2. Enter deal details:
               • Deal name and description
               • Associated company and contact
               • Deal value and currency
               • Expected close date
               • Probability percentage
            
            3. Assign to pipeline stage
            4. Set owner and team members
            5. Add products/services
            6. Schedule follow-up activities
            
            Always include realistic timelines and accurate value estimates.
          `
        },
        {
          id: 'pipeline-management',
          title: 'Pipeline Management',
          content: `
            Your sales pipeline includes standard stages:
            
            • Lead: Initial interest identified
            • Qualified: Budget, authority, need, timeline confirmed
            • Proposal: Formal proposal submitted
            • Negotiation: Terms being discussed
            • Closed Won: Deal successfully closed
            • Closed Lost: Deal lost to competitor or no decision
            
            Move deals between stages by:
            - Dragging and dropping in pipeline view
            - Using the stage dropdown in deal details
            - Bulk actions for multiple deals
            
            Set stage requirements to ensure data quality.
          `
        },
        {
          id: 'deal-forecasting',
          title: 'Forecasting',
          content: `
            Accurate forecasting requires:
            
            • Realistic probability percentages
            • Regular pipeline reviews
            • Historical win rate analysis
            • Stage-based probability models
            
            Forecasting views:
            - Monthly/Quarterly projections
            - Individual vs. team forecasts
            - Best case/worst case scenarios
            - Historical accuracy tracking
            
            Review and update forecasts weekly with your team.
          `
        }
      ]
    },
    {
      id: 'activities',
      title: 'Activity Management',
      icon: Activity,
      description: 'Tasks, meetings, calls, and follow-ups',
      sections: [
        {
          id: 'activity-types',
          title: 'Activity Types',
          content: `
            The system supports various activity types:
            
            • Tasks: To-do items and reminders
            • Calls: Phone conversations
            • Meetings: In-person or virtual meetings
            • Emails: Email communications
            • Notes: General observations and updates
            
            Each activity can be:
            - Associated with contacts, companies, or deals
            - Scheduled for future dates
            - Assigned to team members
            - Tagged and categorized
            - Tracked for completion
          `
        },
        {
          id: 'scheduling',
          title: 'Scheduling & Reminders',
          content: `
            Effective activity scheduling:
            
            • Set specific dates and times
            • Add location information
            • Include agenda or objectives
            • Set reminder notifications
            • Invite other team members
            
            Calendar integration:
            - Sync with Google Calendar, Outlook
            - Two-way synchronization
            - Meeting room booking
            - Automatic conflict detection
            
            Use recurring activities for regular check-ins.
          `
        }
      ]
    },
    {
      id: 'reporting',
      title: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Data analysis and business intelligence',
      sections: [
        {
          id: 'standard-reports',
          title: 'Standard Reports',
          content: `
            Built-in reports include:
            
            • Sales Performance: Revenue, deals closed, conversion rates
            • Pipeline Analysis: Deal stages, velocity, bottlenecks
            • Activity Reports: Call volume, meeting frequency
            • Contact Reports: Lead sources, engagement levels
            • Team Performance: Individual and team metrics
            
            All reports can be:
            - Filtered by date range, team, or criteria
            - Exported to PDF or Excel
            - Scheduled for automatic delivery
            - Shared with stakeholders
          `
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          content: `
            Create custom reports using:
            
            • Report Builder: Drag-and-drop interface
            • Custom Fields: Include any data points
            • Advanced Filters: Complex criteria
            • Grouping & Sorting: Organize data
            • Visualizations: Charts and graphs
            
            Report types:
            - Tabular data reports
            - Summary reports with totals
            - Trend analysis over time
            - Comparative reports
            - Dashboard widgets
          `
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Settings,
      description: 'Power user features and customization',
      sections: [
        {
          id: 'automation',
          title: 'Workflow Automation',
          content: `
            Automate repetitive tasks with workflows:
            
            • Triggers: Events that start workflows
            • Conditions: Rules that must be met
            • Actions: What happens automatically
            
            Common automations:
            - Lead assignment based on territory
            - Follow-up task creation
            - Email notifications
            - Deal stage progression
            - Data validation and cleanup
            
            Use the workflow builder to create custom automations.
          `
        },
        {
          id: 'integrations',
          title: 'Third-party Integrations',
          content: `
            Connect with external tools:
            
            • Email: Gmail, Outlook, Exchange
            • Calendar: Google Calendar, Outlook Calendar
            • Marketing: Mailchimp, HubSpot
            • Accounting: QuickBooks, Xero
            • Communication: Slack, Microsoft Teams
            
            Integration benefits:
            - Eliminate data silos
            - Reduce manual data entry
            - Improve data accuracy
            - Streamline workflows
            
            Configure integrations in Settings → Integrations.
          `
        },
        {
          id: 'mobile-app',
          title: 'Mobile & Offline Access',
          content: `
            The mobile app provides:
            
            • Full CRM functionality on mobile devices
            • Offline access to critical data
            • Push notifications for important updates
            • GPS-based check-ins
            • Voice notes and recordings
            
            Offline capabilities:
            - View contacts and deals
            - Add notes and activities
            - Update deal stages
            - Sync when connection restored
            
            Install the PWA for native app experience.
          `
        }
      ]
    }
  ];

  const tutorials = [
    {
      id: 'quick-start',
      title: 'Quick Start Tutorial',
      description: 'Get up and running in 10 minutes',
      duration: '10 min',
      difficulty: 'Beginner',
      steps: [
        'Set up your profile',
        'Add your first contact',
        'Create a company',
        'Set up a deal',
        'Schedule an activity'
      ]
    },
    {
      id: 'pipeline-setup',
      title: 'Pipeline Configuration',
      description: 'Customize your sales process',
      duration: '15 min',
      difficulty: 'Intermediate',
      steps: [
        'Define pipeline stages',
        'Set stage requirements',
        'Configure probability settings',
        'Set up automation rules',
        'Test the pipeline flow'
      ]
    },
    {
      id: 'reporting-mastery',
      title: 'Advanced Reporting',
      description: 'Create powerful reports and dashboards',
      duration: '20 min',
      difficulty: 'Advanced',
      steps: [
        'Use the report builder',
        'Create custom fields',
        'Set up filters and grouping',
        'Design visualizations',
        'Schedule report delivery'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I import my existing contacts?',
      answer: 'Go to Contacts → Import, download the CSV template, fill it with your data, and upload it. The system will guide you through field mapping.'
    },
    {
      question: 'Can I customize the deal pipeline stages?',
      answer: 'Yes! Go to Settings → Pipeline to add, remove, or reorder stages. You can also set requirements for each stage.'
    },
    {
      question: 'How do I set up email integration?',
      answer: 'Navigate to Settings → Integrations → Email. Follow the setup wizard for your email provider (Gmail, Outlook, etc.).'
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Yes! The system works as a Progressive Web App (PWA). You can install it on your mobile device for native app experience.'
    },
    {
      question: 'How do I create automated workflows?',
      answer: 'Go to Settings → Automation → Workflows. Use the visual workflow builder to create triggers, conditions, and actions.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Absolutely! You can export contacts, companies, deals, and activities from their respective sections. Reports can also be exported to PDF or Excel.'
    }
  ];

  const filteredSections = guideStructure.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.sections.some(subsection =>
      subsection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subsection.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const markTutorialComplete = (tutorialId) => {
    setCompletedTutorials(prev => new Set([...prev, tutorialId]));
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">User Guide & Documentation</h1>
          <p className="text-muted-foreground">Comprehensive help and tutorials for the CRM system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Video Tutorials
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guide" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guide">User Guide</TabsTrigger>
          <TabsTrigger value="tutorials">Interactive Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="api">API Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.id}>
                          <Button
                            variant={activeSection === section.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveSection(section.id)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {section.title}
                          </Button>
                          {activeSection === section.id && (
                            <div className="ml-6 mt-2 space-y-1">
                              {section.sections.map((subsection) => (
                                <Button
                                  key={subsection.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    document.getElementById(subsection.id)?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  {subsection.title}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
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
                    </Card>

                    {section.sections.map((subsection) => (
                      <Card key={subsection.id} id={subsection.id}>
                        <CardHeader>
                          <CardTitle className="text-xl">{subsection.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose max-w-none">
                            {subsection.content.split('\n').map((paragraph, index) => {
                              if (paragraph.trim() === '') return <br key={index} />;
                              
                              if (paragraph.trim().startsWith('•')) {
                                return (
                                  <div key={index} className="flex items-start space-x-2 my-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{paragraph.trim().substring(1).trim()}</span>
                                  </div>
                                );
                              }
                              
                              if (paragraph.trim().match(/^\d+\./)) {
                                return (
                                  <div key={index} className="flex items-start space-x-2 my-2">
                                    <span className="font-medium text-blue-600 flex-shrink-0">
                                      {paragraph.trim().match(/^\d+\./)[0]}
                                    </span>
                                    <span>{paragraph.trim().replace(/^\d+\./, '').trim()}</span>
                                  </div>
                                );
                              }
                              
                              if (paragraph.trim().startsWith('-')) {
                                return (
                                  <div key={index} className="flex items-start space-x-2 my-1 ml-4">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{paragraph.trim().substring(1).trim()}</span>
                                  </div>
                                );
                              }
                              
                              return <p key={index} className="my-3">{paragraph.trim()}</p>;
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      {completedTutorials.has(tutorial.id) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <CardDescription>{tutorial.description}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{tutorial.duration}</span>
                      </div>
                      <Badge variant="outline">{tutorial.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Tutorial Steps:</h4>
                      <div className="space-y-1">
                        {tutorial.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                              {stepIndex + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => markTutorialComplete(tutorial.id)}
                      disabled={completedTutorials.has(tutorial.id)}
                    >
                      {completedTutorials.has(tutorial.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Tutorial
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tutorial Progress</CardTitle>
              <CardDescription>Track your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Completed Tutorials</span>
                  <span>{completedTutorials.size} of {tutorials.length}</span>
                </div>
                <Progress value={(completedTutorials.size / tutorials.length) * 100} />
                
                {completedTutorials.size === tutorials.length && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Congratulations! You've completed all tutorials. You're now ready to make the most of your CRM system.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions and answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                      <span className="font-medium text-left">{faq.question}</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 border-x border-b rounded-b-lg bg-gray-50">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>Additional support resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Live Chat Support</span>
                  <span className="text-xs text-muted-foreground">Available 24/7</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Video className="h-6 w-6" />
                  <span>Video Tutorials</span>
                  <span className="text-xs text-muted-foreground">Step-by-step guides</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Globe className="h-6 w-6" />
                  <span>Community Forum</span>
                  <span className="text-xs text-muted-foreground">User discussions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Developer resources and API reference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  The CRM system provides a comprehensive REST API and GraphQL endpoint for custom integrations and applications.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">REST API</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Base URL</div>
                      <code className="text-blue-600">https://api.crm.example.com/v1</code>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Authentication</div>
                      <code className="text-blue-600">Bearer Token</code>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Rate Limiting</div>
                      <code className="text-blue-600">1000 requests/hour</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">GraphQL</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Endpoint</div>
                      <code className="text-blue-600">https://api.crm.example.com/graphql</code>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Playground</div>
                      <code className="text-blue-600">https://api.crm.example.com/graphql/playground</code>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Schema</div>
                      <code className="text-blue-600">Introspection enabled</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Endpoints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Contacts</h4>
                    <div className="text-sm space-y-1">
                      <div><code className="text-green-600">GET</code> /contacts</div>
                      <div><code className="text-blue-600">POST</code> /contacts</div>
                      <div><code className="text-yellow-600">PUT</code> /contacts/:id</div>
                      <div><code className="text-red-600">DELETE</code> /contacts/:id</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Companies</h4>
                    <div className="text-sm space-y-1">
                      <div><code className="text-green-600">GET</code> /companies</div>
                      <div><code className="text-blue-600">POST</code> /companies</div>
                      <div><code className="text-yellow-600">PUT</code> /companies/:id</div>
                      <div><code className="text-red-600">DELETE</code> /companies/:id</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Deals</h4>
                    <div className="text-sm space-y-1">
                      <div><code className="text-green-600">GET</code> /deals</div>
                      <div><code className="text-blue-600">POST</code> /deals</div>
                      <div><code className="text-yellow-600">PUT</code> /deals/:id</div>
                      <div><code className="text-red-600">DELETE</code> /deals/:id</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Activities</h4>
                    <div className="text-sm space-y-1">
                      <div><code className="text-green-600">GET</code> /activities</div>
                      <div><code className="text-blue-600">POST</code> /activities</div>
                      <div><code className="text-yellow-600">PUT</code> /activities/:id</div>
                      <div><code className="text-red-600">DELETE</code> /activities/:id</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Full API Documentation
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserGuide;