import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  ChevronDown, 
  Check, 
  X, 
  Search, 
  Star, 
  Heart, 
  Bookmark,
  Share,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';

/**
 * Enhanced Button Component with micro-interactions
 */
export const EnhancedButton = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  loading = false,
  icon,
  iconPosition = "left",
  ripple = true,
  glow = false,
  children,
  onClick,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70",
    glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    xl: "h-12 rounded-lg px-10 text-lg",
    icon: "h-10 w-10"
  };

  const handleClick = (e) => {
    if (ripple && !loading) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = {
        x,
        y,
        size,
        id: Date.now()
      };

      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    if (onClick && !loading) {
      onClick(e);
    }
  };

  const buttonVariant = glow ? 'glow' : variant;

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
        variants[buttonVariant],
        sizes[size],
        loading && "cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Ripple Effect */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {icon && iconPosition === "left" && !loading && icon}
        {children}
        {icon && iconPosition === "right" && !loading && icon}
      </div>
    </motion.button>
  );
});

/**
 * Enhanced Card Component with hover effects
 */
export const EnhancedCard = React.forwardRef(({
  className,
  children,
  hoverable = true,
  glowOnHover = false,
  interactive = false,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        hoverable && "transition-all duration-200",
        interactive && "cursor-pointer",
        className
      )}
      whileHover={hoverable ? {
        y: -2,
        boxShadow: glowOnHover 
          ? "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(59, 130, 246, 0.1)"
          : "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

/**
 * Enhanced Input Component with floating labels and validation states
 */
export const EnhancedInput = React.forwardRef(({
  className,
  type = "text",
  label,
  error,
  success,
  icon,
  iconPosition = "left",
  floatingLabel = false,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const getStateStyles = () => {
    if (error) return "border-destructive focus:border-destructive focus:ring-destructive/20";
    if (success) return "border-green-500 focus:border-green-500 focus:ring-green-500/20";
    return "border-input focus:border-primary focus:ring-primary/20";
  };

  return (
    <div className="relative">
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            floatingLabel && "placeholder-transparent",
            getStateStyles(),
            className
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Floating Label */}
        {floatingLabel && label && (
          <motion.label
            className={cn(
              "absolute left-3 text-sm text-muted-foreground pointer-events-none transition-all duration-200",
              (focused || hasValue) 
                ? "-top-2 text-xs bg-background px-1 text-primary" 
                : "top-1/2 transform -translate-y-1/2"
            )}
            animate={{
              y: (focused || hasValue) ? -20 : 0,
              scale: (focused || hasValue) ? 0.85 : 1,
            }}
          >
            {label}
          </motion.label>
        )}
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              error ? "text-destructive" : "text-green-600"
            )}
          >
            {error && <AlertCircle className="h-3 w-3" />}
            {success && <CheckCircle className="h-3 w-3" />}
            <span>{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/**
 * Enhanced Select Component with smooth animations
 */
export const EnhancedSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  multiple = false,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = multiple 
    ? options.filter(opt => value?.includes(opt.value))
    : options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <motion.button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <span className={cn(!selectedOption && "text-muted-foreground")}>
          {multiple && selectedOption?.length > 0
            ? `${selectedOption.length} selected`
            : selectedOption?.label || placeholder
          }
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 opacity-50" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
          >
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                      (multiple ? value?.includes(option.value) : value === option.value) && "bg-accent"
                    )}
                    onClick={() => handleSelect(option)}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{option.label}</span>
                    {(multiple ? value?.includes(option.value) : value === option.value) && (
                      <Check className="h-4 w-4" />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Enhanced Badge Component with animations
 */
export const EnhancedBadge = ({
  className,
  variant = "default",
  size = "default",
  removable = false,
  onRemove,
  icon,
  pulse = false,
  children,
  ...props
}) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border-border",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-600"
  };

  const sizes = {
    default: "text-xs px-2.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1"
  };

  return (
    <motion.div
      className={cn(
        "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1",
        variants[variant],
        sizes[size],
        pulse && "animate-pulse",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {icon && <span className="h-3 w-3">{icon}</span>}
      {children}
      {removable && (
        <motion.button
          type="button"
          className="ml-1 h-3 w-3 rounded-full hover:bg-black/20 flex items-center justify-center"
          onClick={onRemove}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-2 w-2" />
        </motion.button>
      )}
    </motion.div>
  );
};

/**
 * Enhanced Progress Component with smooth animations
 */
export const EnhancedProgress = ({
  value = 0,
  max = 100,
  className,
  showValue = false,
  animated = true,
  gradient = false,
  size = "default",
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3"
  };

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          sizes[size],
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full flex-1 transition-all",
            gradient 
              ? "bg-gradient-to-r from-primary to-primary/80" 
              : "bg-primary",
            animated && "transition-all duration-500 ease-out"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Animated shine effect */}
        {animated && (
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      
      {showValue && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Toast Component with rich interactions
 */
export const EnhancedToast = ({
  title,
  description,
  variant = "default",
  action,
  onClose,
  duration = 5000,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    default: "bg-background border",
    destructive: "bg-destructive text-destructive-foreground border-destructive",
    success: "bg-green-500 text-white border-green-500",
    warning: "bg-yellow-500 text-white border-yellow-500",
    info: "bg-blue-500 text-white border-blue-500"
  };

  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all hover:shadow-xl",
            variants[variant]
          )}
          {...props}
        >
          <div className="flex items-start space-x-3">
            {icons[variant]}
            <div className="grid gap-1">
              {title && (
                <div className="text-sm font-semibold">{title}</div>
              )}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
          </div>
          
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
          
          <motion.button
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Enhanced Switch Component with smooth animations
 */
export const EnhancedSwitch = React.forwardRef(({
  className,
  checked,
  onCheckedChange,
  size = "default",
  ...props
}, ref) => {
  const sizes = {
    sm: "h-4 w-7",
    default: "h-5 w-9",
    lg: "h-6 w-11"
  };

  const thumbSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        sizes[size],
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0",
          thumbSizes[size]
        )}
        animate={{
          x: checked ? (size === 'sm' ? 12 : size === 'lg' ? 20 : 16) : 2
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />
    </motion.button>
  );
});

EnhancedButton.displayName = "EnhancedButton";
EnhancedCard.displayName = "EnhancedCard";
EnhancedInput.displayName = "EnhancedInput";
EnhancedSwitch.displayName = "EnhancedSwitch";