
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  Sparkles,
  CheckSquare,
  Activity,
  LogOut,
  FileText,
  Megaphone,
  ShoppingCart,
  Settings,
  User as UserIcon,
  BarChart3,
  Search as SearchIcon,
  Command,
  Bot,
  Shield,
  Eye,
  Brain,
  DollarSign,
  MessageSquare,
  UserX,
  Zap,
  BarChart,
  Smartphone,
  Lock,
  Target,
  Upload
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/ui/EnhancedNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MobileBottomNavigation, MobileHeader } from "@/components/MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { SkipToContent, FocusTrap, useKeyboardNavigation } from "@/components/AccessibilityEnhancements";
import GlobalSearch from "@/components/GlobalSearch";
import CommandPalette from "@/components/CommandPalette";
import AIAssistant from "@/components/AIAssistant";
import ImportDialog from "@/components/ImportDialog";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Sparkles,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: Building2,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: TrendingUp,
  },
  {
    title: "Forecasting",
    url: "/forecasting",
    icon: BarChart3,
  },
  {
    title: "Sales Orders",
    url: "/sales-orders",
    icon: ShoppingCart,
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: FileText,
  },
  {
    title: "Campaigns",
    url: "/campaigns",
    icon: Megaphone,
  },
  {
    title: "Activities",
    url: "/activities",
    icon: Activity,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
  },
  {
    title: "User Experience",
    url: "/user-experience",
    icon: Eye,
  },
];

const aiNavigationItems = [
  {
    title: "AI Dashboard",
    url: "/ai-dashboard",
    icon: Brain,
  },
  {
    title: "Business Intelligence",
    url: createPageUrl("BusinessIntelligenceDashboard"),
    icon: BarChart3,
  },
  {
    title: "Intelligent Dashboard",
    url: createPageUrl("IntelligentDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Advanced AI Engine",
    url: createPageUrl("AdvancedAIEngine"),
    icon: Brain,
  },
  {
    title: "Smart Mobile Experience",
    url: createPageUrl("SmartMobileExperience"),
    icon: Smartphone,
  },
  {
    title: "Integration Marketplace",
    url: createPageUrl("IntegrationMarketplace"),
    icon: Zap,
  },
  {
    title: "Revenue Optimization",
    url: createPageUrl("RevenueOptimization"),
    icon: DollarSign,
  },
  {
    title: "Sentiment Analysis",
    url: createPageUrl("SentimentAnalysis"),
    icon: Brain,
  },
  {
    title: "Dynamic Pricing",
    url: createPageUrl("DynamicPricing"),
    icon: DollarSign,
  },
  {
    title: "AI Chatbot",
    url: createPageUrl("AIChatbot"),
    icon: MessageSquare,
  },
  {
    title: "Churn Analysis",
    url: createPageUrl("PredictiveChurnAnalysis"),
    icon: UserX,
  },
  {
    title: "Integration Hub",
    url: createPageUrl("SmartIntegrationMarketplace"),
    icon: Zap,
  },
  {
    title: "Workflow Automation",
    url: createPageUrl("AdvancedWorkflowAutomation"),
    icon: Bot,
  },
  {
    title: "Smart Reports",
    url: createPageUrl("SmartReportingEngine"),
    icon: BarChart,
  },
  {
    title: "Mobile Experience",
    url: createPageUrl("MobileExperience"),
    icon: Smartphone,
  },
  {
    title: "Advanced Analytics",
    url: createPageUrl("AdvancedDataVisualization"),
    icon: BarChart3,
  },
  {
    title: "Customer Journey",
    url: createPageUrl("CustomerJourney"),
    icon: Users,
  },
  {
    title: "Sales Coaching",
    url: createPageUrl("SalesCoaching"),
    icon: Users,
  },
  {
      title: "Lead Qualification",
      url: "/LeadQualification",
      icon: Target,
    },
];

// Advanced CRM Features Navigation
const advancedCrmItems = [
  {
    title: "AI Lead Qualification",
    url: "/ai-lead-qualification",
    icon: Brain,
  },
  {
    title: "Deal Insights",
    url: "/intelligent-deal-insights",
    icon: TrendingUp,
  },
  {
    title: "AI Assistant",
    url: "/conversational-ai",
    icon: MessageSquare,
  },
  {
    title: "Real-Time BI",
    url: "/real-time-bi",
    icon: BarChart3,
  },
  {
    title: "Workflow Builder",
    url: "/workflow-automation",
    icon: Bot,
  },
  {
    title: "Mobile Features",
    url: createPageUrl("AdvancedMobile"),
    icon: Smartphone,
  },
  {
    title: "Advanced Forecasting",
    url: createPageUrl("AdvancedForecasting"),
    icon: BarChart,
  },
  {
    title: "Social Media",
    url: createPageUrl("SocialMediaIntegration"),
    icon: Megaphone,
  },
  {
    title: "Email Marketing",
    url: createPageUrl("AdvancedEmailMarketing"),
    icon: FileText,
  },
  {
    title: "Communication Hub",
    url: createPageUrl("UnifiedCommunicationHub"),
    icon: Users,
  },
];

// Security & Admin Navigation
const securityAdminItems = [
  {
    title: "Security Center",
    url: createPageUrl("SecurityCenter"),
    icon: Shield,
  },
  {
    title: "Security Dashboard",
    url: createPageUrl("SecurityDashboard"),
    icon: Shield,
  },
  {
    title: "Audit Logger",
    url: createPageUrl("AuditLogger"),
    icon: FileText,
  },
  {
    title: "GDPR Tools",
    url: createPageUrl("GDPRTools"),
    icon: Shield,
  },
  {
    title: "Field Encryption",
    url: createPageUrl("FieldEncryption"),
    icon: Shield,
  },
  {
    title: "SSO Integration",
    url: createPageUrl("SSOIntegration"),
    icon: Users,
  },
  {
    title: "Advanced MFA",
    url: createPageUrl("AdvancedMFA"),
    icon: Shield,
  },
  {
    title: "Incident Response",
    url: createPageUrl("SecurityIncidentResponse"),
    icon: Activity,
  },
  {
    title: "Vulnerability Management",
    url: createPageUrl("VulnerabilityManagement"),
    icon: Eye,
  },
  {
    title: "Data Loss Prevention",
    url: createPageUrl("DataLossPrevention"),
    icon: Lock,
  },
];

// Development & Testing Navigation
const devTestingItems = [
  {
    title: "Test Runner",
    url: createPageUrl("TestRunner"),
    icon: CheckSquare,
  },
  {
    title: "Integration Tests",
    url: createPageUrl("IntegrationTests"),
    icon: Zap,
  },
  {
    title: "System Tester",
    url: createPageUrl("SystemTester"),
    icon: Settings,
  },
  {
    title: "Performance Monitor",
    url: createPageUrl("PerformanceMonitor"),
    icon: Activity,
  },
  {
    title: "Production Readiness",
    url: createPageUrl("ProductionReadiness"),
    icon: CheckSquare,
  },
];

// Tools & Utilities Navigation
const toolsUtilitiesItems = [
  {
    title: "Accessibility Tools",
    url: createPageUrl("AccessibilityTools"),
    icon: Eye,
  },
  {
    title: "PWA Manager",
    url: createPageUrl("PWAManager"),
    icon: Smartphone,
  },
  {
    title: "Webhook Manager",
    url: createPageUrl("WebhookManager"),
    icon: Zap,
  },
  {
    title: "Realtime Sync",
    url: createPageUrl("RealtimeSync"),
    icon: Activity,
  },
  {
    title: "User Guide",
    url: createPageUrl("UserGuide"),
    icon: FileText,
  },
  {
    title: "System Documentation",
    url: createPageUrl("SystemDocumentation"),
    icon: FileText,
  },
];

const PAGE_TITLES = {
  "Dashboard": "Dashboard",
  "Leads": "Leads",
  "Contacts": "Contacts",
  "Accounts": "Accounts",
  "Deals": "Deals Pipeline",
  "Forecasting": "Sales Forecasting",
  "PurchaseOrders": "Purchase Orders",
  "Quotes": "Quotations & RFQs",
  "Campaigns": "Campaigns",
  "Activities": "Activities",
  "Tasks": "Tasks",
  "Security": "Security Center",
  "UserExperience": "User Experience",
  "SentimentAnalysis": "Sentiment Analysis",
  "DynamicPricing": "Dynamic Pricing",
  "AIChatbot": "AI Chatbot",
  "PredictiveChurnAnalysis": "Churn Analysis",
  "SmartIntegrationMarketplace": "Integration Hub",
  "AdvancedWorkflowAutomation": "Workflow Automation",
  "SmartReportingEngine": "Smart Reports",
  "MobileExperience": "Mobile Experience",
  "AdvancedDataVisualization": "Advanced Analytics",
  "CustomerJourney": "Customer Journey Dashboard",
  "SalesCoaching": "Sales Coaching Dashboard",
  "LeadQualification": "Predictive Lead Qualification Dashboard",
  // Advanced CRM Features
  "AILeadQualification": "AI Lead Qualification",
  "IntelligentDealInsights": "Intelligent Deal Insights",
  "ConversationalAI": "Conversational AI Assistant",
  "RealTimeBI": "Real-Time Business Intelligence",
  "WorkflowAutomation": "Enhanced Workflow Automation",
  "AdvancedMobile": "Advanced Mobile Features",
  "AdvancedForecasting": "Advanced Forecasting",
  "SocialMediaIntegration": "Social Media Integration",
  "AdvancedEmailMarketing": "Advanced Email Marketing",
  "UnifiedCommunicationHub": "Unified Communication Hub",
  "Profile": "My Profile",
  "Settings": "Settings",
  "Reports": "Reports",
  "Integrations": "Integrations",
  // Security & Admin
  "SecurityCenter": "Security Center",
        "SecurityDashboard": "Security Dashboard",
        "AuditLogger": "Audit Logger",
        "GDPRTools": "GDPR Tools",
        "FieldEncryption": "Field Encryption",
        "SSOIntegration": "SSO Integration",
        "AdvancedMFA": "Advanced Multi-Factor Authentication",
        "SecurityIncidentResponse": "Security Incident Response",
        "VulnerabilityManagement": "Vulnerability Management",
        "DataLossPrevention": "Data Loss Prevention",
  // Development & Testing
  "TestRunner": "Test Runner",
  "IntegrationTests": "Integration Tests",
  "SystemTester": "System Tester",
  "PerformanceMonitor": "Performance Monitor",
  "ProductionReadiness": "Production Readiness",
  // Tools & Utilities
  "AccessibilityTools": "Accessibility Tools",
  "PWAManager": "PWA Manager",
  "WebhookManager": "Webhook Manager",
  "RealtimeSync": "Realtime Sync",
  "UserGuide": "User Guide",
  "SystemDocumentation": "System Documentation",
};

export default function Layout({ children }) {
  const location = useLocation();
  const { isDark } = useTheme();
  const [user, setUser] = React.useState(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Initialize keyboard navigation
  useKeyboardNavigation();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      
      // Cmd+/ or Ctrl+/ for search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCommandOpen(false);
        setAiAssistantOpen(false);
      }
      
      // Cmd+Shift+A or Ctrl+Shift+A for AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAiAssistantOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const primaryOrg = organizations.find(org => org.id === user?.primary_organization_id) || organizations[0];

  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      // Clear auth state (this also clears localStorage token)
      logout();
      // Navigate to login
      navigate('/auth/login', { replace: true });
      // Force page reload to clear all state and cached data
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear everything and redirect
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
  };

  const getCurrentPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const pageName = pathSegments[pathSegments.length - 1];
    return PAGE_TITLES[pageName] || pageName;
  };

  return (
    <>
      <SkipToContent />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          {/* Desktop Sidebar */}
          <Sidebar className={`border-none shadow-2xl ${isDark ? 'bg-black text-white' : 'bg-white text-black'} ${isMobile ? 'hidden' : ''}`}>
            <SidebarHeader className={`border-b ${isDark ? 'border-white/5' : 'border-gray-200'} p-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>SalesPro</h2>
                  <p className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Enterprise CRM</p>
                </div>
              </div>
            </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                AI Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {aiNavigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Advanced CRM
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {advancedCrmItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Security & Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {securityAdminItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30 shadow-lg shadow-red-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Development & Testing
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {devTestingItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wider px-3 py-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Tools & Utilities
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {toolsUtilitiesItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-xl ${
                            isActive 
                              ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white border border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
                              : isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-black hover:bg-black/10 hover:text-black'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-label={`Navigate to ${item.title}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-yellow-400' : isDark ? 'text-white' : 'text-black'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} p-4`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`flex items-center justify-between rounded-xl p-3 transition-all w-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                  aria-label="User menu"
                  aria-expanded="false"
                >
                  <div className="flex items-center gap-3">
                    {user?.profile_photo_url ? (
                      <img 
                        src={user.profile_photo_url} 
                        alt={`${user.full_name} profile photo`}
                        className="w-9 h-9 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {user?.full_name?.[0] || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>
                        {user?.full_name || 'User'}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{user?.job_title || user?.email || ''}</p>
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`w-56 ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`} align="end">
                <DropdownMenuLabel className={isDark ? 'text-white' : 'text-black'}>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                <DropdownMenuItem className={isDark ? 'text-white hover:bg-white/10 focus:bg-white/10' : 'text-black hover:bg-black/10 focus:bg-black/10'}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  <Link to="/profile" className={isDark ? 'text-white' : 'text-black'}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className={isDark ? 'text-white hover:bg-white/10 focus:bg-white/10' : 'text-black hover:bg-black/10 focus:bg-black/10'}>
                  <Settings className="w-4 h-4 mr-2" />
                  <Link to="/settings" className={isDark ? 'text-white' : 'text-black'}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className={isDark ? 'text-white hover:bg-white/10 focus:bg-white/10' : 'text-black hover:bg-black/10 focus:bg-black/10'}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <Link to="/reports" className={isDark ? 'text-white' : 'text-black'}>Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                <DropdownMenuItem onClick={handleLogout} className={isDark ? 'text-red-400 hover:bg-red-500/20 focus:bg-red-500/20' : 'text-red-600 hover:bg-red-50 focus:bg-red-50'}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden" id="main-content" role="main">
          {/* Mobile Header */}
          {isMobile ? (
            <MobileHeader
              title={getCurrentPageTitle()}
              user={user}
              primaryOrg={primaryOrg}
              onSearchOpen={() => setSearchOpen(true)}
              onCommandOpen={() => setCommandOpen(true)}
            />
          ) : (
            /* Desktop Header */
            <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm" role="banner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger 
                  className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors" 
                  aria-label="Toggle sidebar"
                />
                {primaryOrg?.logo_url ? (
                  <img 
                    src={primaryOrg.logo_url} 
                    alt={`${primaryOrg.organization_name} logo`}
                    className="h-10 object-contain"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    {getCurrentPageTitle()}
                  </h1>
                  {primaryOrg && (
                    <p className="text-xs text-gray-500">{primaryOrg.organization_name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandOpen(true)}
                  className="gap-2 hidden md:flex"
                  aria-label="Open quick actions (Cmd+K)"
                >
                  <Command className="w-4 h-4" />
                  <span>Quick Actions</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="gap-2"
                  aria-label="Open search (Cmd+/)"
                >
                  <SearchIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Search</span>
                  <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘</span>/
                  </kbd>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiAssistantOpen(true)}
                  className="gap-2"
                  aria-label="Open AI Assistant (Cmd+Shift+A)"
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden md:inline">AI Assistant</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘⇧</span>A
                  </kbd>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  className="gap-2"
                  aria-label="Import data from Excel"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden md:inline">Import</span>
                </Button>

                <ThemeToggle />
                
                {user?.profile_photo_url ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold">
                      {user?.full_name?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.job_title || user?.user_role}</p>
                </div>
              </div>
              </div>
            </header>
          )}

          <div className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </div>
        </main>

        {/* Notifications Icon - Fixed at bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <NotificationCenter />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNavigation
            onSearchOpen={() => setSearchOpen(true)}
            onCommandOpen={() => setCommandOpen(true)}
          />
        )}
      </div>

      <FocusTrap active={searchOpen}>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </FocusTrap>
      
      <FocusTrap active={commandOpen}>
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </FocusTrap>
      
      <AIAssistant 
        isOpen={aiAssistantOpen} 
        onToggle={() => setAiAssistantOpen(!aiAssistantOpen)} 
      />
      
      <ImportDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen} 
      />
    </SidebarProvider>
    </>
  );
}