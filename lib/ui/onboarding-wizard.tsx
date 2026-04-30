'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Globe,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to OmniPulse',
    description: 'The premier social media analytics platform for A-list talent. Let\'s set up your dashboard in minutes.',
    icon: <Sparkles size={32} />,
  },
  {
    id: 'brand',
    title: 'Connect Your Brand',
    description: 'Tell us about your brand so we can customize your experience and metrics.',
    icon: <Target size={32} />,
  },
  {
    id: 'platforms',
    title: 'Add Your Platforms',
    description: 'Connect Instagram, TikTok, YouTube, and more to track all your social presence in one place.',
    icon: <Globe size={32} />,
  },
  {
    id: 'audience',
    title: 'Know Your Audience',
    description: 'We\'ll analyze demographics, engagement patterns, and growth opportunities.',
    icon: <Users size={32} />,
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Your dashboard is ready. Start exploring your analytics and insights.',
    icon: <BarChart3 size={32} />,
  },
];

const PlatformOption = memo(function PlatformOption({
  name,
  color,
  isSelected,
  onToggle,
}: {
  name: string;
  color: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 10,
        border: `2px solid ${isSelected ? color : 'var(--border-default)'}`,
        background: isSelected ? color + '15' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: `2px solid ${isSelected ? color : 'var(--border-strong)'}`,
          background: isSelected ? color : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {isSelected && <Check size={12} style={{ color: 'white' }} />}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
        {name}
      </span>
    </button>
  );
});

export const OnboardingWizard = memo(function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
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

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }, []);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem('omnipulse-onboarding-complete', 'true');
    onClose();
  }, [onClose]);

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={skipOnboarding}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 520,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--gold-primary), var(--accent-emerald))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                }}
              >
                {step.icon}
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step {currentStep + 1} of {STEPS.length}
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {step.title}
                </h3>
              </div>
            </div>
            <button
              onClick={skipOnboarding}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i <= currentStep ? 'var(--gold-primary)' : 'var(--border-default)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step.id === 'platforms' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                      {step.description}
                    </p>
                    <PlatformOption name="Instagram" color="#E4405F" isSelected={selectedPlatforms.includes('Instagram')} onToggle={() => togglePlatform('Instagram')} />
                    <PlatformOption name="TikTok" color="#000000" isSelected={selectedPlatforms.includes('TikTok')} onToggle={() => togglePlatform('TikTok')} />
                    <PlatformOption name="YouTube" color="#FF0000" isSelected={selectedPlatforms.includes('YouTube')} onToggle={() => togglePlatform('YouTube')} />
                    <PlatformOption name="X (Twitter)" color="#1DA1F2" isSelected={selectedPlatforms.includes('X (Twitter)')} onToggle={() => togglePlatform('X (Twitter)')} />
                    <PlatformOption name="Spotify" color="#1DB954" isSelected={selectedPlatforms.includes('Spotify')} onToggle={() => togglePlatform('Spotify')} />
                    <PlatformOption name="Facebook" color="#1877F2" isSelected={selectedPlatforms.includes('Facebook')} onToggle={() => togglePlatform('Facebook')} />
                  </div>
                ) : (
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                    {step.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <button
              onClick={isFirstStep ? skipOnboarding : handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
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
              {isLastStep ? 'Get Started' : <>Continue <ChevronRight size={14} /></>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default OnboardingWizard;
