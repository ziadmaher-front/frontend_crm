import { useAnimation, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { animationVariants, transitionPresets } from '@/components/AnimationsLibrary';

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (variant = 'fadeInUp', threshold = 0.1, triggerOnce = true) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { threshold, triggerOnce });
  
  useEffect(() => {
    if (isInView) {
      controls.start(animationVariants[variant].animate);
    } else if (!triggerOnce) {
      controls.start(animationVariants[variant].initial);
    }
  }, [isInView, controls, variant, triggerOnce]);
  
  return {
    ref,
    controls,
    isInView,
    initial: animationVariants[variant].initial,
    animate: controls
  };
};

// Custom hook for staggered animations
export const useStaggerAnimation = (itemCount, staggerDelay = 0.1) => {
  const controls = useAnimation();
  
  const startAnimation = useCallback(async () => {
    await controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * staggerDelay,
        ...transitionPresets.smooth
      }
    }));
  }, [controls, staggerDelay]);
  
  return {
    controls,
    startAnimation,
    initial: { opacity: 0, y: 20 }
  };
};

// Custom hook for hover animations
export const useHoverAnimation = (hoverScale = 1.05, tapScale = 0.95) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  
  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onMouseDown: () => setIsTapped(true),
    onMouseUp: () => setIsTapped(false),
    onMouseLeave: () => {
      setIsHovered(false);
      setIsTapped(false);
    }
  };
  
  const animationProps = {
    animate: {
      scale: isTapped ? tapScale : isHovered ? hoverScale : 1
    },
    transition: transitionPresets.snappy
  };
  
  return {
    hoverProps,
    animationProps,
    isHovered,
    isTapped
  };
};

// Custom hook for loading animations
export const useLoadingAnimation = (isLoading) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (isLoading) {
      controls.start({
        rotate: 360,
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      });
    } else {
      controls.stop();
      controls.set({ rotate: 0 });
    }
  }, [isLoading, controls]);
  
  return controls;
};

// Custom hook for typewriter effect
export const useTypewriter = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const startTyping = useCallback(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, []);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);
  
  return {
    displayText,
    isComplete,
    startTyping,
    progress: (currentIndex / text.length) * 100
  };
};

// Custom hook for counter animations
export const useCounterAnimation = (endValue, duration = 2000, startValue = 0) => {
  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const startCounter = useCallback(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const difference = endValue - startValue;
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (difference * easedProgress);
      
      setCurrentValue(Math.floor(currentVal));
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCurrentValue(endValue);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [endValue, startValue, duration]);
  
  return {
    currentValue,
    isAnimating,
    startCounter,
    progress: ((currentValue - startValue) / (endValue - startValue)) * 100
  };
};

// Custom hook for parallax effects
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return {
    transform: `translateY(${offset}px)`,
    offset
  };
};

// Custom hook for mouse tracking
export const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInside, setIsMouseInside] = useState(false);
  
  const trackMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);
  
  const mouseProps = {
    onMouseMove: trackMouse,
    onMouseEnter: () => setIsMouseInside(true),
    onMouseLeave: () => setIsMouseInside(false)
  };
  
  return {
    mousePosition,
    isMouseInside,
    mouseProps
  };
};

// Custom hook for intersection observer animations
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);
  
  return { ref, isVisible };
};

// Custom hook for gesture animations
export const useGestureAnimation = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const dragProps = {
    drag: true,
    dragConstraints: { left: -100, right: 100, top: -100, bottom: 100 },
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    },
    onDrag: (event, info) => {
      setDragOffset({ x: info.offset.x, y: info.offset.y });
    }
  };
  
  return {
    isDragging,
    dragOffset,
    dragProps
  };
};

// Animation presets for common use cases
export const animationPresets = {
  // Card animations
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    },
    transition: transitionPresets.smooth
  },
  
  // Button animations
  buttonPress: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.05 },
    transition: transitionPresets.snappy
  },
  
  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: transitionPresets.smooth
  },
  
  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: transitionPresets.bouncy
  },
  
  // Page transitions
  pageSlide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: transitionPresets.smooth
  }
};

export default {
  useScrollAnimation,
  useStaggerAnimation,
  useHoverAnimation,
  useLoadingAnimation,
  useTypewriter,
  useCounterAnimation,
  useParallax,
  useMouseTracking,
  useIntersectionAnimation,
  useGestureAnimation,
  animationPresets
};