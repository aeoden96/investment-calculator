import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => [
    {
      title: t('welcome.step1Title'),
      icon: "💰",
      content: t('welcome.step1Content')
    },
    {
      title: t('welcome.step2Title'),
      icon: "📊",
      content: t('welcome.step2Content')
    },
    {
      title: t('welcome.step3Title'),
      icon: "📈",
      content: t('welcome.step3Content')
    }
  ], [t]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onClose]);

  // Touch/Mouse handlers for swipe
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50; // Minimum swipe distance

    if (translateX < -threshold && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (translateX > threshold && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }

    setTranslateX(0);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm"
        aria-label={t('welcome.close')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Content Container */}
      <div className="w-full max-w-2xl mx-6 md:mx-4">
        <div
          ref={containerRef}
          className="card bg-base-100 shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="card-body p-8 md:p-12 min-h-[400px] flex flex-col">
            {/* Slides Container */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(calc(-${currentStep * 100}% + ${isDragging ? translateX : 0}px))`
                }}
              >
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 flex flex-col items-center text-center px-4 pointer-events-none"
                  >
                    {/* Icon */}
                    <div className="text-7xl mb-6">{step.icon}</div>
                    
                    {/* Title */}
                    <h2 
                      id={index === currentStep ? "welcome-title" : undefined}
                      className="text-3xl md:text-4xl font-bold mb-4"
                    >
                      {step.title}
                    </h2>
                    
                    {/* Content */}
                    <p className="text-lg opacity-80 max-w-lg leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center items-center gap-2 mt-8 pointer-events-auto">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-primary w-8'
                      : 'bg-base-300 hover:bg-base-content/30'
                  }`}
                  aria-label={t('welcome.goToStep', { step: index + 1 })}
                  aria-current={index === currentStep ? 'step' : undefined}
                />
              ))}
            </div>

            {/* Get Started Button (on last step) */}
            {currentStep === steps.length - 1 && (
              <div className="mt-6 pointer-events-auto">
                <button
                  onClick={onClose}
                  className="btn btn-primary btn-lg w-full max-w-xs mx-auto block"
                >
                  {t('welcome.getStarted')}
                </button>
              </div>
            )}

            {/* Navigation Hint */}
            <div className="text-center text-sm opacity-50 mt-4">
              <p>{t('welcome.navigateHint')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
