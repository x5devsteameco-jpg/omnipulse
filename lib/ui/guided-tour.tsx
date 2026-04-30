'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  BarChart3,
  Target,
  Users,
  Globe,
  Zap,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  targetSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    title: 'Your Dashboard Overview',
    content:
      'This is your command center. All key metrics are displayed here in real-time. Click on any card to drill down into detailed analytics.',
    icon: <BarChart3 size={20} />,
    targetSelector: '[role="main"]',
    placement: 'top',
  },
  {
    id: 'platforms',
    title: 'Platform Performance',
    content:
      'Track all your social platforms in one view. See follower counts, engagement rates, and trend indicators at a glance.',
    icon: <Globe size={20} />,
    targetSelector: '[aria-label="Platform Breakdown"]',
    placement: 'bottom',
  },
  {
    id: 'campaigns',
    title: 'Campaign ROI Tracking',
    content:
      'Monitor your marketing campaigns with detailed ROI metrics. Track impressions, clicks, conversions, and ROAS in real-time.',
    icon: <Target size={20} />,
    targetSelector: '[aria-label*="Campaign"]',
    placement: 'top',
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    content:
      'Receive automated recommendations based on your data. Our ML models identify gaps, predict trends, and suggest optimizations.',
    icon: <Sparkles size={20} />,
    targetSelector: '[aria-label*="Gaps"]',
    placement: 'right',
  },
  {
    id: 'accounts',
    title: 'Connected Accounts',
    content:
      'Manage all your social media accounts in one place. Add new platforms, monitor connection status, and track performance.',
    icon: <Users size={20} />,
    targetSelector: '[aria-label*="Accounts"]',
    placement: 'left',
  },
  {
    id: 'ready',
    title: "You're All Set!",
    content:
      "That's the tour! Press 'Complete' to start exploring. Remember, you can access this tour anytime from the help button.",
    icon: <Zap size={20} />,
    placement: 'center',
  },
];

export const GuidedTour = memo(function GuidedTour({
  isOpen,
  onClose,
  onComplete,
  steps = TOUR_STEPS,
  autoPlay = false,
  autoPlayDelay = 5000,
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(true);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, onComplete]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentStep(index);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            pointerEvents: 'auto',
          }}
          onClick={handleSkip}
        />

        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position: step.placement === 'center' ? 'fixed' : 'absolute',
            top: step.placement === 'center' ? '50%' : undefined,
            bottom: step.placement !== 'center' ? 24 : undefined,
            left: '50%',
            transform: step.placement === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--gold-primary), var(--accent-emerald))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
              }}
            >
              {step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Step {currentStep + 1} of {steps.length}
              </p>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 6,
                border: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: 20 }}>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {step.content}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '0 20px 16px',
            }}
          >
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                style={{
                  width: index === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background:
                    index === currentStep
                      ? 'var(--gold-primary)'
                      : 'var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <button
              onClick={isFirstStep ? handleSkip : handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color:
                  isFirstStep ? 'var(--text-dim)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isFirstStep ? 'Skip' : <><ChevronLeft size={14} /> Back</>}
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--gold-primary)',
                color: '#000',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLastStep ? (
                <>
                  <Check size={14} /> Complete
                </>
              ) : (
                <>Continue <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default GuidedTour;
