
import React from "react";
import { Link, useLocation } from "react-router-dom";
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
  Package,
  FileText,
  Megaphone,
  Briefcase,
  Factory,
  ShoppingCart,
  Settings,
  User as UserIcon,
  BarChart3,
  Search as SearchIcon,
  Command
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationsCenter from "@/components/NotificationsCenter";
import CommandPalette from "@/components/CommandPalette";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: createPageUrl("Leads"),
    icon: Sparkles,
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: Building2,
  },
  {
    title: "Deals",
    url: createPageUrl("Deals"),
    icon: TrendingUp,
  },
  {
    title: "Forecasting",
    url: createPageUrl("Forecasting"),
    icon: BarChart3,
  },
  {
    title: "Products",
    url: createPageUrl("Products"),
    icon: Package,
  },
  {
    title: "Product Lines",
    url: createPageUrl("ProductLines"),
    icon: Briefcase,
  },
  {
    title: "Manufacturers",
    url: createPageUrl("Manufacturers"),
    icon: Factory,
  },
  {
    title: "Purchase Orders",
    url: createPageUrl("PurchaseOrders"),
    icon: ShoppingCart,
  },
  {
    title: "Quotes",
    url: createPageUrl("Quotes"),
    icon: FileText,
  },
  {
    title: "Campaigns",
    url: createPageUrl("Campaigns"),
    icon: Megaphone,
  },
  {
    title: "Activities",
    url: createPageUrl("Activities"),
    icon: Activity,
  },
  {
    title: "Tasks",
    url: createPageUrl("Tasks"),
    icon: CheckSquare,
  },
];

const PAGE_TITLES = {
  "Dashboard": "Dashboard",
  "Leads": "Leads",
  "Contacts": "Contacts",
  "Accounts": "Accounts",
  "Deals": "Deals Pipeline",
  "Forecasting": "Sales Forecasting",
  "Products": "Products",
  "ProductLines": "Product Lines",
  "Manufacturers": "Manufacturers",
  "PurchaseOrders": "Purchase Orders",
  "Quotes": "Quotations & RFQs",
  "Campaigns": "Campaigns",
  "Activities": "Activities",
  "Tasks": "Tasks",
  "Profile": "My Profile",
  "Settings": "Settings",
  "Reports": "Reports",
  "Integrations": "Integrations",
};

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const primaryOrg = organizations.find(org => org.id === user?.primary_organization_id) || organizations[0];

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getCurrentPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const pageName = pathSegments[pathSegments.length - 1];
    return PAGE_TITLES[pageName] || pageName;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-none shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
          <SidebarHeader className="border-b border-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg tracking-tight">SalesPro</h2>
                <p className="text-xs text-gray-400">Enterprise CRM</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">
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
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
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

          <SidebarFooter className="border-t border-white/5 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all w-full">
                  <div className="flex items-center gap-3">
                    {user?.profile_photo_url ? (
                      <img 
                        src={user.profile_photo_url} 
                        alt={user.full_name}
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
                      <p className="font-medium text-white text-sm truncate">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user?.job_title || user?.email || ''}</p>
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="w-4 h-4 mr-2" />
                  <Link to={createPageUrl("Profile")}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  <Link to={createPageUrl("Settings")}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <Link to={createPageUrl("Reports")}>Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <Settings className="w-4 h-4 mr-2 text-indigo-600" />
                  <Link to={createPageUrl("Integrations")} className="text-indigo-700 font-medium">Integrations</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors" />
                {primaryOrg?.logo_url ? (
                  <img 
                    src={primaryOrg.logo_url} 
                    alt={primaryOrg.organization_name}
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
                >
                  <SearchIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Search</span>
                  <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">⌘</span>/
                  </kbd>
                </Button>

                <NotificationsCenter />
                
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

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
