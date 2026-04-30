'use client';

import React, { memo, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface HapticEffectProps {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const HAPTIC_DURATIONS = {
  light: 50,
  medium: 100,
  heavy: 150,
  success: 200,
  error: 100,
};

export const HapticButton = memo(function HapticButton({
  type = 'medium',
  children,
  onClick,
  className = '',
}: HapticEffectProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const scale = useMotionValue(1);
  const x = useMotionValue(0);

  const springConfig = { stiffness: 800, damping: 30 };

  const triggerLightTap = useCallback(() => {
    scale.set(0.97);
    setTimeout(() => scale.set(1), HAPTIC_DURATIONS[type]);
    if (onClick) onClick();
  }, [scale, type, onClick]);

  const triggerMediumTap = useCallback(() => {
    scale.set(0.95);
    x.set(-2);
    setTimeout(() => {
      scale.set(1.02);
      x.set(2);
    }, HAPTIC_DURATIONS[type] / 2);
    setTimeout(() => {
      scale.set(0.99);
      x.set(-1);
    }, HAPTIC_DURATIONS[type]);
    setTimeout(() => {
      scale.set(1);
      x.set(0);
    }, HAPTIC_DURATIONS[type] + 50);
    if (onClick) onClick();
  }, [scale, x, type, onClick]);

  const triggerHeavyTap = useCallback(() => {
    scale.set(0.93);
    x.set(-4);
    setTimeout(() => {
      scale.set(1.05);
      x.set(4);
    }, HAPTIC_DURATIONS[type] / 3);
    setTimeout(() => {
      scale.set(0.97);
      x.set(-2);
    }, (HAPTIC_DURATIONS[type] / 3) * 2);
    setTimeout(() => {
      scale.set(1);
      x.set(0);
    }, HAPTIC_DURATIONS[type] + 80);
    if (onClick) onClick();
  }, [scale, x, type, onClick]);

  const handleClick = () => {
    switch (type) {
      case 'light': triggerLightTap(); break;
      case 'medium': triggerMediumTap(); break;
      case 'heavy': triggerHeavyTap(); break;
      default: triggerMediumTap(); break;
    }
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ scale, x, display: 'inline-flex' }}
      whileHover={{ scale: type === 'light' ? 1.01 : 1.02 }}
      whileTap={{ scale: 1 }}
      onClick={handleClick}
    >
      {children}
    </motion.button>
  );
});

interface VisualHapticProps {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  className?: string;
  onComplete?: () => void;
}

export const VisualHaptic = memo(function VisualHaptic({
  type,
  className = '',
  onComplete,
}: VisualHapticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const originalTransform = el.style.transform;

    if (type === 'error') {
      const animate = () => {
        el.style.transform = 'translateX(-4px)';
        setTimeout(() => { el.style.transform = 'translateX(4px)'; }, 50);
        setTimeout(() => { el.style.transform = 'translateX(-3px)'; }, 100);
        setTimeout(() => { el.style.transform = 'translateX(3px)'; }, 150);
        setTimeout(() => { el.style.transform = 'translateX(0)'; }, 200);
      };
      animate();
    } else {
      el.style.transform = 'scale(0.95)';
      setTimeout(() => { el.style.transform = 'scale(1.03)'; }, HAPTIC_DURATIONS[type] / 2);
      setTimeout(() => { el.style.transform = 'scale(1)'; }, HAPTIC_DURATIONS[type]);
    }

    const timer = setTimeout(() => onComplete?.(), HAPTIC_DURATIONS[type] + 200);
    return () => clearTimeout(timer);
  }, [type, onComplete]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: 'transform 0.1s ease',
        transformOrigin: 'center',
      }}
    />
  );
});

interface HoverHapticProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export const HoverHaptic = memo(function HoverHaptic({
  children,
  intensity = 'light',
  className = '',
}: HoverHapticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    const scale = intensity === 'light' ? 1.008 : intensity === 'medium' ? 1.015 : 1.025;
    ref.current.style.transform = `scale(${scale})`;
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.05s ease',
        transformOrigin: 'center',
      }}
    >
      {children}
    </div>
  );
});

export default HapticButton;
