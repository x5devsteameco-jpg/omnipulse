'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  particleCount?: number;
  color?: string;
  className?: string;
}

export const ParticleField = memo(function ParticleField({
  particleCount = 50,
  color = 'rgba(212, 175, 55, 0.3)',
  className = '',
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    twinkle: number;
    twinkleSpeed: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: (Math.random() - 0.5) * 0.02 + 0.01,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += p.twinkleSpeed;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${currentOpacity})`);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
});

interface FloatingOrbProps {
  size?: number;
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  duration?: number;
  className?: string;
}

export const FloatingOrb = memo(function FloatingOrb({
  size = 200,
  color = 'rgba(212, 175, 55, 0.15)',
  top,
  left,
  right,
  bottom,
  duration = 20,
  className = '',
}: FloatingOrbProps) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 10, -10, 0],
        scale: [1, 1.1, 0.9, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'fixed',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0,
        top,
        left,
        right,
        bottom,
      }}
    />
  );
});

interface GrainOverlayProps {
  intensity?: number;
  className?: string;
}

export const GrainOverlay = memo(function GrainOverlay({
  intensity = 0.04,
  className = '',
}: GrainOverlayProps) {
  return (
    <svg style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} className={className}>
      <filter id="grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" opacity={intensity} />
    </svg>
  );
});

interface GradientMeshProps {
  className?: string;
}

export const GradientMesh = memo(function GradientMesh({ className = '' }: GradientMeshProps) {
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 10% 70%, rgba(244, 63, 94, 0.04) 0%, transparent 50%)
        `,
      }}
    />
  );
});

interface AnimatedBackgroundProps {
  type?: 'particles' | 'orbs' | 'gradient' | 'all';
  particleCount?: number;
  orbCount?: number;
  className?: string;
}

export const AnimatedBackground = memo(function AnimatedBackground({
  type = 'all',
  particleCount = 40,
  orbCount = 3,
  className = '',
}: AnimatedBackgroundProps) {
  return (
    <div className={className} style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <GradientMesh />
      <GrainOverlay />

      {(type === 'particles' || type === 'all') && (
        <ParticleField particleCount={particleCount} />
      )}

      {(type === 'orbs' || type === 'all') && (
        <>
          <FloatingOrb size={300} color="rgba(212, 175, 55, 0.12)" top="10%" left="5%" duration={25} />
          <FloatingOrb size={250} color="rgba(139, 92, 246, 0.08)" top="50%" right="10%" duration={20} />
          <FloatingOrb size={200} color="rgba(6, 182, 212, 0.06)" bottom="20%" left="30%" duration={30} />
        </>
      )}
    </div>
  );
});

export default AnimatedBackground;
