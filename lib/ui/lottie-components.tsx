'use client';

import React, { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LottiePlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onComplete?: () => void;
}

export const LottiePlayer = memo(function LottiePlayer({
  src,
  autoplay = false,
  loop = false,
  width = 64,
  height = 64,
  className = '',
  onComplete,
}: LottiePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!src) return;

    const loadAnimation = async () => {
      try {
        const response = await fetch(src);
        const data = await response.json();

        if (typeof window !== 'undefined' && (window as any).lottie) {
          const anim = (window as any).lottie.loadAnimation({
            container: containerRef.current!,
            renderer: 'svg',
            loop,
            autoplay,
            animationData: data,
          });

          anim.addEventListener('complete', () => {
            if (!loop) setIsPlaying(false);
            onComplete?.();
          });

          animationRef.current = anim;
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn('Lottie load failed:', err);
      }
    };

    loadAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [src, loop, autoplay, onComplete]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
});

interface AnimatedSVGPathProps {
  paths: {
    default: string;
    active?: string;
    hover?: string;
  };
  size?: number;
  color?: string;
  className?: string;
}

export const AnimatedSVGPath = memo(function AnimatedSVGPath({
  paths,
  size = 24,
  color = 'currentColor',
  className = '',
}: AnimatedSVGPathProps) {
  const [currentPath, setCurrentPath] = useState(paths.default);
  const pathRef = useRef<SVGPathElement>(null);

  const animatePath = useCallback((toPath: string) => {
    if (!pathRef.current || !toPath) return;
    const pathLength = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = String(pathLength);
    pathRef.current.style.strokeDashoffset = String(pathLength);
    pathRef.current.style.transition = 'stroke-dashoffset 0.3s ease';

    requestAnimationFrame(() => {
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = '0';
      }
    });
    setCurrentPath(toPath);
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        ref={pathRef}
        d={currentPath}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

interface MorphIconProps {
  type: 'trend-up' | 'trend-down' | 'trend-neutral' | 'play' | 'pause' | 'close' | 'plus' | 'check';
  size?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}

const ICON_PATHS: Record<string, string> = {
  'trend-up': 'M7 17l5-5M7 7l5 5M17 7l-5 5',
  'trend-down': 'M7 7l5 5M17 17l-5-5M17 7l-5 5',
  'trend-neutral': 'M7 12h10M17 12H7',
  play: 'M5 3l14 9-14 9V3z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  close: 'M18 6L6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6L9 17l-5-5',
};

export const MorphIcon = memo(function MorphIcon({
  type,
  size = 24,
  color = 'currentColor',
  animate = true,
  className = '',
}: MorphIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      animate={animate ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <path
        d={ICON_PATHS[type]}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
});

interface LoadingOrbitProps {
  size?: number;
  color?: string;
  className?: string;
}

export const LoadingOrbit = memo(function LoadingOrbit({
  size = 40,
  color = 'var(--gold-primary)',
  className = '',
}: LoadingOrbitProps) {
  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: '50%',
            background: color,
            top: 0,
            left: '50%',
            marginLeft: -(size * 0.075),
            marginTop: -(size * 0.075),
            transformOrigin: `50% ${size / 2}px`,
          }}
          animate={{
            scale: [1, 0.5, 1],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
});

interface SuccessBurstProps {
  size?: number;
  className?: string;
}

export const SuccessBurst = memo(function SuccessBurst({
  size = 60,
  className = '',
}: SuccessBurstProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: size * 0.3,
            background: 'var(--accent-emerald)',
            borderRadius: 2,
            transformOrigin: '50% 100%',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </motion.div>
  );
});

export default LottiePlayer;
