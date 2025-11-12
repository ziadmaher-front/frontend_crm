import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  BellRing,
  User,
  Users,
  Database,
  Server,
  Network,
  Globe,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Smartphone,
  Monitor,
  HardDrive,
  Wifi,
  WifiOff,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  File,
  Folder,
  FolderOpen,
  Archive,
  Trash2,
  Edit,
  Copy,
  Share,
  Link,
  ExternalLink,
  Plus,
  Minus,
  X,
  Check,
  Info,
  Warning,
  Zap,
  Target,
  Crosshair,
  Radar,
  Scan,
  ScanLine,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Flag,
  Tag,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Paperclip,
  Image,
  Video,
  Mic,
  Camera,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitMerge,
  Layers,
  Box,
  Package,
  Truck,
  Plane,
  Car,
  Bike,
  Bus,
  Train,
  Ship,
  Rocket,
  Satellite,
  Radio,
  Tv,
  Speaker,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Music,
  Disc,
  Cassette,
  Radio as RadioIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Incident Types and Severity Levels
const INCIDENT_TYPES = {
  MALWARE: {
    name: 'Malware Detection',
    icon: AlertTriangle,
    description: 'Malicious software detected',
    color: 'red',
    defaultSeverity: 'high'
  },
  PHISHING: {
    name: 'Phishing Attack',
    icon: Mail,
    description: 'Suspicious email or website',
    color: 'orange',
    defaultSeverity: 'medium'
  },
  DATA_BREACH: {
    name: 'Data Breach',
    icon: Database,
    description: 'Unauthorized data access',
    color: 'red',
    defaultSeverity: 'critical'
  },
  UNAUTHORIZED_ACCESS: {
    name: 'Unauthorized Access',
    icon: Lock,
    description: 'Suspicious login activity',
    color: 'yellow',
    defaultSeverity: 'medium'
  },
  DDOS: {
    name: 'DDoS Attack',
    icon: Network,
    description: 'Distributed denial of service',
    color: 'red',
    defaultSeverity: 'high'
  },
  INSIDER_THREAT: {
    name: 'Insider Threat',
    icon: User,
    description: 'Suspicious internal activity',
    color: 'purple',
    defaultSeverity: 'high'
  },
  SYSTEM_COMPROMISE: {
    name: 'System Compromise',
    icon: Server,
    description: 'System integrity compromised',
    color: 'red',
    defaultSeverity: 'critical'
  },
  POLICY_VIOLATION: {
    name: 'Policy Violation',
    icon: Flag,
    description: 'Security policy breach',
    color: 'yellow',
    defaultSeverity: 'low'
  }
};

const SEVERITY_LEVELS = {
  LOW: { name: 'Low', color: 'green', priority: 1, sla: 72 },
  MEDIUM: { name: 'Medium', color: 'yellow', priority: 2, sla: 24 },
  HIGH: { name: 'High', color: 'orange', priority: 3, sla: 8 },
  CRITICAL: { name: 'Critical', color: 'red', priority: 4, sla: 2 }
};

const INCIDENT_STATUS = {
  NEW: { name: 'New', color: 'blue', icon: Plus },
  INVESTIGATING: { name: 'Investigating', color: 'yellow', icon: Search },
  CONTAINMENT: { name: 'Containment', color: 'orange', icon: Shield },
  ERADICATION: { name: 'Eradication', color: 'purple', icon: Zap },
  RECOVERY: { name: 'Recovery', color: 'green', icon: RefreshCw },
  CLOSED: { name: 'Closed', color: 'gray', icon: CheckCircle }
};

// Sample security incidents
const securityIncidents = [
  {
    id: 'INC-2024-001',
    title: 'Suspicious Login Activity Detected',
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    createdAt: new Date('2024-01-15T09:30:00Z'),
    updatedAt: new Date('2024-01-15T10:45:00Z'),
    assignedTo: 'security.analyst@company.com',
    reporter: 'system.monitor@company.com',
    description: 'Multiple failed login attempts from unusual geographic locations detected for admin accounts.',
    affectedSystems: ['Authentication Server', 'Admin Portal'],
    affectedUsers: ['admin@company.com', 'superuser@company.com'],
    sourceIP: '203.0.113.45',
    location: 'Unknown (VPN)',
    evidence: ['auth_logs_20240115.log', 'failed_attempts.csv'],
    timeline: [
      { timestamp: new Date('2024-01-15T09:30:00Z'), action: 'Incident detected by automated monitoring', user: 'System' },
      { timestamp: new Date('2024-01-15T09:35:00Z'), action: 'Alert sent to security team', user: 'System' },
      { timestamp: new Date('2024-01-15T09:45:00Z'), action: 'Investigation started', user: 'John Doe' },
      { timestamp: new Date('2024-01-15T10:00:00Z'), action: 'IP address blocked temporarily', user: 'John Doe' },
      { timestamp: new Date('2024-01-15T10:30:00Z'), action: 'Forensic analysis initiated', user: 'Jane Smith' }
    ],
    tags: ['authentication', 'brute-force', 'admin-access'],
    riskScore: 85,
    containmentActions: ['IP blocking', 'Account monitoring', 'Enhanced logging'],
    estimatedImpact: 'Medium - Potential admin account compromise',
    slaDeadline: new Date('2024-01-15T17:30:00Z'),
    escalationLevel: 2
  },
  {
    id: 'INC-2024-002',
    title: 'Malware Detected on Workstation',
    type: 'MALWARE',
    severity: 'CRITICAL',
    status: 'CONTAINMENT',
    createdAt: new Date('2024-01-15T08:15:00Z'),
    updatedAt: new Date('2024-01-15T11:20:00Z'),
    assignedTo: 'incident.response@company.com',
    reporter: 'antivirus.system@company.com',
    description: 'Advanced persistent threat (APT) malware detected on finance department workstation.',
    affectedSystems: ['WS-FIN-001', 'File Server', 'Email System'],
    affectedUsers: ['finance.manager@company.com'],
    sourceIP: '192.168.1.150',
    location: 'Finance Department - Floor 3',
    evidence: ['malware_sample.exe', 'network_traffic.pcap', 'system_memory_dump.dmp'],
    timeline: [
      { timestamp: new Date('2024-01-15T08:15:00Z'), action: 'Malware signature detected', user: 'Antivirus System' },
      { timestamp: new Date('2024-01-15T08:18:00Z'), action: 'Workstation isolated from network', user: 'System' },
      { timestamp: new Date('2024-01-15T08:25:00Z'), action: 'Security team notified', user: 'System' },
      { timestamp: new Date('2024-01-15T08:30:00Z'), action: 'Incident response team activated', user: 'Security Manager' },
      { timestamp: new Date('2024-01-15T09:00:00Z'), action: 'Forensic imaging started', user: 'Forensic Analyst' },
      { timestamp: new Date('2024-01-15T10:30:00Z'), action: 'Malware analysis completed', user: 'Malware Analyst' }
    ],
    tags: ['malware', 'apt', 'finance', 'workstation'],
    riskScore: 95,
    containmentActions: ['Network isolation', 'System imaging', 'User notification', 'Threat hunting'],
    estimatedImpact: 'High - Potential data exfiltration and lateral movement',
    slaDeadline: new Date('2024-01-15T10:15:00Z'),
    escalationLevel: 3
  },
  {
    id: 'INC-2024-003',
    title: 'Phishing Email Campaign',
    type: 'PHISHING',
    severity: 'MEDIUM',
    status: 'RECOVERY',
    createdAt: new Date('2024-01-14T14:20:00Z'),
    updatedAt: new Date('2024-01-15T09:15:00Z'),
    assignedTo: 'email.security@company.com',
    reporter: 'user.report@company.com',
    description: 'Targeted phishing campaign impersonating company executives detected.',
    affectedSystems: ['Email System', 'Web Gateway'],
    affectedUsers: ['Multiple users in sales department'],
    sourceIP: 'Multiple (botnet)',
    location: 'External',
    evidence: ['phishing_emails.eml', 'url_analysis.json', 'user_reports.csv'],
    timeline: [
      { timestamp: new Date('2024-01-14T14:20:00Z'), action: 'First phishing email reported by user', user: 'Sales Rep' },
      { timestamp: new Date('2024-01-14T14:30:00Z'), action: 'Email security team notified', user: 'System' },
      { timestamp: new Date('2024-01-14T15:00:00Z'), action: 'Email campaign analysis started', user: 'Email Analyst' },
      { timestamp: new Date('2024-01-14T16:00:00Z'), action: 'Malicious URLs blocked', user: 'Security Engineer' },
      { timestamp: new Date('2024-01-14T17:00:00Z'), action: 'User awareness notification sent', user: 'Security Manager' },
      { timestamp: new Date('2024-01-15T09:00:00Z'), action: 'Additional security controls implemented', user: 'Security Engineer' }
    ],
    tags: ['phishing', 'email', 'social-engineering', 'sales'],
    riskScore: 65,
    containmentActions: ['URL blocking', 'Email filtering', 'User training', 'Monitoring enhancement'],
    estimatedImpact: 'Medium - Potential credential compromise',
    slaDeadline: new Date('2024-01-15T14:20:00Z'),
    escalationLevel: 1
  }
];

// Incident response team members
const responseTeam = [
  {
    id: 'team_001',
    name: 'John Doe',
    role: 'Incident Response Manager',
    email: 'john.doe@company.com',
    phone: '+1-555-0101',
    expertise: ['Incident Management', 'Forensics', 'Malware Analysis'],
    availability: 'available',
    currentIncidents: 2,
    escalationLevel: 3
  },
  {
    id: 'team_002',
    name: 'Jane Smith',
    role: 'Security Analyst',
    email: 'jane.smith@company.com',
    phone: '+1-555-0102',
    expertise: ['Network Security', 'Threat Hunting', 'Log Analysis'],
    availability: 'busy',
    currentIncidents: 4,
    escalationLevel: 2
  },
  {
    id: 'team_003',
    name: 'Mike Johnson',
    role: 'Forensic Specialist',
    email: 'mike.johnson@company.com',
    phone: '+1-555-0103',
    expertise: ['Digital Forensics', 'Memory Analysis', 'Mobile Forensics'],
    availability: 'available',
    currentIncidents: 1,
    escalationLevel: 2
  }
];

// Playbooks for different incident types
const incidentPlaybooks = [
  {
    id: 'playbook_001',
    name: 'Malware Incident Response',
    type: 'MALWARE',
    description: 'Standard operating procedure for malware incidents',
    steps: [
      'Isolate affected systems from network',
      'Preserve evidence and create forensic images',
      'Analyze malware samples',
      'Identify scope of infection',
      'Remove malware and restore systems',
      'Implement additional security controls',
      'Document lessons learned'
    ],
    estimatedDuration: '4-8 hours',
    requiredRoles: ['Incident Response Manager', 'Malware Analyst', 'System Administrator']
  },
  {
    id: 'playbook_002',
    name: 'Data Breach Response',
    type: 'DATA_BREACH',
    description: 'Comprehensive data breach incident response',
    steps: [
      'Assess scope and nature of breach',
      'Contain the breach and prevent further access',
      'Preserve evidence for investigation',
      'Notify relevant stakeholders',
      'Conduct forensic investigation',
      'Implement remediation measures',
      'Prepare regulatory notifications',
      'Conduct post-incident review'
    ],
    estimatedDuration: '24-72 hours',
    requiredRoles: ['Incident Response Manager', 'Legal Counsel', 'Privacy Officer', 'Forensic Specialist']
  }
];

// Threat intelligence feeds
const threatIntelligence = [
  {
    id: 'threat_001',
    type: 'IOC',
    indicator: '203.0.113.45',
    indicatorType: 'IP Address',
    threatType: 'Malicious IP',
    confidence: 'High',
    source: 'Internal Analysis',
    firstSeen: new Date('2024-01-15T09:30:00Z'),
    lastSeen: new Date('2024-01-15T10:45:00Z'),
    description: 'IP address associated with brute force attacks',
    tags: ['brute-force', 'authentication', 'suspicious']
  },
  {
    id: 'threat_002',
    type: 'IOC',
    indicator: 'malware_sample.exe',
    indicatorType: 'File Hash',
    threatType: 'Malware',
    confidence: 'Very High',
    source: 'Antivirus Detection',
    firstSeen: new Date('2024-01-15T08:15:00Z'),
    lastSeen: new Date('2024-01-15T08:15:00Z'),
    description: 'Advanced persistent threat malware sample',
    tags: ['apt', 'malware', 'finance']
  }
];

// Incident metrics
const incidentMetrics = {
  totalIncidents: 156,
  openIncidents: 23,
  criticalIncidents: 3,
  averageResolutionTime: 18.5, // hours
  mttr: 12.3, // mean time to resolution
  mtbd: 2.1, // mean time between detection
  slaCompliance: 94.2,
  falsePositiveRate: 8.7
};

// Incident trends
const incidentTrends = [
  { date: '2024-01-09', total: 12, critical: 1, high: 4, medium: 5, low: 2 },
  { date: '2024-01-10', total: 15, critical: 2, high: 3, medium: 7, low: 3 },
  { date: '2024-01-11', total: 8, critical: 0, high: 2, medium: 4, low: 2 },
  { date: '2024-01-12', total: 18, critical: 1, high: 5, medium: 8, low: 4 },
  { date: '2024-01-13', total: 11, critical: 0, high: 3, medium: 6, low: 2 },
  { date: '2024-01-14', total: 14, critical: 1, high: 4, medium: 6, low: 3 },
  { date: '2024-01-15', total: 9, critical: 1, high: 2, medium: 4, low: 2 }
];

const SecurityIncidentResponse = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [showPlaybookDialog, setShowPlaybookDialog] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800 border-blue-200',
      INVESTIGATING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONTAINMENT: 'bg-orange-100 text-orange-800 border-orange-200',
      ERADICATION: 'bg-purple-100 text-purple-800 border-purple-200',
      RECOVERY: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h remaining` : 'Overdue';
  };

  const IncidentCard = ({ incident }) => {
    const IncidentIcon = INCIDENT_TYPES[incident.type]?.icon || AlertTriangle;
    const StatusIcon = INCIDENT_STATUS[incident.status]?.icon || Clock;
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIncident(incident)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-${INCIDENT_TYPES[incident.type]?.color}-100`}>
                <IncidentIcon className={`h-4 w-4 text-${INCIDENT_TYPES[incident.type]?.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{incident.id}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{incident.title}</p>
                <p className="text-xs text-gray-500">{incident.createdAt.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getSeverityColor(incident.severity)}>
                {incident.severity}
              </Badge>
              <Badge className={getStatusColor(incident.status)} variant="outline">
                {incident.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-1 font-medium">{INCIDENT_TYPES[incident.type]?.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Assigned:</span>
              <span className="ml-1 font-medium">{incident.assignedTo?.split('@')[0] || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-gray-600">Risk Score:</span>
              <span className="ml-1 font-medium">{incident.riskScore}</span>
            </div>
            <div>
              <span className="text-gray-600">SLA:</span>
              <span className={`ml-1 font-medium ${new Date() > incident.slaDeadline ? 'text-red-600' : 'text-green-600'}`}>
                {getTimeRemaining(incident.slaDeadline)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progress:</span>
              <StatusIcon className="h-3 w-3" />
            </div>
            
            <div className="flex flex-wrap gap-1">
              {incident.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {incident.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{incident.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Risk Level:</span>
              <span className="font-medium">{incident.riskScore}%</span>
            </div>
            <Progress value={incident.riskScore} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const TeamMemberCard = ({ member }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${member.availability === 'available' ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <User className={`h-4 w-4 ${member.availability === 'available' ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{member.name}</h3>
              <p className="text-xs text-gray-600">{member.role}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
          </div>
          <Badge className={member.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {member.availability}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Incidents:</span>
            <span className="font-medium">{member.currentIncidents}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Escalation Level:</span>
            <span className="font-medium">Level {member.escalationLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{member.phone}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs text-gray-600">Expertise:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {member.expertise.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PlaybookCard = ({ playbook }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPlaybook(playbook)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{playbook.name}</h3>
              <p className="text-xs text-gray-600">{playbook.description}</p>
            </div>
          </div>
          <Badge variant="outline">
            {INCIDENT_TYPES[playbook.type]?.name}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Steps:</span>
            <span className="font-medium">{playbook.steps.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{playbook.estimatedDuration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Required Roles:</span>
            <span className="font-medium">{playbook.requiredRoles.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ThreatIntelCard = ({ threat }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Target className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{threat.indicator}</h3>
              <p className="text-xs text-gray-600">{threat.indicatorType}</p>
              <p className="text-xs text-gray-500">{threat.threatType}</p>
            </div>
          </div>
          <Badge className={threat.confidence === 'Very High' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
            {threat.confidence}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Source:</span>
            <span className="font-medium">{threat.source}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">First Seen:</span>
            <span className="font-medium">{threat.firstSeen.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Seen:</span>
            <span className="font-medium">{threat.lastSeen.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2">{threat.description}</p>
          <div className="flex flex-wrap gap-1">
            {threat.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Incident Response</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive incident management with automated workflows and forensic capabilities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch checked={isMonitoring} onCheckedChange={setIsMonitoring} />
            <span className="text-sm">Real-time Monitoring</span>
            {isMonitoring && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <Button variant="outline" onClick={() => setShowNewIncident(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
          <Button variant="outline" onClick={() => setShowPlaybookDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Playbooks
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-red-600">{incidentMetrics.openIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <AlertCircle className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">{incidentMetrics.criticalIncidents} critical</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MTTR</p>
                <p className="text-2xl font-bold text-blue-600">{incidentMetrics.mttr}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">15% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-green-600">{incidentMetrics.slaCompliance}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={incidentMetrics.slaCompliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">False Positive Rate</p>
                <p className="text-2xl font-bold text-orange-600">{incidentMetrics.falsePositiveRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600">2% increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="team">Response Team</TabsTrigger>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="intelligence">Threat Intel</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Incident Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Trends</CardTitle>
              <CardDescription>Daily incident volume by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={incidentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#fee2e2" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#fed7aa" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#fef3c7" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#dcfce7" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Incidents</CardTitle>
                <CardDescription>High priority incidents requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {securityIncidents
                      .filter(incident => incident.severity === 'CRITICAL' || incident.severity === 'HIGH')
                      .slice(0, 3)
                      .map((incident) => (
                        <IncidentCard key={incident.id} incident={incident} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Team Status</CardTitle>
                <CardDescription>Current availability and workload</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {responseTeam.map((member) => (
                      <TeamMemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          {/* Incident Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(INCIDENT_STATUS).map(([key, status]) => (
                      <SelectItem key={key} value={key}>{status.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    {Object.entries(SEVERITY_LEVELS).map(([key, severity]) => (
                      <SelectItem key={key} value={key}>{severity.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Incidents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityIncidents
              .filter(incident => 
                (statusFilter === 'all' || incident.status === statusFilter) &&
                (severityFilter === 'all' || incident.severity === severityFilter) &&
                (searchTerm === '' || 
                  incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  incident.id.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
          </div>
        </TabsContent>

        {/* Response Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responseTeam.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        {/* Playbooks Tab */}
        <TabsContent value="playbooks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incidentPlaybooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        </TabsContent>

        {/* Threat Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threatIntelligence.map((threat) => (
              <ThreatIntelCard key={threat.id} threat={threat} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response Analytics</CardTitle>
              <CardDescription>Comprehensive incident response metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={incidentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" />
                  <Bar dataKey="critical" fill="#ef4444" />
                  <Bar dataKey="high" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Details - {selectedIncident?.id}</DialogTitle>
            <DialogDescription>
              Comprehensive incident information and response timeline
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Title</Label>
                  <p className="text-sm">{selectedIncident.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <Badge variant="outline">{INCIDENT_TYPES[selectedIncident.type]?.name}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Severity</Label>
                  <Badge className={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm">{selectedIncident.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm">{selectedIncident.updatedAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                  <p className="text-sm">{selectedIncident.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Risk Score</Label>
                  <p className="text-sm font-bold">{selectedIncident.riskScore}</p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedIncident.description}</p>
              </div>

              {/* Affected Systems and Users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Affected Systems</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIncident.affectedSystems.map((system) => (
                      <Badge key={system} variant="outline" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Affected Users</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIncident.affectedUsers.map((user) => (
                      <Badge key={user} variant="outline" className="text-xs">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Response Timeline</Label>
                <div className="mt-2 space-y-3">
                  {selectedIncident.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-gray-600">
                          {event.timestamp.toLocaleString()} - {event.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence and Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Evidence</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIncident.evidence.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        <File className="h-3 w-3 mr-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIncident.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Containment Actions */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Containment Actions</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedIncident.containmentActions.map((action) => (
                    <Badge key={action} className="bg-orange-100 text-orange-800 text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityIncidentResponse;