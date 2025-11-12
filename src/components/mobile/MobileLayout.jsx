import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const MobileLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Leads', href: '/leads', icon: UserGroupIcon },
    { name: 'Deals', href: '/deals', icon: BriefcaseIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Quick actions
  const quickActions = [
    { name: 'New Lead', action: () => navigate('/leads/new'), icon: UserGroupIcon, color: 'bg-blue-500' },
    { name: 'New Deal', action: () => navigate('/deals/new'), icon: BriefcaseIcon, color: 'bg-green-500' },
    { name: 'Add Contact', action: () => navigate('/contacts/new'), icon: UserGroupIcon, color: 'bg-purple-500' },
    { name: 'Schedule Call', action: () => navigate('/activities/new'), icon: HomeIcon, color: 'bg-orange-500' },
  ];

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 10);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Handle touch gestures for navigation
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartY.current || !touchStartX.current) return;

    const touchEndY = e.touches[0].clientY;
    const touchEndX = e.touches[0].clientX;
    const deltaY = touchStartY.current - touchEndY;
    const deltaX = touchStartX.current - touchEndX;

    // Swipe right to open sidebar (from left edge)
    if (deltaX < -50 && Math.abs(deltaY) < 100 && touchStartX.current < 50) {
      setSidebarOpen(true);
    }

    // Swipe left to close sidebar
    if (deltaX > 50 && Math.abs(deltaY) < 100 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = 0;
    touchStartX.current = 0;
  };

  // Handle pan gesture for sidebar
  const handlePan = (event, info) => {
    if (info.offset.x > 100) {
      setSidebarOpen(true);
    } else if (info.offset.x < -100) {
      setSidebarOpen(false);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const quickActionsVariants = {
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1
      }
    },
    closed: {
      scale: 0,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  const actionItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    closed: {
      y: 20,
      opacity: 0
    }
  };

  return (
    <div 
      className="flex h-screen bg-gray-50 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 lg:hidden"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              drag="x"
              dragConstraints={{ left: -300, right: 0 }}
              onDragEnd={handlePan}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SP</span>
                    </div>
                    <span className="font-semibold text-gray-900">Sales Pro</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                      <motion.button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.header
          className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-shadow ${
            isScrolled ? 'shadow-sm' : ''
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {navigationItems.find(item => location.pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              whileTap={{ scale: 0.95 }}
            >
              <BellIcon className="w-5 h-5 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* Content Area */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="p-4 pb-20">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <AnimatePresence>
          {quickActionsOpen && (
            <motion.div
              className="absolute bottom-16 right-0 space-y-3"
              variants={quickActionsVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.name}
                  onClick={() => {
                    action.action();
                    setQuickActionsOpen(false);
                  }}
                  className={`flex items-center space-x-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg`}
                  variants={actionItemVariants}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium whitespace-nowrap">{action.name}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: quickActionsOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <PlusIcon className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads, deals, contacts..."
                    className="flex-1 border-none outline-none text-gray-900 placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Recent Searches</p>
                  <div className="space-y-1">
                    {['John Doe', 'Acme Corp Deal', 'Q4 Pipeline'].map((search) => (
                      <button
                        key={search}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLayout;