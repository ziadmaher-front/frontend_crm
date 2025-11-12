import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Pull to Refresh Component
export const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === 0 || containerRef.current?.scrollTop > 0) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
      setCanRefresh(distance > threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateY(${pullDistance}px)` }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${pullDistance}px)`
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center space-x-2 text-blue-600">
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </motion.div>
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
};

// Swipeable List Item
export const SwipeableListItem = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  leftActions = [], 
  rightActions = [],
  threshold = 100 
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedSide, setRevealedSide] = useState(null);

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const shouldReveal = Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500;

    if (shouldReveal) {
      if (offset.x > 0 && rightActions.length > 0) {
        setSwipeDistance(200);
        setIsRevealed(true);
        setRevealedSide('right');
        onSwipeRight?.();
      } else if (offset.x < 0 && leftActions.length > 0) {
        setSwipeDistance(-200);
        setIsRevealed(true);
        setRevealedSide('left');
        onSwipeLeft?.();
      } else {
        setSwipeDistance(0);
        setIsRevealed(false);
        setRevealedSide(null);
      }
    } else {
      setSwipeDistance(0);
      setIsRevealed(false);
      setRevealedSide(null);
    }
  };

  const handleActionClick = (action) => {
    action.handler();
    setSwipeDistance(0);
    setIsRevealed(false);
    setRevealedSide(null);
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Right Actions (revealed when swiping right) */}
      {rightActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          {rightActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`h-full px-4 flex items-center justify-center ${action.className || 'bg-blue-500 text-white'}`}
              initial={{ x: -100 }}
              animate={{ x: revealedSide === 'right' ? 0 : -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {action.icon && <action.icon className="w-5 h-5" />}
              {action.label && <span className="ml-2 font-medium">{action.label}</span>}
            </motion.button>
          ))}
        </div>
      )}

      {/* Left Actions (revealed when swiping left) */}
      {leftActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {leftActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`h-full px-4 flex items-center justify-center ${action.className || 'bg-red-500 text-white'}`}
              initial={{ x: 100 }}
              animate={{ x: revealedSide === 'left' ? 0 : 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {action.icon && <action.icon className="w-5 h-5" />}
              {action.label && <span className="ml-2 font-medium">{action.label}</span>}
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: leftActions.length > 0 ? -200 : 0, right: rightActions.length > 0 ? 200 : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swipeDistance }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Touch-friendly Card Component
export const TouchCard = ({ 
  children, 
  onTap, 
  onLongPress, 
  className = '',
  pressScale = 0.98,
  longPressDuration = 500 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
    }, longPressDuration);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTap = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onTap?.();
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer ${className}`}
      whileTap={{ scale: pressScale }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
      animate={{ scale: isPressed ? pressScale : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
};

// Expandable Section
export const ExpandableSection = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Touch-friendly Button
export const TouchButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Star Rating Component
export const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <motion.button
            key={star}
            onClick={() => !readonly && onRatingChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
            whileTap={readonly ? {} : { scale: 0.9 }}
            disabled={readonly}
          >
            {isFilled ? (
              <StarSolidIcon className={`${sizes[size]} text-yellow-400`} />
            ) : (
              <StarIcon className={`${sizes[size]} text-gray-300`} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Contact Card with Touch Actions
export const ContactCard = ({ contact, onCall, onEmail, onEdit, onDelete, onFavorite }) => {
  const rightActions = [
    {
      icon: PhoneIcon,
      label: 'Call',
      handler: () => onCall(contact),
      className: 'bg-green-500 text-white'
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      handler: () => onEmail(contact),
      className: 'bg-blue-500 text-white'
    }
  ];

  const leftActions = [
    {
      icon: PencilIcon,
      label: 'Edit',
      handler: () => onEdit(contact),
      className: 'bg-gray-500 text-white'
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      handler: () => onDelete(contact),
      className: 'bg-red-500 text-white'
    }
  ];

  return (
    <SwipeableListItem
      rightActions={rightActions}
      leftActions={leftActions}
    >
      <TouchCard
        onTap={() => onEdit(contact)}
        onLongPress={() => onFavorite(contact)}
        className="p-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {contact.name?.charAt(0) || 'C'}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
              {contact.isFavorite && (
                <StarSolidIcon className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{contact.email}</p>
            <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              contact.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {contact.status}
            </span>
            {contact.lastContact && (
              <span className="text-xs text-gray-400">
                {new Date(contact.lastContact).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </TouchCard>
    </SwipeableListItem>
  );
};

// Floating Action Menu
export const FloatingActionMenu = ({ actions, isOpen, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.handler}
                className={`flex items-center space-x-3 ${action.color || 'bg-blue-600'} text-white px-4 py-3 rounded-full shadow-lg`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onToggle}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {isOpen ? (
            <div className="w-6 h-0.5 bg-white" />
          ) : (
            <>
              <div className="absolute w-6 h-0.5 bg-white" />
              <div className="absolute w-0.5 h-6 bg-white" />
            </>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default {
  PullToRefresh,
  SwipeableListItem,
  TouchCard,
  ExpandableSection,
  TouchButton,
  StarRating,
  ContactCard,
  FloatingActionMenu
};