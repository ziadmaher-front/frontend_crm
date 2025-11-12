import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated Button with hover and click effects
export const AnimatedButton = ({ 
  children, 
  className, 
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.98,
        transition: { duration: 0.1 }
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <motion.span
        animate={{
          scale: isPressed ? 0.95 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

// Floating Action Button with ripple effect
export const FloatingActionButton = ({ 
  children, 
  className, 
  onClick,
  position = 'bottom-right',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const handleClick = (e) => {
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

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 h-14 w-14 flex items-center justify-center',
        positions[position],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {ripples.map(ripple => (
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
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
};

// Animated Card with hover effects
export const AnimatedCard = ({ 
  children, 
  className, 
  hoverEffect = 'lift',
  ...props 
}) => {
  const hoverEffects = {
    lift: {
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    scale: {
      scale: 1.02
    },
    glow: {
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
    },
    tilt: {
      rotateY: 5,
      rotateX: 5
    }
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      whileHover={hoverEffects[hoverEffect]}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Progress Bar with smooth animations
export const AnimatedProgressBar = ({ 
  value = 0, 
  max = 100, 
  className,
  showValue = false,
  color = 'primary',
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={cn('w-full bg-secondary rounded-full h-2', className)} {...props}>
      <motion.div
        className={cn('h-2 rounded-full', colors[color])}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {showValue && (
        <motion.span
          className="text-sm font-medium text-muted-foreground mt-1 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
};

// Animated Badge with pulse effect
export const AnimatedBadge = ({ 
  children, 
  className, 
  variant = 'default',
  pulse = false,
  ...props 
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600'
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      animate={pulse ? {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      } : {}}
      transition={pulse ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

// Loading Spinner with various animations
export const AnimatedSpinner = ({ 
  size = 'default', 
  variant = 'spin',
  className,
  ...props 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const spinVariants = {
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-primary border-t-transparent rounded-full',
        sizes[size],
        className
      )}
      animate={spinVariants[variant]}
      {...props}
    />
  );
};

// Animated Toast Notification
export const AnimatedToast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 3000,
  position = 'top-right'
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const types = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const positions = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          className={cn(
            'px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm',
            types[type],
            positions[position]
          )}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated Counter
export const AnimatedCounter = ({ 
  from = 0, 
  to, 
  duration = 2, 
  className,
  prefix = '',
  suffix = '',
  ...props 
}) => {
  const [count, setCount] = useState(from);
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;
    const controls = { value: from };
    
    const animation = {
      value: to,
      duration: duration * 1000,
      ease: 'easeOut',
      onUpdate: () => {
        setCount(Math.floor(controls.value));
      }
    };

    // Simple animation without external library
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + (to - from) * easeOut;
      
      setCount(Math.floor(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return (
    <motion.span
      ref={nodeRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// Stagger Animation Container
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Parallax Scroll Effect
export const ParallaxElement = ({ 
  children, 
  speed = 0.5, 
  className,
  ...props 
}) => {
  const ref = useRef(null);
  const y = useMotionValue(0);
  const yRange = [-200, 200];
  const pathLength = useTransform(y, yRange, [0, 1]);

  useEffect(() => {
    const updateY = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        const scrollProgress = (scrollY - elementTop + windowHeight) / (windowHeight + elementHeight);
        y.set((scrollProgress - 0.5) * speed * 200);
      }
    };

    window.addEventListener('scroll', updateY);
    updateY();
    
    return () => window.removeEventListener('scroll', updateY);
  }, [y, speed]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Ripple Effect Component
 */
export const RippleEffect = ({ children, className, disabled = false, ...props }) => {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const createRipple = (event) => {
    if (disabled) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random()
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseDown={createRipple}
      {...props}
    >
      {children}
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
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Magnetic Effect Component
 */
export const MagneticEffect = ({ children, strength = 0.3, className, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) * strength;
    const deltaY = (event.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Reveal Animation Component
 */
export const RevealAnimation = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className,
  ...props 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      scale: direction === 'scale' ? 0.8 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Hover Lift Effect Component
 */
export const HoverLift = ({ 
  children, 
  liftHeight = 8, 
  shadowIntensity = 0.15, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftHeight,
        boxShadow: `0 ${liftHeight * 2}px ${liftHeight * 4}px rgba(0,0,0,${shadowIntensity})`
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Typewriter Effect Component
 */
export const TypewriterEffect = ({ 
  text, 
  speed = 50, 
  className,
  onComplete,
  ...props 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className} {...props}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block"
      >
        |
      </motion.span>
    </span>
  );
};

/**
 * Shake Animation Component
 */
export const ShakeAnimation = ({ 
  children, 
  intensity = 5, 
  trigger = false, 
  className,
  ...props 
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -intensity, intensity, -intensity, intensity, 0],
        transition: { duration: 0.5 }
      });
    }
  }, [trigger, intensity, controls]);

  return (
    <motion.div
      className={className}
      animate={controls}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Utility hook for micro-interactions
export const useMicroInteraction = (type, options = {}) => {
  const controls = useAnimation();

  const trigger = () => {
    switch (type) {
      case 'bounce':
        controls.start({
          scale: [1, 1.2, 1],
          transition: { duration: 0.3 }
        });
        break;
      case 'shake':
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        });
        break;
      case 'pulse':
        controls.start({
          scale: [1, 1.1, 1],
          transition: { duration: 0.6, repeat: 2 }
        });
        break;
      case 'rotate':
        controls.start({
          rotate: [0, 360],
          transition: { duration: 0.5 }
        });
        break;
      default:
        break;
    }
  };

  return { controls, trigger };
};

export default {
  AnimatedButton,
  FloatingActionButton,
  AnimatedCard,
  AnimatedProgressBar,
  AnimatedBadge,
  AnimatedSpinner,
  AnimatedToast,
  AnimatedCounter,
  StaggerContainer,
  ParallaxElement,
  RippleEffect,
  MagneticEffect,
  RevealAnimation,
  HoverLift,
  TypewriterEffect,
  ShakeAnimation,
  useMicroInteraction
};