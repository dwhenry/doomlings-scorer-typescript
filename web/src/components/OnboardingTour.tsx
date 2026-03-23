import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import {
  markOnboardingComplete,
  onboardingStepsDesktop,
  onboardingStepsMobile,
  type OnboardingStep,
  type OnboardingStepId
} from '../onboarding/onboardingSteps';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { OnboardingDemoContext } from '../hooks/useOnboardingDemo';

const SPOTLIGHT_PAD = 6;

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
  applyDemo: (ctx: OnboardingDemoContext) => void;
  /** When this changes (e.g. cards load), demo effects for the current step re-run. */
  demoRefreshKey: number;
}

export default function OnboardingTour({
  open,
  onClose,
  applyDemo,
  demoRefreshKey
}: OnboardingTourProps) {
  const isMobile = !useMediaQuery('(min-width: 768px)');
  const steps: OnboardingStep[] = isMobile
    ? onboardingStepsMobile
    : onboardingStepsDesktop;
  const [index, setIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(open);
  const prevStepIdRef = useRef<OnboardingStepId | null>(null);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setIndex(0);
    }
    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) {
      applyDemo({
        stepId: null,
        previousStepId: prevStepIdRef.current,
        isMobile
      });
      prevStepIdRef.current = null;
      return;
    }
    const stepId = steps[index]?.id ?? null;
    applyDemo({
      stepId,
      previousStepId: prevStepIdRef.current,
      isMobile
    });
    prevStepIdRef.current = stepId;
  }, [applyDemo, demoRefreshKey, open, index, isMobile, steps]);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, steps.length - 1)));
  }, [steps.length]);

  const step = steps[index];
  const isLast = index >= steps.length - 1;

  useLayoutEffect(() => {
    if (!open || !step) {
      setSpotlightRect(null);
      return;
    }
    const anchor = step.tourAnchor;
    if (!anchor) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${anchor}"]`);
    if (!el || !(el instanceof HTMLElement)) {
      setSpotlightRect(null);
      return;
    }

    const update = () => {
      const r = el.getBoundingClientRect();
      setSpotlightRect(r);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : null;
    ro?.observe(el);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro?.disconnect();
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, index]);

  const finish = useCallback(() => {
    markOnboardingComplete();
    onClose();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    finish();
  }, [finish]);

  const handleNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  }, [finish, isLast]);

  const handleBack = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, finish]);

  if (!open || !step) return null;

  const scrimRgba = 'rgba(0, 0, 0, 0.62)';

  return (
    <div
      className="onboarding-tour-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      aria-describedby="onboarding-tour-body"
    >
      <div
        className="onboarding-tour-scrim"
        style={{ background: scrimRgba }}
        aria-hidden="true"
      />
      {spotlightRect && (
        <div
          className="onboarding-tour-spotlight"
          style={{
            left: spotlightRect.left - SPOTLIGHT_PAD,
            top: spotlightRect.top - SPOTLIGHT_PAD,
            width: spotlightRect.width + SPOTLIGHT_PAD * 2,
            height: spotlightRect.height + SPOTLIGHT_PAD * 2,
            boxShadow: `0 0 0 9999px ${scrimRgba}`
          }}
          aria-hidden="true"
        />
      )}
      <div
        ref={dialogRef}
        className="onboarding-tour-dialog"
        tabIndex={-1}
      >
        <p className="onboarding-tour-progress" aria-live="polite">
          Step {index + 1} of {steps.length}
        </p>
        <h2 id="onboarding-tour-title" className="onboarding-tour-title">
          {step.title}
        </h2>
        <div id="onboarding-tour-body" className="onboarding-tour-body">
          {step.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <div className="onboarding-tour-actions">
          <button
            type="button"
            className="onboarding-tour-btn onboarding-tour-btn--ghost"
            onClick={handleSkip}
          >
            Skip tour
          </button>
          <div className="onboarding-tour-nav">
            <button
              type="button"
              className="onboarding-tour-btn onboarding-tour-btn--ghost"
              onClick={handleBack}
              disabled={index === 0}
            >
              Back
            </button>
            <button
              type="button"
              className="onboarding-tour-btn onboarding-tour-btn--primary"
              onClick={handleNext}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
