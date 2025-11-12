# Animations & Micro-Interactions Library

This comprehensive animations library provides a complete set of tools for creating engaging user interfaces with smooth animations and micro-interactions.

## 🚀 Features

- **Micro-Interactions**: Pre-built animated components for common UI elements
- **Animation Variants**: Extensive collection of animation presets
- **Custom Hooks**: React hooks for managing complex animations
- **Performance Optimized**: Built with Framer Motion for optimal performance
- **TypeScript Ready**: Full TypeScript support (when needed)
- **Responsive**: Works seamlessly across all device sizes

## 📦 Components

### Micro-Interactions (`/src/components/MicroInteractions.jsx`)

#### AnimatedButton
Interactive button with hover and tap animations.
```jsx
<AnimatedButton variant="primary" size="lg">
  Click me!
</AnimatedButton>
```

#### FloatingActionButton
Floating action button with magnetic hover effect.
```jsx
<FloatingActionButton 
  icon={<Plus />} 
  position="bottom-right"
  onClick={handleAction}
/>
```

#### AnimatedCard
Card component with entrance animations and hover effects.
```jsx
<AnimatedCard className="p-6">
  <h3>Card Title</h3>
  <p>Card content...</p>
</AnimatedCard>
```

#### AnimatedProgressBar
Progress bar with smooth fill animation.
```jsx
<AnimatedProgressBar 
  value={75} 
  max={100}
  color="blue"
  showValue={true}
/>
```

#### AnimatedBadge
Badge with pulse and scale animations.
```jsx
<AnimatedBadge variant="success" pulse={true}>
  New
</AnimatedBadge>
```

#### AnimatedSpinner
Customizable loading spinner.
```jsx
<AnimatedSpinner size="lg" color="primary" />
```

#### AnimatedToast
Toast notification with slide-in animation.
```jsx
<AnimatedToast 
  message="Success!" 
  type="success"
  duration={3000}
/>
```

#### AnimatedCounter
Number counter with smooth counting animation.
```jsx
<AnimatedCounter 
  value={1250} 
  duration={2000}
  prefix="$"
/>
```

#### StaggerContainer
Container that animates children with staggered timing.
```jsx
<StaggerContainer staggerDelay={0.1}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerContainer>
```

#### ParallaxElement
Element with parallax scrolling effect.
```jsx
<ParallaxElement speed={0.5}>
  <img src="background.jpg" alt="Background" />
</ParallaxElement>
```

### Advanced Animations (`/src/components/AnimationsLibrary.jsx`)

#### RevealOnScroll
Reveals content when it enters the viewport.
```jsx
<RevealOnScroll variant="fadeInUp" threshold={0.2}>
  <h2>This will animate in when scrolled into view</h2>
</RevealOnScroll>
```

#### StaggeredList
Animates list items with staggered timing.
```jsx
<StaggeredList staggerDelay={0.15} variant="slideInLeft">
  {items.map(item => <ListItem key={item.id} {...item} />)}
</StaggeredList>
```

#### MorphingShape
Shape that morphs between different forms.
```jsx
<MorphingShape 
  shapes={['circle', 'square', 'triangle']} 
  interval={2000}
/>
```

#### FloatingElement
Element with continuous floating animation.
```jsx
<FloatingElement intensity={15} duration={4}>
  <Icon name="star" />
</FloatingElement>
```

#### MagneticButton
Button that follows mouse movement with magnetic effect.
```jsx
<MagneticButton magneticStrength={0.4}>
  Magnetic Button
</MagneticButton>
```

#### ParticleSystem
Animated particle system background.
```jsx
<ParticleSystem 
  particleCount={30}
  colors={['#3B82F6', '#8B5CF6', '#10B981']}
/>
```

#### TypewriterText
Text that types out character by character.
```jsx
<TypewriterText 
  text="Hello, World!" 
  speed={100}
  onComplete={() => console.log('Done!')}
/>
```

#### GlitchText
Text with glitch effect animation.
```jsx
<GlitchText text="GLITCH" intensity={3} />
```

#### PageTransition
Wrapper for page transition animations.
```jsx
<PageTransition variant="slideInRight">
  <YourPageContent />
</PageTransition>
```

#### PulsingDots
Loading indicator with pulsing dots.
```jsx
<PulsingDots count={3} size={12} color="bg-blue-500" />
```

## 🎣 Custom Hooks (`/src/hooks/useAnimations.js`)

### useScrollAnimation
Trigger animations based on scroll position.
```jsx
const { ref, controls, isInView } = useScrollAnimation('fadeInUp', 0.1, true);

return (
  <motion.div ref={ref} animate={controls}>
    Content that animates on scroll
  </motion.div>
);
```

### useStaggerAnimation
Create staggered animations for multiple elements.
```jsx
const { controls, startAnimation, initial } = useStaggerAnimation(items.length, 0.1);

useEffect(() => {
  startAnimation();
}, [startAnimation]);
```

### useHoverAnimation
Handle hover and tap animations.
```jsx
const { hoverProps, animationProps, isHovered } = useHoverAnimation(1.05, 0.95);

return (
  <motion.button {...hoverProps} {...animationProps}>
    Hover me!
  </motion.button>
);
```

### useLoadingAnimation
Manage loading spinner animations.
```jsx
const controls = useLoadingAnimation(isLoading);

return (
  <motion.div animate={controls}>
    <Spinner />
  </motion.div>
);
```

### useTypewriter
Create typewriter text effects.
```jsx
const { displayText, isComplete, startTyping } = useTypewriter("Hello World!", 50);

return <span>{displayText}</span>;
```

### useCounterAnimation
Animate number counting.
```jsx
const { currentValue, startCounter } = useCounterAnimation(1000, 2000);

useEffect(() => {
  startCounter();
}, [startCounter]);

return <span>{currentValue}</span>;
```

### useParallax
Create parallax scrolling effects.
```jsx
const { transform } = useParallax(0.5);

return (
  <div style={{ transform }}>
    Parallax content
  </div>
);
```

### useMouseTracking
Track mouse position for interactive effects.
```jsx
const { mousePosition, isMouseInside, mouseProps } = useMouseTracking();

return (
  <div {...mouseProps}>
    Mouse at: {mousePosition.x}, {mousePosition.y}
  </div>
);
```

## 🎨 Animation Variants

### Available Variants
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `scaleInCenter`
- `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`
- `rotateIn`
- `bounceIn`
- `flipInX`, `flipInY`

### Transition Presets
- `smooth`: Standard smooth transition
- `snappy`: Quick, responsive transition
- `bouncy`: Spring-based bouncy transition
- `gentle`: Slow, gentle transition
- `quick`: Very fast transition
- `slow`: Extended duration transition

## 🎯 Usage Examples

### Dashboard Integration
```jsx
import { 
  AnimatedCard, 
  AnimatedCounter, 
  StaggerContainer,
  AnimatedButton 
} from '@/components/MicroInteractions';

function Dashboard() {
  return (
    <div className="dashboard">
      <StaggerContainer className="grid grid-cols-3 gap-6">
        <AnimatedCard>
          <h3>Total Sales</h3>
          <AnimatedCounter value={15420} prefix="$" />
        </AnimatedCard>
        <AnimatedCard>
          <h3>New Customers</h3>
          <AnimatedCounter value={342} />
        </AnimatedCard>
        <AnimatedCard>
          <h3>Revenue Growth</h3>
          <AnimatedCounter value={23.5} suffix="%" />
        </AnimatedCard>
      </StaggerContainer>
      
      <AnimatedButton onClick={handleAction}>
        View Details
      </AnimatedButton>
    </div>
  );
}
```

### Form with Animations
```jsx
import { RevealOnScroll, AnimatedButton } from '@/components/AnimationsLibrary';
import { useScrollAnimation } from '@/hooks/useAnimations';

function AnimatedForm() {
  return (
    <form>
      <RevealOnScroll variant="fadeInUp">
        <input type="text" placeholder="Name" />
      </RevealOnScroll>
      
      <RevealOnScroll variant="fadeInUp">
        <input type="email" placeholder="Email" />
      </RevealOnScroll>
      
      <RevealOnScroll variant="fadeInUp">
        <AnimatedButton type="submit">
          Submit Form
        </AnimatedButton>
      </RevealOnScroll>
    </form>
  );
}
```

## 🔧 Configuration

### Global Animation Settings
You can customize global animation settings by modifying the transition presets:

```jsx
import { transitionPresets } from '@/components/AnimationsLibrary';

// Customize default smooth transition
transitionPresets.smooth = { 
  duration: 0.4, 
  ease: "easeInOut" 
};
```

### Creating Custom Variants
```jsx
import { AnimationUtils } from '@/components/AnimationsLibrary';

const customVariant = AnimationUtils.createVariant(
  { opacity: 0, scale: 0.5, rotate: -180 }, // initial
  { opacity: 1, scale: 1, rotate: 0 },      // animate
  { opacity: 0, scale: 0.5, rotate: 180 },  // exit
  { duration: 0.6, ease: "easeOut" }        // transition
);
```

## 🎭 Performance Tips

1. **Use `memo()` for expensive components**:
```jsx
const ExpensiveAnimatedComponent = memo(({ data }) => (
  <AnimatedCard>
    {/* Complex rendering logic */}
  </AnimatedCard>
));
```

2. **Limit simultaneous animations**:
```jsx
// Good: Stagger animations
<StaggerContainer staggerDelay={0.1}>
  {items.map(item => <AnimatedCard key={item.id} />)}
</StaggerContainer>

// Avoid: All at once
{items.map(item => <AnimatedCard key={item.id} />)}
```

3. **Use `triggerOnce` for scroll animations**:
```jsx
<RevealOnScroll triggerOnce={true}>
  Content that only animates once
</RevealOnScroll>
```

## 🎨 Theming

The animation library respects your application's theme:

```jsx
// Animations automatically adapt to dark/light mode
<AnimatedCard className="bg-background text-foreground">
  Theme-aware content
</AnimatedCard>
```

## 🐛 Troubleshooting

### Common Issues

1. **Animations not working**: Ensure Framer Motion is installed
2. **Performance issues**: Reduce the number of simultaneous animations
3. **Layout shift**: Use `layout` prop for layout animations
4. **Mobile performance**: Consider reducing animation complexity on mobile

### Debug Mode
Enable debug mode to visualize animation boundaries:

```jsx
<AnimatedCard debug={true}>
  Debug mode enabled
</AnimatedCard>
```

## 📱 Mobile Considerations

- Reduced motion support is built-in
- Touch-friendly hover states
- Optimized for mobile performance
- Gesture support included

## 🔮 Future Enhancements

- [ ] More animation variants
- [ ] Sound integration
- [ ] Advanced gesture recognition
- [ ] 3D animations
- [ ] WebGL integration
- [ ] Animation timeline editor

---

**Happy Animating! 🎉**

For questions or contributions, please refer to the main project documentation.