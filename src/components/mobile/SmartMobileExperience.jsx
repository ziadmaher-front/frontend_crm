import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Share, 
  Bell,
  Search,
  Filter,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Zap,
  RefreshCw
} from "lucide-react";
import { cn } from '@/lib/utils';

// Touch Gesture Hook
const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    if (offset > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  return { x, opacity, handleDragEnd };
};

// Swipeable Card Component
const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, className }) => {
  const { x, opacity, handleDragEnd } = useSwipeGesture(onSwipeLeft, onSwipeRight);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, opacity }}
      onDragEnd={handleDragEnd}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      whileDrag={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile Navigation
const MobileNavigation = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'deals', label: 'Deals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: Calendar },
    { id: 'more', label: 'More', icon: Menu }
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                activeTab === item.id 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide-out Menu */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="space-y-4">
            {[
              'Profile', 'Settings', 'Analytics', 'Reports', 
              'Integrations', 'Help', 'Feedback'
            ].map((item) => (
              <button
                key={item}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Mobile Lead Card
const MobileLeadCard = ({ lead, onSwipeLeft, onSwipeRight }) => {
  return (
    <SwipeableCard
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      className="mb-4"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{lead.name}</h3>
              <p className="text-sm text-gray-600">{lead.company}</p>
            </div>
            <Badge 
              variant={lead.priority === 'high' ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {lead.priority}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {lead.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              ${lead.value?.toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </SwipeableCard>
  );
};

// Pull to Refresh Component
const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 100], [0, 1]);

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > 100 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setIsPulling(false);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      style={{ y }}
      onDrag={(event, info) => {
        setIsPulling(info.offset.y > 0);
      }}
      onDragEnd={handleDragEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: pullProgress }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4 bg-blue-50"
      >
        <motion.div
          animate={{ rotate: refreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
        >
          <RefreshCw className="w-6 h-6 text-blue-600" />
        </motion.div>
      </motion.div>
      
      {children}
    </motion.div>
  );
};

// Offline Status Indicator
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm z-50"
    >
      <WifiOff className="w-4 h-4 inline mr-2" />
      You're offline. Some features may be limited.
    </motion.div>
  );
};

// Quick Actions Floating Button
const QuickActionsFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Plus, label: 'Add Lead', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Schedule', color: 'bg-green-500' },
    { icon: MessageCircle, label: 'Message', color: 'bg-purple-500' },
    { icon: Phone, label: 'Call', color: 'bg-orange-500' }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg",
                  action.color
                )}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
};

// Mobile Dashboard Stats
const MobileDashboardStats = () => {
  const stats = [
    { label: 'Revenue', value: '$2.4M', change: '+12%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Leads', value: '1,247', change: '+8%', icon: Users, color: 'bg-blue-500' },
    { label: 'Deals', value: '89', change: '+15%', icon: Target, color: 'bg-purple-500' },
    { label: 'Tasks', value: '23', change: '-5%', icon: Calendar, color: 'bg-orange-500' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-lg text-white", stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export const SmartMobileExperience = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [leads] = useState([
    {
      id: 1,
      name: 'John Smith',
      company: 'TechCorp Inc.',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      value: 50000,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Innovation Labs',
      email: 'sarah@innovationlabs.com',
      phone: '+1 (555) 987-6543',
      value: 75000,
      priority: 'medium'
    }
  ]);

  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSwipeLeft = (leadId) => {
    console.log('Archive lead:', leadId);
  };

  const handleSwipeRight = (leadId) => {
    console.log('Mark as favorite:', leadId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <OfflineIndicator />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">CRM Mobile</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Search className="w-5 h-5" />
            </Button>
            <Button size="sm" variant="ghost">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <PullToRefresh onRefresh={handleRefresh}>
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <MobileDashboardStats />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'New lead: TechCorp Solutions',
                    'Deal closed: $50,000',
                    'Meeting scheduled with John Doe',
                    'Email campaign sent to 500 contacts'
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{activity}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Leads</h2>
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Swipe left to archive, right to favorite
              </div>
              
              {leads.map((lead) => (
                <MobileLeadCard
                  key={lead.id}
                  lead={lead}
                  onSwipeLeft={() => handleSwipeLeft(lead.id)}
                  onSwipeRight={() => handleSwipeRight(lead.id)}
                />
              ))}
            </motion.div>
          )}
        </PullToRefresh>
      </div>

      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={menuOpen}
        setIsOpen={setMenuOpen}
      />
      
      <QuickActionsFAB />
    </div>
  );
};

export default SmartMobileExperience;