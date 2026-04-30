'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CursorGlowProps {
  color?: string;
  size?: number;
  lag?: number;
  className?: string;
}

export const CursorGlow = memo(function CursorGlow({
  color = 'rgba(212, 175, 55, 0.6)',
  size = 24,
  lag = 80,
  className = '',
}: CursorGlowProps) {
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 150, damping: 18 };
  const x = useSpring(cursorX, { ...springConfig, duration: lag / 50 });
  const y = useSpring(cursorY, { ...springConfig, duration: lag / 50 });

  useEffect(() => {
    let animationFrame: number;
    let lastMouseX = -100;
    let lastMouseY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      setIsVisible(true);

      animationFrame = requestAnimationFrame(() => {
        cursorX.set(lastMouseX);
        cursorY.set(lastMouseY);
      });
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: 'none',
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        mixBlendMode: 'screen',
        opacity: isVisible ? 0.8 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 9999,
      }}
    />
  );
});

interface RippleEffectProps {
  color?: string;
  className?: string;
}

export function RippleEffect({ color = 'var(--accent-color)', className = '' }: RippleEffectProps) {
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
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const MagneticButton = memo(function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  style = {},
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    if (!ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ref.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      x.set(deltaX);
      y.set(deltaY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      setIsHovered(false);
    };

    const element = ref.current;
    element.addEventListener('mousemove', handleMouseMove as EventListener);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', () => setIsHovered(true));

    return () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', () => setIsHovered(false));
    };
  }, [strength, x, y]);

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: xSpring, y: ySpring, ...style }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
});

interface GlowTrailProps {
  color?: string;
  dotCount?: number;
  className?: string;
}

export const GlowTrail = memo(function GlowTrail({
  color = 'rgba(212, 175, 55, 0.4)',
  dotCount = 8,
  className = '',
}: GlowTrailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dots, setDots] = useState<Array<{ x: number; y: number }>>([]);
  const lastPositions = useRef<Array<{ x: number; y: number }>>([]);
  const trailIndex = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);

      const pos = { x: e.clientX, y: e.clientY };
      lastPositions.current.push(pos);

      if (lastPositions.current.length > dotCount * 3) {
        lastPositions.current = lastPositions.current.slice(-dotCount * 3);
      }

      const newDots: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < dotCount; i++) {
        const idx = lastPositions.current.length - 1 - i * 3;
        if (idx >= 0) {
          newDots.push(lastPositions.current[idx]);
        }
      }
      setDots(newDots);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dotCount]);

  return (
    <div className={className} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? (dotCount - i) / dotCount * 0.6 : 0 }}
          style={{
            position: 'absolute',
            left: dot.x,
            top: dot.y,
            width: (dotCount - i) * 2 + 4,
            height: (dotCount - i) * 2 + 4,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </div>
  );
});

export default CursorGlow;
