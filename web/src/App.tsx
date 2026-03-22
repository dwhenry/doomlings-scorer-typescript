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
import CardZoom from './components/CardZoom';
import MetadataModal from './components/MetadataModal';
import ScoringLogsModal from './components/ScoringLogsModal';
import AppFooter from './components/AppFooter';
import BetaBanner from './components/BetaBanner';
import EmailContactModal from './components/EmailContactModal';
import LicenseModal from './components/LicenseModal';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [cardsMap, setCardsMap] = useState<Map<string, Card>>(new Map());

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

  // Adjust padding for fixed top (beta banner + header)
  useEffect(() => {
    function adjustPadding() {
      const shell = document.querySelector(
        '.site-top-fixed'
      ) as HTMLElement | null;
      const container = document.querySelector(
        '.game-container'
      ) as HTMLElement | null;
      if (shell && container) {
        container.style.paddingTop = `${shell.offsetHeight + 20}px`;
      }
    }
    adjustPadding();
    window.addEventListener('resize', adjustPadding);
    const timer = setTimeout(adjustPadding, 100);
    return () => {
      window.removeEventListener('resize', adjustPadding);
      clearTimeout(timer);
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

  const handleDropCard = useCallback(
    (playerId: number, cardName: string) => {
      const player = state.players.find((p) => p.id === playerId);
      const newCardIndex = player ? player.cards.length : 0;
      dispatch({ type: 'ADD_CARD', playerId, cardName });
      // Auto-open modal only for cards with user-editable metadata
      const editableFields = getEditableMetadataFields(cardName);
      if (editableFields.length > 0) {
        const allNonCard = editableFields.every((f) => f.scope !== 'card');
        const hasExistingSource =
          allNonCard &&
          state.players.some(
            (p) =>
              (editableFields.some((f) => f.scope === 'global') ||
                p.id === playerId) &&
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
    [state.players]
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
    <div className="game-container">
      <CardZoom cardName={state.hoveredCard} />

      <div className="site-top-fixed">
        <BetaBanner />
        <Header state={state} dispatch={dispatch}>
          <PlayerSection
            state={state}
            dispatch={dispatch}
            onDropCard={handleDropCard}
            gameScore={gameScore}
          />
        </Header>
      </div>

      <PackDisplay
        state={state}
        dispatch={dispatch}
        cards={cardsMap}
        onClickCard={handleClickCard}
        onClickCatastrophe={handleClickCatastrophe}
        onDeselectCatastrophe={handleDeselectCatastrophe}
      />

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
    </div>
  );
}
