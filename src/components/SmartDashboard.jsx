import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LayoutDashboard, 
  Brain, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar, 
  Clock, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Move, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  RotateCcw, 
  Save, 
  Download, 
  Share, 
  Filter, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb, 
  Star, 
  Bookmark, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building, 
  User, 
  FileText, 
  Briefcase, 
  ShoppingCart, 
  CreditCard, 
  Percent, 
  Award, 
  Trophy, 
  Medal, 
  Flag, 
  Rocket, 
  Sparkles, 
  Wand2, 
  Database, 
  Server, 
  Cloud, 
  Wifi, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Headphones, 
  Camera, 
  Video, 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Repeat, 
  Shuffle, 
  List, 
  Grid, 
  Columns, 
  Rows, 
  Layers, 
  Box, 
  Package, 
  Archive, 
  Folder, 
  File, 
  Image, 
  Music, 
  Film, 
  Paperclip, 
  Link, 
  ExternalLink, 
  Copy, 
  Scissors, 
  Clipboard, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  MoreVertical, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Navigation, 
  Compass, 
  Map, 
  Route, 
  Car, 
  Truck, 
  Plane, 
  Ship, 
  Train, 
  Bike, 
  Walk, 
  Home, 
  Office, 
  Store, 
  Factory, 
  School, 
  Hospital, 
  Bank, 
  Hotel, 
  Restaurant, 
  Coffee, 
  Pizza, 
  Utensils, 
  Wine, 
  Beer, 
  Cake, 
  Apple, 
  Banana, 
  Cherry, 
  Grape, 
  Orange, 
  Strawberry, 
  Carrot, 
  Corn, 
  Leaf, 
  Tree, 
  Flower, 
  Sun, 
  Moon, 
  Star as StarIcon, 
  Cloud as CloudIcon, 
  CloudRain, 
  CloudSnow, 
  Zap as ZapIcon, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sunrise, 
  Sunset, 
  Rainbow, 
  Umbrella, 
  Snowflake, 
  Fire, 
  Flame, 
  Waves, 
  Mountain, 
  Volcano, 
  Desert, 
  Forest, 
  Island, 
  Beach, 
  Lake, 
  River, 
  Waterfall, 
  Bridge, 
  Castle, 
  Church, 
  Mosque, 
  Temple, 
  Synagogue, 
  Pagoda, 
  Statue, 
  Monument, 
  Landmark, 
  Tower, 
  Lighthouse, 
  Windmill, 
  Ferris, 
  Tent, 
  Camping, 
  Backpack, 
  Luggage, 
  Passport, 
  Ticket, 
  Boarding, 
  Departure, 
  Arrival, 
  Security, 
  Customs, 
  Immigration, 
  Visa, 
  Currency, 
  Exchange, 
  ATM, 
  Receipt, 
  Invoice, 
  Bill, 
  Tax, 
  Discount, 
  Sale, 
  Offer, 
  Deal, 
  Coupon, 
  Voucher, 
  Gift, 
  Present, 
  Surprise, 
  Party, 
  Celebration, 
  Birthday, 
  Anniversary, 
  Wedding, 
  Graduation, 
  Promotion, 
  Achievement, 
  Success, 
  Victory, 
  Winner, 
  Champion, 
  Leader, 
  Boss, 
  Manager, 
  Employee, 
  Worker, 
  Team, 
  Group, 
  Community, 
  Network, 
  Connection, 
  Relationship, 
  Partnership, 
  Collaboration, 
  Cooperation, 
  Support, 
  Help, 
  Assistance, 
  Service, 
  Customer, 
  Client, 
  Vendor, 
  Supplier, 
  Provider, 
  Contractor, 
  Consultant, 
  Advisor, 
  Expert, 
  Specialist, 
  Professional, 
  Technician, 
  Engineer, 
  Developer, 
  Designer, 
  Artist, 
  Creator, 
  Maker, 
  Builder, 
  Architect, 
  Planner, 
  Strategist, 
  Analyst, 
  Researcher, 
  Scientist, 
  Doctor, 
  Nurse, 
  Teacher, 
  Student, 
  Learner, 
  Trainer, 
  Coach, 
  Mentor, 
  Guide, 
  Instructor, 
  Tutor, 
  Professor, 
  Scholar, 
  Academic, 
  Intellectual, 
  Thinker, 
  Philosopher, 
  Writer, 
  Author, 
  Journalist, 
  Reporter, 
  Editor, 
  Publisher, 
  Blogger, 
  Influencer, 
  Celebrity, 
  Personality, 
  Character, 
  Avatar, 
  Profile, 
  Account, 
  Identity, 
  Persona, 
  Role, 
  Position, 
  Status, 
  Rank, 
  Level, 
  Grade, 
  Score, 
  Rating, 
  Review, 
  Feedback, 
  Comment, 
  Opinion, 
  Suggestion, 
  Recommendation, 
  Advice, 
  Tip, 
  Hint, 
  Clue, 
  Secret, 
  Mystery, 
  Puzzle, 
  Game, 
  Sport, 
  Competition, 
  Contest, 
  Tournament, 
  Championship, 
  League, 
  Match, 
  Race, 
  Marathon, 
  Sprint, 
  Relay, 
  Hurdle, 
  Jump, 
  Throw, 
  Catch, 
  Kick, 
  Hit, 
  Strike, 
  Swing, 
  Serve, 
  Return, 
  Volley, 
  Smash, 
  Spike, 
  Block, 
  Defend, 
  Attack, 
  Offense, 
  Defense, 
  Strategy, 
  Tactic, 
  Plan, 
  Goal, 
  Objective, 
  Mission, 
  Vision, 
  Purpose, 
  Intention, 
  Motivation, 
  Inspiration, 
  Aspiration, 
  Ambition, 
  Dream, 
  Hope, 
  Wish, 
  Desire, 
  Want, 
  Need, 
  Requirement, 
  Demand, 
  Request, 
  Order, 
  Command, 
  Instruction, 
  Direction, 
  Guidance, 
  Navigation as NavigationIcon, 
  Path, 
  Way, 
  Road, 
  Street, 
  Avenue, 
  Boulevard, 
  Highway, 
  Freeway, 
  Expressway, 
  Motorway, 
  Turnpike, 
  Bypass, 
  Detour, 
  Shortcut, 
  Alternate, 
  Option, 
  Choice, 
  Selection, 
  Decision, 
  Judgment, 
  Evaluation, 
  Assessment, 
  Analysis, 
  Examination, 
  Investigation, 
  Research, 
  Study, 
  Survey, 
  Poll, 
  Vote, 
  Election, 
  Campaign, 
  Politics, 
  Government, 
  Law, 
  Legal, 
  Court, 
  Judge, 
  Jury, 
  Lawyer, 
  Attorney, 
  Advocate, 
  Representative, 
  Agent, 
  Broker, 
  Dealer, 
  Seller, 
  Buyer, 
  Purchaser, 
  Consumer, 
  Customer as CustomerIcon, 
  Client as ClientIcon, 
  User as UserIcon, 
  Member, 
  Subscriber, 
  Follower, 
  Fan, 
  Supporter, 
  Advocate as AdvocateIcon, 
  Champion as ChampionIcon, 
  Defender, 
  Protector, 
  Guardian, 
  Keeper, 
  Custodian, 
  Caretaker, 
  Steward, 
  Trustee, 
  Fiduciary, 
  Executor, 
  Administrator, 
  Manager as ManagerIcon, 
  Director, 
  Executive, 
  Officer, 
  Official, 
  Authority, 
  Power, 
  Control, 
  Command as CommandIcon, 
  Leadership, 
  Management, 
  Administration, 
  Governance, 
  Oversight, 
  Supervision, 
  Monitoring, 
  Tracking, 
  Surveillance, 
  Security as SecurityIcon, 
  Safety, 
  Protection, 
  Defense as DefenseIcon, 
  Shield, 
  Armor, 
  Guard, 
  Barrier, 
  Wall, 
  Fence, 
  Gate, 
  Door, 
  Window, 
  Opening, 
  Entrance, 
  Exit, 
  Portal, 
  Gateway, 
  Passage, 
  Corridor, 
  Hallway, 
  Room, 
  Chamber, 
  Space, 
  Area, 
  Zone, 
  Region, 
  Territory, 
  District, 
  Neighborhood, 
  Community as CommunityIcon, 
  Society, 
  Culture, 
  Tradition, 
  Custom, 
  Practice, 
  Habit, 
  Routine, 
  Pattern, 
  Trend, 
  Fashion, 
  Style, 
  Design, 
  Art, 
  Craft, 
  Skill, 
  Talent, 
  Ability, 
  Capability, 
  Capacity, 
  Potential, 
  Opportunity, 
  Chance, 
  Possibility, 
  Probability, 
  Likelihood, 
  Risk, 
  Danger, 
  Threat, 
  Warning, 
  Alert, 
  Alarm, 
  Signal, 
  Sign, 
  Symbol, 
  Icon, 
  Logo, 
  Brand, 
  Label, 
  Tag, 
  Mark, 
  Stamp, 
  Seal, 
  Signature, 
  Autograph, 
  Handwriting, 
  Text, 
  Content, 
  Message, 
  Communication, 
  Information, 
  Data, 
  Knowledge, 
  Wisdom, 
  Intelligence, 
  Smart, 
  Clever, 
  Brilliant, 
  Genius, 
  Talented, 
  Skilled, 
  Expert as ExpertIcon, 
  Professional as ProfessionalIcon, 
  Qualified, 
  Certified, 
  Licensed, 
  Authorized, 
  Approved, 
  Verified, 
  Validated, 
  Confirmed, 
  Guaranteed, 
  Assured, 
  Secure, 
  Safe, 
  Protected, 
  Defended, 
  Guarded, 
  Shielded, 
  Covered, 
  Insured, 
  Backed, 
  Supported, 
  Endorsed, 
  Recommended, 
  Suggested, 
  Proposed, 
  Offered, 
  Provided, 
  Supplied, 
  Delivered, 
  Shipped, 
  Transported, 
  Moved, 
  Transferred, 
  Exchanged, 
  Traded, 
  Sold, 
  Bought, 
  Purchased, 
  Acquired, 
  Obtained, 
  Received, 
  Collected, 
  Gathered, 
  Assembled, 
  Built, 
  Constructed, 
  Created, 
  Made, 
  Produced, 
  Manufactured, 
  Generated, 
  Developed, 
  Designed, 
  Planned, 
  Organized, 
  Arranged, 
  Scheduled, 
  Timed, 
  Coordinated, 
  Synchronized, 
  Aligned, 
  Matched, 
  Paired, 
  Coupled, 
  Connected, 
  Linked, 
  Joined, 
  United, 
  Combined, 
  Merged, 
  Integrated, 
  Incorporated, 
  Included, 
  Added, 
  Inserted, 
  Embedded, 
  Attached, 
  Fixed, 
  Secured, 
  Fastened, 
  Tied, 
  Bound, 
  Locked, 
  Sealed, 
  Closed, 
  Shut, 
  Blocked, 
  Stopped, 
  Halted, 
  Paused, 
  Suspended, 
  Delayed, 
  Postponed, 
  Deferred, 
  Cancelled, 
  Terminated, 
  Ended, 
  Finished, 
  Completed, 
  Done, 
  Accomplished, 
  Achieved, 
  Reached, 
  Attained, 
  Gained, 
  Won, 
  Earned, 
  Deserved, 
  Merited, 
  Qualified as QualifiedIcon, 
  Eligible, 
  Suitable, 
  Appropriate, 
  Proper, 
  Correct, 
  Right, 
  Accurate, 
  Precise, 
  Exact, 
  Perfect, 
  Ideal, 
  Optimal, 
  Best, 
  Top, 
  Superior, 
  Excellent, 
  Outstanding, 
  Exceptional, 
  Remarkable, 
  Notable, 
  Significant, 
  Important, 
  Critical, 
  Essential, 
  Vital, 
  Crucial, 
  Key, 
  Main, 
  Primary, 
  Principal, 
  Major, 
  Leading, 
  Dominant, 
  Prominent, 
  Featured, 
  Highlighted, 
  Emphasized, 
  Stressed, 
  Focused, 
  Concentrated, 
  Centered, 
  Balanced, 
  Stable, 
  Steady, 
  Consistent, 
  Reliable, 
  Dependable, 
  Trustworthy, 
  Honest, 
  Truthful, 
  Genuine, 
  Authentic, 
  Real, 
  Actual, 
  True, 
  Valid, 
  Legitimate, 
  Legal as LegalIcon, 
  Lawful, 
  Authorized as AuthorizedIcon, 
  Permitted, 
  Allowed, 
  Approved as ApprovedIcon, 
  Accepted, 
  Agreed, 
  Consented, 
  Confirmed as ConfirmedIcon, 
  Verified as VerifiedIcon, 
  Validated as ValidatedIcon, 
  Certified as CertifiedIcon, 
  Licensed as LicensedIcon, 
  Registered, 
  Enrolled, 
  Subscribed, 
  Joined as JoinedIcon, 
  Participated, 
  Engaged, 
  Involved, 
  Included as IncludedIcon, 
  Invited, 
  Welcome, 
  Greeted, 
  Received as ReceivedIcon, 
  Accepted as AcceptedIcon, 
  Embraced, 
  Adopted, 
  Chosen, 
  Selected, 
  Picked, 
  Preferred, 
  Favored, 
  Liked, 
  Loved, 
  Adored, 
  Cherished, 
  Treasured, 
  Valued, 
  Appreciated, 
  Respected, 
  Admired, 
  Praised, 
  Complimented, 
  Congratulated, 
  Celebrated, 
  Honored, 
  Recognized, 
  Acknowledged, 
  Credited, 
  Attributed, 
  Assigned, 
  Allocated, 
  Distributed, 
  Shared, 
  Divided, 
  Split, 
  Separated, 
  Isolated, 
  Detached, 
  Disconnected, 
  Unlinked, 
  Removed, 
  Deleted, 
  Erased, 
  Cleared, 
  Cleaned, 
  Wiped, 
  Reset, 
  Restored, 
  Recovered, 
  Repaired, 
  Fixed as FixedIcon, 
  Corrected, 
  Adjusted, 
  Modified, 
  Changed, 
  Updated, 
  Upgraded, 
  Improved, 
  Enhanced, 
  Optimized, 
  Refined, 
  Polished, 
  Perfected, 
  Completed as CompletedIcon, 
  Finished as FinishedIcon, 
  Done as DoneIcon, 
  Ready, 
  Prepared, 
  Set, 
  Configured, 
  Setup, 
  Installed, 
  Deployed, 
  Launched, 
  Started, 
  Initiated, 
  Begun, 
  Commenced, 
  Opened, 
  Activated, 
  Enabled, 
  Turned, 
  Switched, 
  Toggled, 
  Flipped, 
  Reversed, 
  Inverted, 
  Rotated, 
  Spun, 
  Twisted, 
  Bent, 
  Curved, 
  Shaped, 
  Formed, 
  Molded, 
  Crafted, 
  Sculpted, 
  Carved, 
  Engraved, 
  Etched, 
  Printed, 
  Published, 
  Released, 
  Issued, 
  Distributed as DistributedIcon, 
  Circulated, 
  Spread, 
  Broadcasted, 
  Transmitted, 
  Sent, 
  Delivered as DeliveredIcon, 
  Shipped as ShippedIcon, 
  Mailed, 
  Posted, 
  Uploaded, 
  Downloaded as DownloadedIcon, 
  Transferred as TransferredIcon, 
  Moved as MovedIcon, 
  Relocated, 
  Migrated, 
  Imported, 
  Exported, 
  Backed as BackedIcon, 
  Saved as SavedIcon, 
  Stored, 
  Archived as ArchivedIcon, 
  Filed, 
  Organized as OrganizedIcon, 
  Sorted, 
  Arranged as ArrangedIcon, 
  Ordered, 
  Ranked, 
  Rated, 
  Scored, 
  Graded, 
  Evaluated, 
  Assessed, 
  Reviewed, 
  Analyzed, 
  Examined, 
  Inspected, 
  Checked, 
  Tested, 
  Verified as VerifiedIconAlt, 
  Validated as ValidatedIconAlt, 
  Confirmed as ConfirmedIconAlt, 
  Approved as ApprovedIconAlt, 
  Accepted as AcceptedIconAlt, 
  Passed, 
  Succeeded, 
  Won as WonIcon, 
  Achieved as AchievedIcon, 
  Accomplished as AccomplishedIcon, 
  Completed as CompletedIconAlt, 
  Finished as FinishedIconAlt, 
  Done as DoneIconAlt 
} from 'lucide-react';

export default function SmartDashboard() {
  const [dashboardLayout, setDashboardLayout] = useState('adaptive');
  const [widgets, setWidgets] = useState([]);
  const [userBehavior, setUserBehavior] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [personalizedInsights, setPersonalizedInsights] = useState({});
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    autoResize: true,
    smartPositioning: true,
    contextualContent: true,
    predictiveLoading: true,
    behaviorTracking: true
  });
  const [currentView, setCurrentView] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);

  const dashboardRef = useRef(null);

  useEffect(() => {
    initializeDashboard();
    trackUserBehavior();
    generateAIRecommendations();
    loadPersonalizedInsights();
  }, []);

  useEffect(() => {
    if (adaptiveSettings.autoResize) {
      adaptLayoutToScreen();
    }
  }, [adaptiveSettings.autoResize]);

  const initializeDashboard = () => {
    const defaultWidgets = [
      {
        id: 'sales-overview',
        type: 'chart',
        title: 'Sales Overview',
        size: 'large',
        position: { x: 0, y: 0, w: 6, h: 4 },
        data: {
          revenue: 125000,
          deals: 23,
          conversion: 18.5,
          trend: 'up'
        },
        priority: 'high',
        lastViewed: new Date(),
        viewCount: 45,
        interactionScore: 92
      },
      {
        id: 'lead-pipeline',
        type: 'pipeline',
        title: 'Lead Pipeline',
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 },
        data: {
          qualified: 156,
          contacted: 89,
          demo: 34,
          proposal: 12
        },
        priority: 'high',
        lastViewed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        viewCount: 38,
        interactionScore: 87
      },
      {
        id: 'recent-activities',
        type: 'activity',
        title: 'Recent Activities',
        size: 'medium',
        position: { x: 0, y: 4, w: 4, h: 3 },
        data: {
          activities: [
            { type: 'call', contact: 'John Smith', time: '2 hours ago' },
            { type: 'email', contact: 'Sarah Johnson', time: '4 hours ago' },
            { type: 'meeting', contact: 'Mike Chen', time: '1 day ago' }
          ]
        },
        priority: 'medium',
        lastViewed: new Date(Date.now() - 1 * 60 * 60 * 1000),
        viewCount: 28,
        interactionScore: 73
      },
      {
        id: 'performance-metrics',
        type: 'metrics',
        title: 'Performance Metrics',
        size: 'small',
        position: { x: 4, y: 4, w: 4, h: 3 },
        data: {
          callsToday: 12,
          emailsSent: 25,
          meetingsScheduled: 3,
          tasksCompleted: 8
        },
        priority: 'medium',
        lastViewed: new Date(Date.now() - 30 * 60 * 1000),
        viewCount: 22,
        interactionScore: 68
      },
      {
        id: 'ai-insights',
        type: 'insights',
        title: 'AI Insights',
        size: 'medium',
        position: { x: 8, y: 4, w: 4, h: 3 },
        data: {
          insights: [
            'Focus on TechCorp deal - high closure probability',
            'Schedule follow-ups for 5 overdue leads',
            'Best time to call prospects: 2-4 PM'
          ]
        },
        priority: 'high',
        lastViewed: new Date(Date.now() - 15 * 60 * 1000),
        viewCount: 52,
        interactionScore: 95
      },
      {
        id: 'upcoming-tasks',
        type: 'tasks',
        title: 'Upcoming Tasks',
        size: 'small',
        position: { x: 0, y: 7, w: 6, h: 2 },
        data: {
          tasks: [
            { title: 'Demo with CloudFirst', due: '2 hours', priority: 'high' },
            { title: 'Follow up with RetailMax', due: '4 hours', priority: 'medium' },
            { title: 'Prepare proposal for DataDriven', due: '1 day', priority: 'high' }
          ]
        },
        priority: 'medium',
        lastViewed: new Date(Date.now() - 45 * 60 * 1000),
        viewCount: 31,
        interactionScore: 76
      },
      {
        id: 'weather-widget',
        type: 'weather',
        title: 'Weather',
        size: 'small',
        position: { x: 6, y: 7, w: 3, h: 2 },
        data: {
          temperature: 72,
          condition: 'sunny',
          location: 'San Francisco'
        },
        priority: 'low',
        lastViewed: new Date(Date.now() - 3 * 60 * 60 * 1000),
        viewCount: 8,
        interactionScore: 25
      },
      {
        id: 'quick-actions',
        type: 'actions',
        title: 'Quick Actions',
        size: 'small',
        position: { x: 9, y: 7, w: 3, h: 2 },
        data: {
          actions: [
            { label: 'Add Lead', icon: 'plus' },
            { label: 'Schedule Call', icon: 'phone' },
            { label: 'Send Email', icon: 'mail' },
            { label: 'Create Task', icon: 'check' }
          ]
        },
        priority: 'medium',
        lastViewed: new Date(Date.now() - 20 * 60 * 1000),
        viewCount: 19,
        interactionScore: 58
      }
    ];

    setWidgets(defaultWidgets);
  };

  const trackUserBehavior = () => {
    const behavior = {
      mostViewedWidgets: ['sales-overview', 'ai-insights', 'lead-pipeline'],
      preferredTimeRange: '7d',
      activeHours: ['9-11', '14-16'],
      interactionPatterns: {
        clicksPerSession: 15,
        timeSpentPerWidget: 45, // seconds
        preferredWidgetSizes: ['large', 'medium']
      },
      deviceUsage: {
        desktop: 75,
        tablet: 20,
        mobile: 5
      },
      featureUsage: {
        filters: 85,
        exports: 45,
        customization: 30,
        sharing: 15
      }
    };

    setUserBehavior(behavior);
  };

  const generateAIRecommendations = () => {
    const recommendations = [
      {
        type: 'layout',
        title: 'Optimize Widget Placement',
        description: 'Move AI Insights to top-left for better visibility based on your usage patterns',
        impact: 'high',
        confidence: 92,
        action: 'reposition'
      },
      {
        type: 'content',
        title: 'Add Deal Forecast Widget',
        description: 'You frequently check deal data - a forecast widget would save time',
        impact: 'medium',
        confidence: 87,
        action: 'add'
      },
      {
        type: 'timing',
        title: 'Schedule Data Refresh',
        description: 'Refresh lead data at 9 AM and 2 PM when you\'re most active',
        impact: 'medium',
        confidence: 78,
        action: 'schedule'
      },
      {
        type: 'personalization',
        title: 'Hide Weather Widget',
        description: 'Low engagement suggests this widget isn\'t valuable to you',
        impact: 'low',
        confidence: 95,
        action: 'hide'
      }
    ];

    setAiRecommendations(recommendations);
  };

  const loadPersonalizedInsights = () => {
    const insights = {
      productivity: {
        score: 87,
        trend: 'up',
        bestHours: '10 AM - 12 PM',
        suggestions: [
          'Schedule important calls during peak hours',
          'Block calendar for deep work in the morning'
        ]
      },
      performance: {
        dealsThisWeek: 3,
        leadsGenerated: 15,
        conversionRate: 18.5,
        comparison: {
          lastWeek: { deals: 2, leads: 12, conversion: 16.7 },
          trend: 'improving'
        }
      },
      predictions: {
        weeklyRevenue: 145000,
        monthlyTarget: 85, // percentage
        dealClosureProbability: [
          { deal: 'TechCorp', probability: 85 },
          { deal: 'RetailMax', probability: 62 },
          { deal: 'CloudFirst', probability: 78 }
        ]
      },
      recommendations: [
        'Focus on TechCorp deal - highest closure probability',
        'Schedule follow-up with 5 leads from last week',
        'Review pricing strategy for RetailMax deal'
      ]
    };

    setPersonalizedInsights(insights);
  };

  const adaptLayoutToScreen = () => {
    const screenWidth = window.innerWidth;
    let columns = 12;
    
    if (screenWidth < 768) {
      columns = 1; // Mobile: single column
    } else if (screenWidth < 1024) {
      columns = 2; // Tablet: two columns
    } else if (screenWidth < 1440) {
      columns = 3; // Small desktop: three columns
    }

    // Reorganize widgets based on priority and screen size
    const reorganizedWidgets = widgets.map((widget, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      return {
        ...widget,
        position: {
          ...widget.position,
          x: col * (12 / columns),
          y: row * 4,
          w: 12 / columns,
          h: widget.size === 'large' ? 4 : widget.size === 'medium' ? 3 : 2
        }
      };
    });

    setWidgets(reorganizedWidgets);
  };

  const applyAIRecommendation = (recommendation) => {
    switch (recommendation.action) {
      case 'reposition':
        // Move AI Insights to top-left
        setWidgets(prev => prev.map(widget => 
          widget.id === 'ai-insights' 
            ? { ...widget, position: { x: 0, y: 0, w: 6, h: 3 } }
            : widget.id === 'sales-overview'
            ? { ...widget, position: { x: 6, y: 0, w: 6, h: 4 } }
            : widget
        ));
        break;
      case 'add':
        // Add new widget
        const newWidget = {
          id: 'deal-forecast',
          type: 'forecast',
          title: 'Deal Forecast',
          size: 'medium',
          position: { x: 0, y: 9, w: 6, h: 3 },
          data: {
            thisMonth: 285000,
            nextMonth: 320000,
            confidence: 82
          },
          priority: 'high'
        };
        setWidgets(prev => [...prev, newWidget]);
        break;
      case 'hide':
        // Hide widget
        setWidgets(prev => prev.filter(widget => widget.id !== 'weather-widget'));
        break;
      default:
        break;
    }
  };

  const getWidgetIcon = (type) => {
    const icons = {
      chart: BarChart3,
      pipeline: Target,
      activity: Activity,
      metrics: TrendingUp,
      insights: Lightbulb,
      tasks: CheckCircle,
      weather: Sun,
      actions: Zap,
      forecast: Crystal
    };
    return icons[type] || LayoutDashboard;
  };

  const renderWidget = (widget) => {
    const WidgetIcon = getWidgetIcon(widget.type);
    
    return (
      <Card 
        key={widget.id}
        className={`${isCustomizing ? 'cursor-move border-dashed' : ''} ${
          widget.priority === 'high' ? 'border-blue-500' : 
          widget.priority === 'medium' ? 'border-yellow-500' : 'border-gray-300'
        }`}
        draggable={isCustomizing}
        onDragStart={() => setDraggedWidget(widget)}
        onDragEnd={() => setDraggedWidget(null)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WidgetIcon className="h-4 w-4" />
              {widget.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {widget.interactionScore && (
                <Badge variant="outline" className="text-xs">
                  {widget.interactionScore}% engagement
                </Badge>
              )}
              {isCustomizing && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderWidgetContent(widget)}
        </CardContent>
      </Card>
    );
  };

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${(widget.data.revenue / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-600">Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {widget.data.deals}
                </div>
                <div className="text-xs text-gray-600">Deals</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+{widget.data.conversion}%</span>
              <span className="text-gray-600">vs last period</span>
            </div>
          </div>
        );
      
      case 'pipeline':
        return (
          <div className="space-y-3">
            {Object.entries(widget.data).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm capitalize">{stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${(count / 200) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'activity':
        return (
          <div className="space-y-2">
            {widget.data.activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.contact}</div>
                  <div className="text-xs text-gray-600">{activity.type} • {activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'metrics':
        return (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(widget.data).map(([metric, value]) => (
              <div key={metric} className="text-center">
                <div className="text-lg font-bold text-blue-600">{value}</div>
                <div className="text-xs text-gray-600 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1')}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'insights':
        return (
          <div className="space-y-2">
            {widget.data.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                <span className="text-sm text-purple-800">{insight}</span>
              </div>
            ))}
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-2">
            {widget.data.tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-gray-600">Due in {task.due}</div>
                </div>
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        );
      
      case 'weather':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {widget.data.temperature}°F
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {widget.data.condition} in {widget.data.location}
            </div>
          </div>
        );
      
      case 'actions':
        return (
          <div className="grid grid-cols-2 gap-2">
            {widget.data.actions.map((action, index) => (
              <Button key={index} size="sm" variant="outline" className="text-xs">
                {action.label}
              </Button>
            ))}
          </div>
        );
      
      case 'forecast':
        return (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">This Month</span>
              <span className="font-bold">${(widget.data.thisMonth / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Next Month</span>
              <span className="font-bold">${(widget.data.nextMonth / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Confidence:</span>
              <Badge variant="outline">{widget.data.confidence}%</Badge>
            </div>
          </div>
        );
      
      default:
        return <div className="text-sm text-gray-600">Widget content</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Smart Dashboard
          </h2>
          <p className="text-gray-600">AI-powered adaptive dashboard with personalized insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Dashboard */}
        <div className="lg:col-span-3">
          {/* AI Recommendations Banner */}
          {aiRecommendations.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">AI Recommendations</span>
                </div>
                <div className="space-y-2">
                  {aiRecommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{rec.title}</div>
                        <div className="text-xs text-gray-600">{rec.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.confidence}% confident
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => applyAIRecommendation(rec)}
                          className="text-xs"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Widgets Grid */}
          <div 
            ref={dashboardRef}
            className="grid grid-cols-12 gap-4 auto-rows-min"
            style={{ minHeight: '600px' }}
          >
            {widgets
              .sort((a, b) => {
                if (adaptiveSettings.smartPositioning) {
                  // Sort by interaction score and priority
                  const aScore = (a.interactionScore || 0) + (a.priority === 'high' ? 20 : a.priority === 'medium' ? 10 : 0);
                  const bScore = (b.interactionScore || 0) + (b.priority === 'high' ? 20 : b.priority === 'medium' ? 10 : 0);
                  return bScore - aScore;
                }
                return 0;
              })
              .map(widget => (
                <div
                  key={widget.id}
                  className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
                  style={{
                    gridColumn: `span ${widget.position.w}`,
                    gridRow: `span ${widget.position.h}`
                  }}
                >
                  {renderWidget(widget)}
                </div>
              ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personalized Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Productivity Score</span>
                  <Badge variant="outline">
                    {personalizedInsights.productivity?.score}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-green-600 rounded-full" 
                    style={{ width: `${personalizedInsights.productivity?.score}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Best hours: {personalizedInsights.productivity?.bestHours}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">This Week</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Deals Closed:</span>
                    <span className="font-medium">{personalizedInsights.performance?.dealsThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leads Generated:</span>
                    <span className="font-medium">{personalizedInsights.performance?.leadsGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate:</span>
                    <span className="font-medium">{personalizedInsights.performance?.conversionRate}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Predictions</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-green-50 rounded text-xs">
                    <div className="font-medium">Weekly Revenue Forecast</div>
                    <div className="text-green-700">
                      ${(personalizedInsights.predictions?.weeklyRevenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <div className="font-medium">Monthly Target Progress</div>
                    <div className="text-blue-700">
                      {personalizedInsights.predictions?.monthlyTarget}% complete
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adaptive Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Adaptive Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(adaptiveSettings).map(([setting, enabled]) => (
                <div key={setting} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {setting.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setAdaptiveSettings(prev => ({ ...prev, [setting]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Behavior Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Most Viewed Widgets</h4>
                <div className="space-y-1">
                  {userBehavior.mostViewedWidgets?.map((widgetId, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      {index + 1}. {widgetId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Device Usage</h4>
                <div className="space-y-2">
                  {Object.entries(userBehavior.deviceUsage || {}).map(([device, percentage]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{device}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-1 bg-blue-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Active Hours</h4>
                <div className="text-xs text-gray-600">
                  {userBehavior.activeHours?.join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share Dashboard
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}