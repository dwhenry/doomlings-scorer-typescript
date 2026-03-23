import {
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { allCards } from '@scorer/cardContainer';
import '@scorer/cards';
import type { Card } from './types';
import {
  GAME_STATE_STORAGE_KEY,
  getInitialState,
  reducer
} from './appReducer';
import { gameStateToExport } from './utils/gameStateExport';
import { useScorer } from './hooks/useScorer';
import { getEditableMetadataFields } from './utils/cardMetadata';
import Header from './components/Header';
import PlayerSection from './components/PlayerSection';
import PackDisplay from './components/PackDisplay';
import CardPreviewModal from './components/CardPreviewModal';
import CardZoom from './components/CardZoom';
import MetadataModal from './components/MetadataModal';
import ScoringLogsModal from './components/ScoringLogsModal';
import AppFooter from './components/AppFooter';
import BetaBanner from './components/BetaBanner';
import EmailContactModal from './components/EmailContactModal';
import LicenseModal from './components/LicenseModal';
import OnboardingTour from './components/OnboardingTour';
import { isOnboardingCompleteForCurrentVersion } from './onboarding/onboardingSteps';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [mobilePreviewCard, setMobilePreviewCard] = useState<string | null>(
    null
  );
  const [cardsMap, setCardsMap] = useState<Map<string, Card>>(new Map());
  const [onboardingOpen, setOnboardingOpen] = useState(
    () => !isOnboardingCompleteForCurrentVersion()
  );

  useEffect(() => {
    setCardsMap(allCards());
  }, []);

  // Persist game state so refresh restores it; only reset when user clicks "New Game"
  useEffect(() => {
    const payload = gameStateToExport(state);
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(payload));
  }, [
    state.players,
    state.playerCount,
    state.selectedCatastrophes,
    state.catastropheMetadata,
    state.selectedReleases,
    state.selectedCollections
  ]);

  // Sticky player strip height → card preview dock offset when scrolling
  useEffect(() => {
    const strip = document.querySelector(
      '.players-strip-sticky'
    ) as HTMLElement | null;

    function setPreviewStickyTop() {
      if (!strip) return;
      document.documentElement.style.setProperty(
        '--desk-sticky-top',
        `${strip.offsetHeight + 12}px`
      );
    }

    setPreviewStickyTop();
    window.addEventListener('resize', setPreviewStickyTop);
    const timer = setTimeout(setPreviewStickyTop, 100);

    let observer: ResizeObserver | undefined;
    if (strip && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(setPreviewStickyTop);
      observer.observe(strip);
    }

    return () => {
      window.removeEventListener('resize', setPreviewStickyTop);
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [state.players, state.selectedPlayerId, state.playerCount]);

  const gameScore = useScorer(
    state.players,
    state.selectedCatastrophes,
    state.catastropheMetadata,
    cardsMap
  );

  // Merge catastrophe generated metadata back into state
  const prevCatMetaRef = useRef<string>('');
  useEffect(() => {
    if (!gameScore) return;
    const catGenMeta = gameScore.getCatastropheGeneratedMetadata();
    const playerGemMeta = gameScore.getPlayerCardsWithGeneratedMetadata();
    if (catGenMeta.length > 0) {
      const newMeta: Record<
        string,
        Record<string, string | number | string[]>
      > = {};
      state.selectedCatastrophes.forEach((catastrophe, i) => {
        if (catGenMeta[i] && Object.keys(catGenMeta[i]).length > 0) {
          newMeta[catastrophe.name] = catGenMeta[i];
        }
      });

      // Only dispatch if the metadata actually changed (prevent infinite loop)
      const serialized = JSON.stringify(newMeta);
      if (serialized !== prevCatMetaRef.current) {
        prevCatMetaRef.current = serialized;
        dispatch({ type: 'UPDATE_CATASTROPHE_METADATA', metadata: newMeta });
      }
    }

    if (playerGemMeta.length > 0) {
      // as this is used to reset error values from the backend
      // it is necessary to check if it has been processed in the last run
      dispatch({
        type: 'UPDATE_PLAYER_CARD_METADATA',
        metadata: playerGemMeta
      });
    }
  }, [gameScore, state.selectedCatastrophes]);

  const handleClickCard = useCallback(
    (cardName: string) => {
      if (state.selectedPlayerId === null) return;
      const playerId = state.selectedPlayerId;
      const player = state.players.find((p) => p.id === playerId);
      const newCardIndex = player ? player.cards.length : 0;
      dispatch({ type: 'ADD_CARD', playerId, cardName });
      // Auto-open modal only for cards that need user-editable metadata
      const editableFields = getEditableMetadataFields(cardName);
      if (editableFields.length > 0) {
        // Check if metadata would be auto-filled (player/global scope from existing cards)
        const allNonCard = editableFields.every((f) => f.scope !== 'card');
        const hasExistingSource =
          allNonCard &&
          state.players.some(
            (p) =>
              (editableFields.some((f) => f.scope === 'global') ||
                p.id === playerId) &&
              // for global and player scope we can pull the value from any card
              editableFields.every((f) =>
                p.cards.some((c) => c[f.key] !== undefined)
              )
          );
        if (!hasExistingSource) {
          dispatch({
            type: 'OPEN_MODAL',
            playerId,
            cardIndex: newCardIndex,
            cardName
          });
        }
      }
    },
    [state.selectedPlayerId, state.players]
  );

  const handleClickCatastrophe = useCallback(
    (cardName: string) => {
      if (!state.selectedCatastrophes.find((c) => c.name === cardName)) {
        dispatch({ type: 'TOGGLE_CATASTROPHE', cardName });
      }
      dispatch({ type: 'OPEN_CATASTROPHE_MODAL', cardName: cardName });
    },
    [state.selectedCatastrophes, state.catastropheMetadata]
  );

  const handleDeselectCatastrophe = useCallback(
    (cardName: string) => {
      if (state.selectedCatastrophes.find((c) => c.name === cardName)) {
        dispatch({ type: 'TOGGLE_CATASTROPHE', cardName });
      }
    },
    [state.selectedCatastrophes]
  );

  return (
    <div className="app-root">
      <BetaBanner />
      <div className="game-main-column">
        <div className="app-hero">
          <Header state={state} dispatch={dispatch} />
        </div>
        <div
          className={`players-strip-sticky${state.mobileAddingForPlayer !== null ? ' players-strip-sticky--mobile-adding' : ''}`}
          data-tour="players"
        >
          <PlayerSection
            state={state}
            dispatch={dispatch}
            gameScore={gameScore}
            onOpenCardPreview={(name) => setMobilePreviewCard(name)}
          />
        </div>
        <div
          className={`game-container${state.selectedPlayerId !== null ? ' game-container--deck-visible' : ''}`}
        >
          <div className="desk-row" data-tour="card-preview">
            <PackDisplay
              state={state}
              dispatch={dispatch}
              cards={cardsMap}
              onClickCard={handleClickCard}
              onClickCatastrophe={handleClickCatastrophe}
              onDeselectCatastrophe={handleDeselectCatastrophe}
              onOpenCardPreview={(name) => setMobilePreviewCard(name)}
            />
            <CardZoom cardName={state.hoveredCard} />
          </div>

          <AppFooter
            onOpenScoringLogs={() => dispatch({ type: 'OPEN_SCORING_LOGS' })}
            scoringLogsDisabled={!gameScore}
            scoringLogsTitle={
              gameScore
                ? 'View detailed scoring logs'
                : 'Add cards to see scoring logs'
            }
            onOpenContact={() => setContactModalOpen(true)}
            onOpenLicense={() => setLicenseModalOpen(true)}
            onOpenHowToUse={() => setOnboardingOpen(true)}
          />

          {contactModalOpen && (
            <EmailContactModal
              mode="contact"
              onClose={() => setContactModalOpen(false)}
            />
          )}
          {licenseModalOpen && (
            <LicenseModal onClose={() => setLicenseModalOpen(false)} />
          )}

          {state.scoringLogsModalOpen && (
            <ScoringLogsModal state={state} dispatch={dispatch} cards={cardsMap} />
          )}

          <MetadataModal state={state} gameScore={gameScore} dispatch={dispatch} cards={cardsMap}/>

          {mobilePreviewCard !== null && (
            <CardPreviewModal
              cardName={mobilePreviewCard}
              onClose={() => setMobilePreviewCard(null)}
            />
          )}

          {onboardingOpen && (
            <OnboardingTour
              open={onboardingOpen}
              onClose={() => setOnboardingOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
