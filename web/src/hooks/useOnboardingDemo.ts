import { useCallback, useEffect, useRef, type Dispatch, type RefObject } from 'react';
import type { Action } from '../appReducer';
import type { Card } from '../types';
import type { OnboardingStepId } from '../onboarding/onboardingSteps';
import { pickDemoPackCardName } from '../onboarding/pickDemoPackCard';

export interface OnboardingDemoContext {
  stepId: OnboardingStepId | null;
  previousStepId: OnboardingStepId | null;
  isMobile: boolean;
}

export function useOnboardingApplyDemo(
  dispatch: Dispatch<Action>,
  selectedPlayerId: number | null,
  cardsMap: Map<string, Card>,
  setMobilePreviewCard: (name: string | null) => void,
  setTourDrivenPreview: (v: boolean) => void,
  appRootRef: RefObject<HTMLDivElement | null>
) {
  const longPressTimerRef = useRef<number | null>(null);
  const selectedPlayerIdRef = useRef(selectedPlayerId);
  const cardsMapRef = useRef(cardsMap);

  useEffect(() => {
    selectedPlayerIdRef.current = selectedPlayerId;
  }, [selectedPlayerId]);

  useEffect(() => {
    cardsMapRef.current = cardsMap;
  }, [cardsMap]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const cleanupStep = useCallback(
    (id: OnboardingStepId | null) => {
      if (!id) return;
      if (id === 'hover-preview') {
        dispatch({ type: 'SET_HOVERED', cardName: null });
      }
      if (id === 'long-press') {
        clearLongPressTimer();
        setTourDrivenPreview(false);
        setMobilePreviewCard(null);
      }
    },
    [
      clearLongPressTimer,
      dispatch,
      setMobilePreviewCard,
      setTourDrivenPreview
    ]
  );

  const applyDemo = useCallback(
    ({ stepId, previousStepId, isMobile }: OnboardingDemoContext) => {
      const root = appRootRef.current;
      const clearAttr = () => root?.removeAttribute('data-onboarding-demo');

      cleanupStep(previousStepId);

      if (
        previousStepId === 'scoring-breakdown' &&
        stepId !== 'beta-report-desktop'
      ) {
        dispatch({ type: 'CLOSE_SCORING_LOGS' });
        root?.removeAttribute('data-onboarding-demo');
      }
      if (
        previousStepId === 'beta-report-desktop' &&
        stepId !== 'scoring-breakdown'
      ) {
        dispatch({ type: 'CLOSE_SCORING_LOGS' });
        root?.removeAttribute('data-onboarding-demo');
      }

      if (stepId === null) {
        root?.removeAttribute('data-onboarding-demo');
        dispatch({ type: 'SET_HOVERED', cardName: null });
        dispatch({ type: 'CLOSE_SCORING_LOGS' });
        clearLongPressTimer();
        setTourDrivenPreview(false);
        setMobilePreviewCard(null);
        if (isMobile) dispatch({ type: 'STOP_ADDING' });
        return;
      }

      const scoringElevated =
        stepId === 'scoring-breakdown' || stepId === 'beta-report-desktop';
      if (!scoringElevated) {
        root?.removeAttribute('data-onboarding-demo');
      }

      const sp = selectedPlayerIdRef.current;
      const demoCard = pickDemoPackCardName(cardsMapRef.current);

      switch (stepId) {
        case 'welcome':
        case 'menu':
        case 'header':
        case 'catastrophe':
        case 'footer':
          break;
        case 'players':
          if (isMobile) {
            dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId: 0 });
          } else if (sp !== 0) {
            dispatch({ type: 'SELECT_PLAYER', id: 0 });
          }
          break;
        case 'pack':
          if (isMobile) {
            dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId: 0 });
          } else if (sp !== 0) {
            dispatch({ type: 'SELECT_PLAYER', id: 0 });
          }
          break;
        case 'hover-preview':
          if (!isMobile && demoCard) {
            root?.setAttribute('data-onboarding-demo', 'hover');
            requestAnimationFrame(() => {
              dispatch({ type: 'SET_HOVERED', cardName: demoCard });
            });
          }
          break;
        case 'long-press':
          if (isMobile && demoCard) {
            clearLongPressTimer();
            longPressTimerRef.current = window.setTimeout(() => {
              longPressTimerRef.current = null;
              root?.setAttribute('data-onboarding-demo', 'long-press');
              setTourDrivenPreview(true);
              setMobilePreviewCard(demoCard);
            }, 550);
          }
          break;
        case 'scoring-breakdown':
          if (!isMobile) {
            dispatch({ type: 'OPEN_SCORING_LOGS' });
            root?.setAttribute('data-onboarding-demo', 'scoring-modal');
          }
          break;
        case 'beta-report-desktop':
          if (!isMobile) {
            dispatch({ type: 'OPEN_SCORING_LOGS' });
            root?.setAttribute('data-onboarding-demo', 'scoring-modal');
          }
          break;
        default:
          break;
      }
    },
    [
      appRootRef,
      cleanupStep,
      clearLongPressTimer,
      dispatch,
      setMobilePreviewCard,
      setTourDrivenPreview
    ]
  );

  return applyDemo;
}
