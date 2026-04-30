'use client';

import React, { memo, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';

interface AnimationConfig {
  type: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce' | 'spring';
  duration?: number;
  delay?: number;
  stagger?: number;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationConfig;
  className?: string;
  once?: boolean;
  threshold?: number;
}

const animationVariants: Record<string, Variants> = {
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  'scale': {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  'bounce': {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  },
  'spring': {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  },
};

export const AnimatedSection = memo(function AnimatedSection({
  children,
  animation = { type: 'fade', duration: 0.4 },
  className = '',
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  const controls = useAnimation();

  const variant = animationVariants[animation.type] || animationVariants['fade'];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={controls}
      transition={{
        duration: animation.duration || 0.4,
        delay: animation.delay || 0,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

export const StaggeredList = memo(function StaggeredList({
  children,
  staggerDelay = 0.05,
  initialDelay = 0,
  className = '',
  direction = 'vertical',
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      style={{
        display: direction === 'horizontal' ? 'flex' : 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: direction === 'horizontal' ? '1rem' : 0,
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: initialDelay + index * staggerDelay,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
});

interface MorphingShapeProps {
  size?: number;
  color?: string;
  className?: string;
}

export const MorphingShape = memo(function MorphingShape({
  size = 100,
  color = 'var(--gold-primary)',
  className = '',
}: MorphingShapeProps) {
  return (
    <motion.div
      className={className}
      animate={{
        borderRadius: ['50%', '30%', '60%', '40%', '50%'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, transparent)`,
      }}
    />
  );
});

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

export const ParallaxLayer = memo(function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const movement = scrollY * speed * (direction === 'up' ? -1 : 1);
      if (ref.current) {
        ref.current.style.transform = `translateY(${movement}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});

interface CountUpNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export const CountUpNumber = memo(function CountUpNumber({
  value,
  duration = 2,
  formatFn,
  className = '',
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {formatFn ? formatFn(displayValue) : displayValue}
    </span>
  );
});

interface RippleEffectProps {
  color?: string;
  className?: string;
}

export const RippleEffect = memo(function RippleEffect({
  color = 'var(--gold-primary)',
  className = '',
}: RippleEffectProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
      }}
    />
  );
});

export const LoadingDots = memo(function LoadingDots({
  color = 'var(--text-primary)',
  size = 4,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </motion.div>
  );
});

export default AnimatedSection;
