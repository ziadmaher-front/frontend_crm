import { lazy, Suspense } from 'react';
import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard";

// Lazy load all major components for code splitting
const Leads = lazy(() => import("./Leads"));
const Contacts = lazy(() => import("./Contacts"));
const Accounts = lazy(() => import("./Accounts"));
const Deals = lazy(() => import("./Deals"));
const Activities = lazy(() => import("./Activities"));
const Tasks = lazy(() => import("./Tasks"));
const Products = lazy(() => import("./Products"));
const Quotes = lazy(() => import("./Quotes"));
const Campaigns = lazy(() => import("./Campaigns"));
const EmailTemplates = lazy(() => import("./EmailTemplates"));
const Reports = lazy(() => import("./Reports"));
const ProductLines = lazy(() => import("./ProductLines"));
const PurchaseOrders = lazy(() => import("./PurchaseOrders"));
const Manufacturers = lazy(() => import("./Manufacturers"));
const Profile = lazy(() => import("./Profile"));
const Settings = lazy(() => import("./Settings"));
const Approvals = lazy(() => import("./Approvals"));
const Documents = lazy(() => import("./Documents"));
const Forecasting = lazy(() => import("./Forecasting"));
const LeadDetails = lazy(() => import("./LeadDetails"));
const ContactDetails = lazy(() => import("./ContactDetails"));
const AccountDetails = lazy(() => import("./AccountDetails"));
const Integrations = lazy(() => import("./Integrations"));
const DealsKanban = lazy(() => import("./DealsKanban"));
const Security = lazy(() => import("./Security"));
const UserExperience = lazy(() => import("./UserExperience"));
const SentimentAnalysis = lazy(() => import("./SentimentAnalysis"));
const DynamicPricing = lazy(() => import("./DynamicPricing"));
const AIChatbot = lazy(() => import("./AIChatbot"));
const PredictiveChurnAnalysis = lazy(() => import("./PredictiveChurnAnalysis"));
const SmartIntegrationMarketplace = lazy(() => import("./SmartIntegrationMarketplace"));
const AdvancedWorkflowAutomation = lazy(() => import("./AdvancedWorkflowAutomation"));
const SmartReportingEngine = lazy(() => import("./SmartReportingEngine"));
const MobileExperience = lazy(() => import("./MobileExperience"));
const AdvancedDataVisualization = lazy(() => import("../components/AdvancedDataVisualization"));

// Revenue Optimization
const RevenueOptimization = lazy(() => import('../components/RevenueOptimizationDashboard'));
const CustomerJourney = lazy(() => import('../components/CustomerJourneyDashboard'));
const SalesCoaching = lazy(() => import('../components/SalesCoachingDashboard'));
const LeadQualification = lazy(() => import('../components/PredictiveLeadQualificationDashboard'));

// Advanced CRM Features
const AILeadQualification = lazy(() => import("./AILeadQualification"));
const IntelligentDealInsights = lazy(() => import("./IntelligentDealInsights"));
const AIPerformanceDashboard = lazy(() => import("./AIPerformanceDashboard"));
const EnhancedAIDashboard = lazy(() => import("./EnhancedAIDashboard"));
const AISystemMonitor = lazy(() => import("../components/AISystemMonitor"));

// New Innovative Components
const IntelligentDashboard = lazy(() => import("../components/dashboard/IntelligentDashboard"));
const AdvancedAIEngine = lazy(() => import("../components/ai/AdvancedAIEngine"));
const SmartMobileExperience = lazy(() => import("../components/mobile/SmartMobileExperience"));
const IntegrationMarketplace = lazy(() => import("../components/integrations/IntegrationMarketplace"));
const BusinessIntelligenceDashboard = lazy(() => import("../components/dashboard/BusinessIntelligenceDashboard"));
const ConversationalAI = lazy(() => import("./ConversationalAI"));
const RealTimeBI = lazy(() => import("./RealTimeBI"));
const WorkflowAutomation = lazy(() => import("./WorkflowAutomation"));
const AdvancedMobile = lazy(() => import("./AdvancedMobile"));
const AdvancedForecasting = lazy(() => import("./AdvancedForecasting"));
const SocialMediaIntegration = lazy(() => import("./SocialMediaIntegration"));
const AdvancedEmailMarketing = lazy(() => import("./AdvancedEmailMarketing"));
const UnifiedCommunicationHub = lazy(() => import("./UnifiedCommunicationHub"));

// Security Components
const SecurityDashboard = lazy(() => import("../components/security/SecurityDashboard"));
const SecurityCenter = lazy(() => import("../components/security/SecurityCenter"));
const AuditLogger = lazy(() => import("../components/security/AuditLogger"));
const GDPRTools = lazy(() => import("../components/security/GDPRTools"));
const FieldEncryption = lazy(() => import("../components/security/FieldEncryption"));
const SSOIntegration = lazy(() => import("../components/security/SSOIntegration"));
const AdvancedMFA = lazy(() => import("../components/security/AdvancedMFA"));
const SecurityIncidentResponse = lazy(() => import("../components/security/SecurityIncidentResponse"));
const VulnerabilityManagement = lazy(() => import("../components/security/VulnerabilityManagement"));
const DataLossPrevention = lazy(() => import("../components/security/DataLossPrevention"));

// Testing Components
const TestRunner = lazy(() => import("../components/testing/TestRunner"));
const IntegrationTests = lazy(() => import("../components/testing/IntegrationTests"));
const SystemTester = lazy(() => import("../components/testing/SystemTester"));

// Accessibility Components
const AccessibilityTools = lazy(() => import("../components/accessibility/AccessibilityTools"));

// Mobile/PWA Components
const PWAManager = lazy(() => import("../components/mobile/PWAManager"));

// Monitoring Components
const PerformanceMonitor = lazy(() => import("../components/monitoring/PerformanceMonitor"));

// Documentation Components
const UserGuide = lazy(() => import("../components/documentation/UserGuide"));
const SystemDocumentation = lazy(() => import("../components/documentation/SystemDocumentation"));

// API Components
const WebhookManager = lazy(() => import("../api/webhooks/WebhookManager"));
const RealtimeSync = lazy(() => import("../api/realtime/RealtimeSync"));

// Deployment Components
const ProductionReadiness = lazy(() => import("../components/deployment/ProductionReadiness"));

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    // New Innovative Features
    IntelligentDashboard: IntelligentDashboard,
    AdvancedAIEngine: AdvancedAIEngine,
    SmartMobileExperience: SmartMobileExperience,
    IntegrationMarketplace: IntegrationMarketplace,
    BusinessIntelligenceDashboard: BusinessIntelligenceDashboard,
    
    Leads: Leads,
    
    Contacts: Contacts,
    
    Accounts: Accounts,
    
    Deals: Deals,
    
    Activities: Activities,
    
    Tasks: Tasks,
    
    Products: Products,
    
    Quotes: Quotes,
    
    Campaigns: Campaigns,
    
    EmailTemplates: EmailTemplates,
    
    Reports: Reports,
    
    ProductLines: ProductLines,
    
    PurchaseOrders: PurchaseOrders,
    
    Manufacturers: Manufacturers,
    
    Profile: Profile,
    
    Settings: Settings,
    
    Approvals: Approvals,
    
    Documents: Documents,
    
    Forecasting: Forecasting,
    
    LeadDetails: LeadDetails,
    
    ContactDetails: ContactDetails,
    
    AccountDetails: AccountDetails,
    
    Integrations: Integrations,
    
    DealsKanban: DealsKanban,
    
    Security: Security,
    
    UserExperience: UserExperience,
    
    SentimentAnalysis: SentimentAnalysis,
    
    DynamicPricing: DynamicPricing,
    
    AIChatbot: AIChatbot,
    
    PredictiveChurnAnalysis: PredictiveChurnAnalysis,
    
    SmartIntegrationMarketplace: SmartIntegrationMarketplace,
    
    AdvancedWorkflowAutomation: AdvancedWorkflowAutomation,
    
    SmartReportingEngine: SmartReportingEngine,
    
    MobileExperience: MobileExperience,
    
    AdvancedDataVisualization: AdvancedDataVisualization,
    
    // Advanced CRM Features
    AILeadQualification: AILeadQualification,
    
    IntelligentDealInsights: IntelligentDealInsights,
    
    AIPerformanceDashboard: AIPerformanceDashboard,
    
    EnhancedAIDashboard: EnhancedAIDashboard,
    
    AISystemMonitor: AISystemMonitor,
    
    ConversationalAI: ConversationalAI,
    
    RealTimeBI: RealTimeBI,
    
    WorkflowAutomation: WorkflowAutomation,
    
    AdvancedMobile: AdvancedMobile,
    
    AdvancedForecasting: AdvancedForecasting,
    
    SocialMediaIntegration: SocialMediaIntegration,
    
    AdvancedEmailMarketing: AdvancedEmailMarketing,
    
    UnifiedCommunicationHub: UnifiedCommunicationHub,
    
    // Security Components
    SecurityDashboard: SecurityDashboard,
    SecurityCenter: SecurityCenter,
    AuditLogger: AuditLogger,
    GDPRTools: GDPRTools,
    FieldEncryption: FieldEncryption,
    SSOIntegration: SSOIntegration,
    AdvancedMFA: AdvancedMFA,
    SecurityIncidentResponse: SecurityIncidentResponse,
    VulnerabilityManagement: VulnerabilityManagement,
    DataLossPrevention: DataLossPrevention,
    
    // Testing Components
    TestRunner: TestRunner,
    IntegrationTests: IntegrationTests,
    SystemTester: SystemTester,
    
    // Accessibility Components
    AccessibilityTools: AccessibilityTools,
    
    // Mobile/PWA Components
    PWAManager: PWAManager,
    
    // Monitoring Components
    PerformanceMonitor: PerformanceMonitor,
    
    // Documentation Components
    UserGuide: UserGuide,
    SystemDocumentation: SystemDocumentation,
    
    // API Components
    WebhookManager: WebhookManager,
    RealtimeSync: RealtimeSync,
    
    // Deployment Components
    ProductionReadiness: ProductionReadiness,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            }>
                <Routes>            
                    
                        <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/Dashboard" element={<Dashboard />} />
                    
                    <Route path="/Leads" element={<Leads />} />
                    
                    <Route path="/Contacts" element={<Contacts />} />
                    
                    <Route path="/Accounts" element={<Accounts />} />
                    
                    <Route path="/Deals" element={<Deals />} />
                    
                    <Route path="/Activities" element={<Activities />} />
                    
                    <Route path="/Tasks" element={<Tasks />} />
                    
                    <Route path="/Products" element={<Products />} />
                    
                    <Route path="/Quotes" element={<Quotes />} />
                    
                    <Route path="/Campaigns" element={<Campaigns />} />
                    
                    <Route path="/EmailTemplates" element={<EmailTemplates />} />
                    
                    <Route path="/Reports" element={<Reports />} />
                    
                    <Route path="/ProductLines" element={<ProductLines />} />
                    
                    <Route path="/PurchaseOrders" element={<PurchaseOrders />} />
                    
                    <Route path="/Manufacturers" element={<Manufacturers />} />
                    
                    <Route path="/Profile" element={<Profile />} />
                    
                    <Route path="/Settings" element={<Settings />} />
                    
                    <Route path="/Approvals" element={<Approvals />} />
                    
                    <Route path="/Documents" element={<Documents />} />
                    
                    <Route path="/Forecasting" element={<Forecasting />} />
                    
                    <Route path="/LeadDetails" element={<LeadDetails />} />
                    
                    <Route path="/ContactDetails" element={<ContactDetails />} />
                    
                    <Route path="/AccountDetails" element={<AccountDetails />} />
                    
                    <Route path="/Integrations" element={<Integrations />} />
                    
                    <Route path="/DealsKanban" element={<DealsKanban />} />
                    
                    <Route path="/Security" element={<Security />} />
                    
                    <Route path="/UserExperience" element={<UserExperience />} />
                    
                    <Route path="/SentimentAnalysis" element={<SentimentAnalysis />} />
                    
                    <Route path="/DynamicPricing" element={<DynamicPricing />} />
                    
                    <Route path="/AIChatbot" element={<AIChatbot />} />
                    
                    <Route path="/PredictiveChurnAnalysis" element={<PredictiveChurnAnalysis />} />
                    
                    <Route path="/SmartIntegrationMarketplace" element={<SmartIntegrationMarketplace />} />
                    
                    <Route path="/AdvancedWorkflowAutomation" element={<AdvancedWorkflowAutomation />} />
                    
                    <Route path="/SmartReportingEngine" element={<SmartReportingEngine />} />
                    
                    <Route path="/MobileExperience" element={<MobileExperience />} />
                    
                    <Route path="/AdvancedDataVisualization" element={<AdvancedDataVisualization />} />
                    
                    <Route path="/RevenueOptimization" element={<RevenueOptimization />} />
                    <Route path="/CustomerJourney" element={<CustomerJourney />} />
                    <Route path="/SalesCoaching" element={<SalesCoaching />} />
                    <Route path="/LeadQualification" element={<LeadQualification />} />
                    
                    {/* Advanced CRM Features */}
                    <Route path="/AILeadQualification" element={<AILeadQualification />} />
                    
                    <Route path="/IntelligentDealInsights" element={<IntelligentDealInsights />} />
                    
                    <Route path="/ConversationalAI" element={<ConversationalAI />} />
                    
                    <Route path="/RealTimeBI" element={<RealTimeBI />} />
                    
                    <Route path="/WorkflowAutomation" element={<WorkflowAutomation />} />
                    
                    <Route path="/AdvancedMobile" element={<AdvancedMobile />} />
                    
                    <Route path="/AdvancedForecasting" element={<AdvancedForecasting />} />
                    
                    <Route path="/SocialMediaIntegration" element={<SocialMediaIntegration />} />
                    
                    <Route path="/AdvancedEmailMarketing" element={<AdvancedEmailMarketing />} />
                    
                    <Route path="/UnifiedCommunicationHub" element={<UnifiedCommunicationHub />} />
                    
                    {/* Security Components */}
                    <Route path="/SecurityDashboard" element={<SecurityDashboard />} />
                    <Route path="/SecurityCenter" element={<SecurityCenter />} />
                    <Route path="/AuditLogger" element={<AuditLogger />} />
                    <Route path="/GDPRTools" element={<GDPRTools />} />
                    <Route path="/FieldEncryption" element={<FieldEncryption />} />
                    <Route path="/SSOIntegration" element={<SSOIntegration />} />
                    <Route path="/AdvancedMFA" element={<AdvancedMFA />} />
                    <Route path="/SecurityIncidentResponse" element={<SecurityIncidentResponse />} />
                    <Route path="/VulnerabilityManagement" element={<VulnerabilityManagement />} />
                    <Route path="/DataLossPrevention" element={<DataLossPrevention />} />
                    
                    {/* Testing Components */}
                    <Route path="/TestRunner" element={<TestRunner />} />
                    <Route path="/IntegrationTests" element={<IntegrationTests />} />
                    <Route path="/SystemTester" element={<SystemTester />} />
                    
                    {/* Accessibility Components */}
                    <Route path="/AccessibilityTools" element={<AccessibilityTools />} />
                    
                    {/* Mobile/PWA Components */}
                    <Route path="/PWAManager" element={<PWAManager />} />
                    
                    {/* Monitoring Components */}
                    <Route path="/PerformanceMonitor" element={<PerformanceMonitor />} />
                    
                    {/* Documentation Components */}
                    <Route path="/UserGuide" element={<UserGuide />} />
                    <Route path="/SystemDocumentation" element={<SystemDocumentation />} />
                    
                    {/* API Components */}
                    <Route path="/WebhookManager" element={<WebhookManager />} />
                    <Route path="/RealtimeSync" element={<RealtimeSync />} />
                    
                    {/* Deployment Components */}
                    <Route path="/ProductionReadiness" element={<ProductionReadiness />} />
                    
                    {/* New Innovative Components */}
                    <Route path="/IntelligentDashboard" element={<IntelligentDashboard />} />
                    <Route path="/AdvancedAIEngine" element={<AdvancedAIEngine />} />
                    <Route path="/SmartMobileExperience" element={<SmartMobileExperience />} />
                    <Route path="/IntegrationMarketplace" element={<IntegrationMarketplace />} />
                    <Route path="/AIPerformanceDashboard" element={<AIPerformanceDashboard />} />
                    <Route path="/EnhancedAIDashboard" element={<EnhancedAIDashboard />} />
                    <Route path="/AISystemMonitor" element={<AISystemMonitor />} />
                    
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}