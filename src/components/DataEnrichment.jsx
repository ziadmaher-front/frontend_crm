import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Database,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Play,
  Pause,
  Settings,
  Filter,
  Download,
  Upload,
  Zap,
  Target,
  Eye,
  Edit,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Star,
  Award,
  Briefcase
} from 'lucide-react';

const DataEnrichment = () => {
  const [contacts, setContacts] = useState([]);
  const [enrichmentQueue, setEnrichmentQueue] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [enrichmentStats, setEnrichmentStats] = useState({});

  // Mock contact data with enrichment status
  const mockContacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      company: 'TechCorp Solutions',
      phone: '+1-555-0123',
      enrichment_status: 'enriched',
      enrichment_score: 95,
      last_enriched: '2024-01-15',
      original_data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        company: 'TechCorp'
      },
      enriched_data: {
        full_name: 'Sarah Michelle Johnson',
        title: 'VP of Technology',
        department: 'Engineering',
        seniority: 'VP',
        phone: '+1-555-0123',
        mobile: '+1-555-0124',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        twitter: '@sarahtech',
        company_info: {
          full_name: 'TechCorp Solutions Inc.',
          industry: 'Software Development',
          size: '500-1000 employees',
          revenue: '$50M - $100M',
          founded: '2010',
          headquarters: 'San Francisco, CA',
          website: 'https://techcorp.com',
          description: 'Leading provider of enterprise software solutions',
          technologies: ['React', 'Node.js', 'AWS', 'Docker'],
          funding: 'Series C - $45M',
          competitors: ['CompetitorA', 'CompetitorB']
        },
        social_profiles: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: 'https://twitter.com/sarahtech',
          github: 'https://github.com/sarahj'
        },
        work_history: [
          { company: 'TechCorp Solutions', title: 'VP of Technology', duration: '2020-Present' },
          { company: 'StartupXYZ', title: 'Senior Engineer', duration: '2018-2020' },
          { company: 'BigTech Inc', title: 'Software Engineer', duration: '2015-2018' }
        ],
        education: [
          { school: 'Stanford University', degree: 'MS Computer Science', year: '2015' },
          { school: 'UC Berkeley', degree: 'BS Computer Science', year: '2013' }
        ],
        interests: ['AI/ML', 'Cloud Computing', 'Team Leadership'],
        personality_insights: {
          communication_style: 'Direct and analytical',
          decision_making: 'Data-driven',
          preferred_contact_time: 'Mornings (9-11 AM)',
          response_rate: '85%'
        }
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@globalsolutions.com',
      company: 'Global Solutions',
      phone: null,
      enrichment_status: 'partial',
      enrichment_score: 65,
      last_enriched: '2024-01-14',
      original_data: {
        name: 'Michael Chen',
        email: 'mchen@globalsolutions.com',
        company: 'Global Solutions'
      },
      enriched_data: {
        full_name: 'Michael Chen',
        title: 'Director of Operations',
        department: 'Operations',
        seniority: 'Director',
        phone: '+1-555-0456',
        linkedin: 'https://linkedin.com/in/michaelchen',
        company_info: {
          full_name: 'Global Solutions Ltd.',
          industry: 'Consulting',
          size: '200-500 employees',
          revenue: '$20M - $50M',
          founded: '2005',
          headquarters: 'New York, NY',
          website: 'https://globalsolutions.com'
        },
        social_profiles: {
          linkedin: 'https://linkedin.com/in/michaelchen'
        },
        work_history: [
          { company: 'Global Solutions', title: 'Director of Operations', duration: '2019-Present' },
          { company: 'Consulting Firm', title: 'Senior Manager', duration: '2016-2019' }
        ]
      }
    },
    {
      id: 3,
      name: 'Lisa Park',
      email: 'lisa@startupxyz.com',
      company: 'StartupXYZ',
      phone: null,
      enrichment_status: 'pending',
      enrichment_score: 0,
      last_enriched: null,
      original_data: {
        name: 'Lisa Park',
        email: 'lisa@startupxyz.com',
        company: 'StartupXYZ'
      },
      enriched_data: null
    },
    {
      id: 4,
      name: 'Robert Taylor',
      email: 'rtaylor@enterprise.com',
      company: 'Enterprise Inc',
      phone: '+1-555-0789',
      enrichment_status: 'failed',
      enrichment_score: 0,
      last_enriched: '2024-01-13',
      original_data: {
        name: 'Robert Taylor',
        email: 'rtaylor@enterprise.com',
        company: 'Enterprise Inc'
      },
      enriched_data: null,
      enrichment_error: 'Email domain not found in public databases'
    }
  ];

  const enrichmentSources = [
    { name: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, status: 'active' },
    { name: 'Company Database', icon: <Database className="h-4 w-4" />, status: 'active' },
    { name: 'Social Media', icon: <Twitter className="h-4 w-4" />, status: 'active' },
    { name: 'Public Records', icon: <Globe className="h-4 w-4" />, status: 'active' },
    { name: 'News & Press', icon: <Search className="h-4 w-4" />, status: 'active' }
  ];

  useEffect(() => {
    setContacts(mockContacts);
    setEnrichmentStats({
      total_contacts: mockContacts.length,
      enriched: mockContacts.filter(c => c.enrichment_status === 'enriched').length,
      partial: mockContacts.filter(c => c.enrichment_status === 'partial').length,
      pending: mockContacts.filter(c => c.enrichment_status === 'pending').length,
      failed: mockContacts.filter(c => c.enrichment_status === 'failed').length,
      avg_score: Math.round(mockContacts.reduce((sum, c) => sum + c.enrichment_score, 0) / mockContacts.length)
    });
  }, []);

  const startEnrichment = (contactIds = null) => {
    setIsEnriching(true);
    setEnrichmentProgress(0);
    
    const contactsToEnrich = contactIds || contacts.filter(c => c.enrichment_status === 'pending').map(c => c.id);
    setEnrichmentQueue(contactsToEnrich);

    // Simulate enrichment process
    const interval = setInterval(() => {
      setEnrichmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnriching(false);
          // Update contacts with enriched data
          setContacts(prevContacts => 
            prevContacts.map(contact => 
              contactsToEnrich.includes(contact.id) 
                ? { ...contact, enrichment_status: 'enriched', enrichment_score: Math.floor(Math.random() * 30) + 70 }
                : contact
            )
          );
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'enriched': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'enriched': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score > 0) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Enrichment</h1>
          <p className="text-muted-foreground">
            Automatically enhance contact and company data from multiple sources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Sources
          </Button>
          <Button 
            onClick={() => startEnrichment()}
            disabled={isEnriching}
          >
            {isEnriching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Enrich All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">{enrichmentStats.total_contacts}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{enrichmentStats.enriched}</div>
            <div className="text-sm text-muted-foreground">Enriched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{enrichmentStats.partial}</div>
            <div className="text-sm text-muted-foreground">Partial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">{enrichmentStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{enrichmentStats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{enrichmentStats.avg_score}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Progress */}
      {isEnriching && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Enrichment in Progress</h3>
                <span className="text-sm text-muted-foreground">{enrichmentProgress}%</span>
              </div>
              <Progress value={enrichmentProgress} />
              <div className="text-sm text-muted-foreground">
                Processing {enrichmentQueue.length} contacts from multiple data sources...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          {/* Contacts List */}
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{contact.name}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(contact.enrichment_status)}
                            <Badge className={`${getStatusColor(contact.enrichment_status)} text-white`}>
                              {contact.enrichment_status}
                            </Badge>
                            {contact.enrichment_score > 0 && (
                              <Badge variant="outline" className={getScoreColor(contact.enrichment_score)}>
                                {contact.enrichment_score}% complete
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{contact.company}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        {contact.last_enriched && (
                          <div className="text-xs text-muted-foreground">
                            Last enriched: {contact.last_enriched}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {contact.enrichment_status === 'pending' && (
                        <Button size="sm" onClick={() => startEnrichment([contact.id])}>
                          <Zap className="h-4 w-4 mr-2" />
                          Enrich
                        </Button>
                      )}
                      {contact.enrichment_status === 'failed' && (
                        <Button size="sm" variant="outline" onClick={() => startEnrichment([contact.id])}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{contact.name} - Enrichment Details</DialogTitle>
                            <DialogDescription>
                              Complete profile with enriched data from multiple sources
                            </DialogDescription>
                          </DialogHeader>
                          
                          {contact.enriched_data ? (
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div className="space-y-3">
                                <h3 className="font-semibold">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Full Name</Label>
                                    <p className="text-sm">{contact.enriched_data.full_name}</p>
                                  </div>
                                  <div>
                                    <Label>Title</Label>
                                    <p className="text-sm">{contact.enriched_data.title}</p>
                                  </div>
                                  <div>
                                    <Label>Department</Label>
                                    <p className="text-sm">{contact.enriched_data.department}</p>
                                  </div>
                                  <div>
                                    <Label>Seniority</Label>
                                    <p className="text-sm">{contact.enriched_data.seniority}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Contact Information */}
                              <div className="space-y-3">
                                <h3 className="font-semibold">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="text-sm">{contact.enriched_data.phone}</p>
                                  </div>
                                  {contact.enriched_data.mobile && (
                                    <div>
                                      <Label>Mobile</Label>
                                      <p className="text-sm">{contact.enriched_data.mobile}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Social Profiles */}
                              {contact.enriched_data.social_profiles && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold">Social Profiles</h3>
                                  <div className="flex space-x-4">
                                    {Object.entries(contact.enriched_data.social_profiles).map(([platform, url]) => (
                                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" 
                                         className="flex items-center space-x-2 text-blue-600 hover:underline">
                                        {platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                                        {platform === 'twitter' && <Twitter className="h-4 w-4" />}
                                        {platform === 'github' && <Globe className="h-4 w-4" />}
                                        <span className="capitalize">{platform}</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Company Information */}
                              {contact.enriched_data.company_info && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold">Company Information</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Company</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.full_name}</p>
                                    </div>
                                    <div>
                                      <Label>Industry</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.industry}</p>
                                    </div>
                                    <div>
                                      <Label>Size</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.size}</p>
                                    </div>
                                    <div>
                                      <Label>Revenue</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.revenue}</p>
                                    </div>
                                    <div>
                                      <Label>Founded</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.founded}</p>
                                    </div>
                                    <div>
                                      <Label>Headquarters</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.headquarters}</p>
                                    </div>
                                  </div>
                                  {contact.enriched_data.company_info.description && (
                                    <div>
                                      <Label>Description</Label>
                                      <p className="text-sm">{contact.enriched_data.company_info.description}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Work History */}
                              {contact.enriched_data.work_history && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold">Work History</h3>
                                  <div className="space-y-2">
                                    {contact.enriched_data.work_history.map((job, index) => (
                                      <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded">
                                        <Briefcase className="h-4 w-4" />
                                        <div className="flex-1">
                                          <p className="font-medium">{job.title}</p>
                                          <p className="text-sm text-muted-foreground">{job.company}</p>
                                        </div>
                                        <Badge variant="outline">{job.duration}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Education */}
                              {contact.enriched_data.education && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold">Education</h3>
                                  <div className="space-y-2">
                                    {contact.enriched_data.education.map((edu, index) => (
                                      <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded">
                                        <Award className="h-4 w-4" />
                                        <div className="flex-1">
                                          <p className="font-medium">{edu.degree}</p>
                                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                                        </div>
                                        <Badge variant="outline">{edu.year}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Personality Insights */}
                              {contact.enriched_data.personality_insights && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold">Personality Insights</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Communication Style</Label>
                                      <p className="text-sm">{contact.enriched_data.personality_insights.communication_style}</p>
                                    </div>
                                    <div>
                                      <Label>Decision Making</Label>
                                      <p className="text-sm">{contact.enriched_data.personality_insights.decision_making}</p>
                                    </div>
                                    <div>
                                      <Label>Best Contact Time</Label>
                                      <p className="text-sm">{contact.enriched_data.personality_insights.preferred_contact_time}</p>
                                    </div>
                                    <div>
                                      <Label>Response Rate</Label>
                                      <p className="text-sm">{contact.enriched_data.personality_insights.response_rate}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No enriched data available</h3>
                              <p className="text-muted-foreground mb-4">
                                {contact.enrichment_status === 'failed' 
                                  ? contact.enrichment_error 
                                  : 'This contact has not been enriched yet.'}
                              </p>
                              <Button onClick={() => startEnrichment([contact.id])}>
                                <Zap className="h-4 w-4 mr-2" />
                                Start Enrichment
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrichmentSources.map((source, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {source.icon}
                    <h3 className="font-semibold">{source.name}</h3>
                    <Badge className={source.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Data coverage: 85%</p>
                    <p>Last sync: 2 hours ago</p>
                    <p>Rate limit: 1000/hour</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrichment Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Complete Profiles</span>
                    <span className="text-green-600 font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Partial Profiles</span>
                    <span className="text-yellow-600 font-semibold">50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Missing Data</span>
                    <span className="text-red-600 font-semibold">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>LinkedIn</span>
                    <span className="text-green-600 font-semibold">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Company Database</span>
                    <span className="text-green-600 font-semibold">88%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Social Media</span>
                    <span className="text-yellow-600 font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Public Records</span>
                    <span className="text-yellow-600 font-semibold">58%</span>
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

export default DataEnrichment;