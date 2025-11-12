import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Animation Variants Library
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  
  scaleInCenter: {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 }
  },
  
  // Slide animations
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' }
  },
  
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' }
  },
  
  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' }
  },
  
  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' }
  },
  
  // Rotation animations
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 }
  },
  
  // Bounce animations
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  },
  
  // Flip animations
  flipInX: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 }
  },
  
  flipInY: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 }
  }
};

// Transition presets
export const transitionPresets = {
  smooth: { duration: 0.3, ease: "easeInOut" },
  snappy: { duration: 0.2, ease: "easeOut" },
  bouncy: { type: "spring", damping: 15, stiffness: 300 },
  gentle: { duration: 0.5, ease: "easeInOut" },
  quick: { duration: 0.15, ease: "easeOut" },
  slow: { duration: 0.8, ease: "easeInOut" }
};

// Advanced Animation Components

// Reveal on Scroll Component
export const RevealOnScroll = ({ 
  children, 
  variant = 'fadeInUp', 
  threshold = 0.1, 
  triggerOnce = true,
  className,
  ...props 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold, triggerOnce });
  
  return (
    <motion.div
      ref={ref}
      initial={animationVariants[variant].initial}
      animate={isInView ? animationVariants[variant].animate : animationVariants[variant].initial}
      transition={transitionPresets.smooth}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Staggered List Animation
export const StaggeredList = ({ 
  children, 
  staggerDelay = 0.1, 
  variant = 'fadeInUp',
  className 
}) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={animationVariants[variant]}
          transition={transitionPresets.smooth}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Morphing Shape Component
export const MorphingShape = ({ 
  shapes = ['circle', 'square', 'triangle'], 
  interval = 2000,
  className 
}) => {
  const [currentShape, setCurrentShape] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentShape((prev) => (prev + 1) % shapes.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [shapes.length, interval]);
  
  const shapeVariants = {
    circle: { borderRadius: '50%' },
    square: { borderRadius: '0%' },
    triangle: { borderRadius: '0% 0% 50% 50%' }
  };
  
  return (
    <motion.div
      animate={shapeVariants[shapes[currentShape]]}
      transition={transitionPresets.smooth}
      className={cn("w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500", className)}
    />
  );
};

// Floating Element Component
export const FloatingElement = ({ 
  children, 
  intensity = 10, 
  duration = 3,
  className 
}) => {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        x: [-intensity/2, intensity/2, -intensity/2]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Magnetic Button Component
export const MagneticButton = ({ 
  children, 
  magneticStrength = 0.3,
  className,
  ...props 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * magneticStrength,
      y: (e.clientY - centerY) * magneticStrength
    });
  };
  
  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        x: isHovered ? mousePosition.x : 0,
        y: isHovered ? mousePosition.y : 0,
        scale: isHovered ? 1.05 : 1
      }}
      transition={transitionPresets.snappy}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Particle System Component
export const ParticleSystem = ({ 
  particleCount = 20, 
  colors = ['#3B82F6', '#8B5CF6', '#10B981'],
  className 
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2
  }));
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

// Text Animation Components
export const TypewriterText = ({ 
  text, 
  speed = 50, 
  className,
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);
  
  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Glitch Text Effect
export const GlitchText = ({ 
  text, 
  intensity = 2,
  className 
}) => {
  return (
    <motion.div
      className={cn("relative inline-block", className)}
      animate={{
        x: [0, -intensity, intensity, 0],
        textShadow: [
          "0 0 0 transparent",
          `${intensity}px 0 0 #ff0000, -${intensity}px 0 0 #00ffff`,
          "0 0 0 transparent"
        ]
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 1
      }}
    >
      {text}
    </motion.div>
  );
};

// Page Transition Wrapper
export const PageTransition = ({ 
  children, 
  variant = 'fadeIn',
  className 
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={animationVariants[variant].initial}
        animate={animationVariants[variant].animate}
        exit={animationVariants[variant].exit}
        transition={transitionPresets.smooth}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Loading Animations
export const PulsingDots = ({ 
  count = 3, 
  size = 8, 
  color = "bg-blue-500",
  className 
}) => {
  return (
    <div className={cn("flex space-x-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", color)}
          style={{ width: size, height: size }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Export all animation utilities
export const AnimationUtils = {
  variants: animationVariants,
  transitions: transitionPresets,
  
  // Helper function to create custom variants
  createVariant: (initial, animate, exit, transition = transitionPresets.smooth) => ({
    initial,
    animate,
    exit,
    transition
  }),
  
  // Helper function to create stagger animations
  createStagger: (staggerDelay = 0.1) => ({
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  })
};

export default {
  RevealOnScroll,
  StaggeredList,
  MorphingShape,
  FloatingElement,
  MagneticButton,
  ParticleSystem,
  TypewriterText,
  GlitchText,
  PageTransition,
  PulsingDots,
  AnimationUtils
};