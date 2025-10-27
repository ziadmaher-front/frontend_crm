import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Leads from "./Leads";

import Contacts from "./Contacts";

import Accounts from "./Accounts";

import Deals from "./Deals";

import Activities from "./Activities";

import Tasks from "./Tasks";

import Products from "./Products";

import Quotes from "./Quotes";

import Campaigns from "./Campaigns";

import EmailTemplates from "./EmailTemplates";

import Reports from "./Reports";

import ProductLines from "./ProductLines";

import PurchaseOrders from "./PurchaseOrders";

import Manufacturers from "./Manufacturers";

import Profile from "./Profile";

import Settings from "./Settings";

import Approvals from "./Approvals";

import Documents from "./Documents";

import Forecasting from "./Forecasting";

import LeadDetails from "./LeadDetails";

import ContactDetails from "./ContactDetails";

import AccountDetails from "./AccountDetails";

import Integrations from "./Integrations";

import DealsKanban from "./DealsKanban";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
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
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
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
                
            </Routes>
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