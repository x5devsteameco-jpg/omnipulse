'use client';

import React, { memo, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue, type MotionValue } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAngle?: number;
  glareIntensity?: number;
  onTiltChange?: (x: number, y: number) => void;
  style?: React.CSSProperties;
}

export const TiltCard = memo(function TiltCard({
  children,
  className = '',
  tiltAngle = 15,
  glareIntensity = 0.3,
  onTiltChange,
  style = {},
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  const springConfig = { stiffness: 400, damping: 30 };

  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  const scaleSpring = useSpring(scale, { stiffness: 400, damping: 25 });

  const glareX = useTransform(rotateYSpring, [-tiltAngle, tiltAngle], ['0%', '100%']);
  const glareY = useTransform(rotateXSpring, [-tiltAngle, tiltAngle], ['0%', '100%']);
  const glareOpacity = useTransform(
    useMotionValue(isHovered ? 1 : 0),
    [0, 1],
    [0, glareIntensity]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateYValue = (mouseX / (rect.width / 2)) * tiltAngle;
      const rotateXValue = -(mouseY / (rect.height / 2)) * tiltAngle;

      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
      scale.set(1.02);

      onTiltChange?.(rotateXValue, rotateYValue);
    },
    [tiltAngle, rotateX, rotateY, scale, onTiltChange]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setIsHovered(false);
    onTiltChange?.(0, 0);
  }, [rotateX, rotateY, scale, onTiltChange]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          scale: scaleSpring,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {children}

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `linear-gradient(${135 + Number(x) * 0.5}deg, rgba(255,255,255,${glareOpacity.get()}) 0%, transparent 60%)`
            ),
            opacity: glareOpacity,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
      </motion.div>
    </motion.div>
  );
});

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      x.set(deltaX);
      y.set(deltaY);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: xSpring, y: ySpring, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
});

export default TiltCard;
