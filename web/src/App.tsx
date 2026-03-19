import {
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { allCards } from '@scorer/cardContainer';
import {
  cardMatchesReleases,
  cardMatchesCollections
} from '@scorer/releaseCollection';
import '@scorer/cards';
import type { Card, GameStateExport } from './types';
import { GAME_STATE_EXPORT_VERSION } from './types';
import {
  GAME_STATE_STORAGE_KEY,
  getInitialState,
  reducer,
  type AppState
} from './appReducer';
import { useScorer } from './hooks/useScorer';
import { getEditableMetadataFields } from './utils/cardMetadata';
import Header from './components/Header';
import PlayerSection from './components/PlayerSection';
import PackDisplay from './components/PackDisplay';
import CardZoom from './components/CardZoom';
import MetadataModal from './components/MetadataModal';
import ScoringLogsModal from './components/ScoringLogsModal';

function stateToExport(state: AppState): GameStateExport {
  return {
    version: GAME_STATE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    players: state.players,
    selectedCatastrophes: state.selectedCatastrophes,
    catastropheMetadata: state.catastropheMetadata,
    selectedReleases: state.selectedReleases,
    selectedCollections: state.selectedCollections
  };
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [cardsMap, setCardsMap] = useState<Map<string, Card>>(new Map());

  useEffect(() => {
    setCardsMap(allCards());
  }, []);

  // Persist game state so refresh restores it; only reset when user clicks "New Game"
  useEffect(() => {
    const payload = stateToExport(state);
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(payload));
  }, [
    state.players,
    state.playerCount,
    state.selectedCatastrophes,
    state.catastropheMetadata,
    state.selectedReleases,
    state.selectedCollections
  ]);

  // Adjust padding for fixed header
  useEffect(() => {
    function adjustPadding() {
      const header = document.querySelector(
        '.game-header'
      ) as HTMLElement | null;
      const container = document.querySelector(
        '.game-container'
      ) as HTMLElement | null;
      if (header && container) {
        container.style.paddingTop = `${header.offsetHeight + 20}px`;
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
    state.catastropheMetadata
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

  const handleRemoveCard = useCallback(
    (playerId: number, cardIndex: number) => {
      dispatch({ type: 'REMOVE_CARD', playerId, cardIndex });
    },
    []
  );

  const handleOpenModal = useCallback(
    (playerId: number, cardIndex: number, cardName: string) => {
      dispatch({ type: 'OPEN_MODAL', playerId, cardIndex, cardName });
    },
    []
  );

  const handleSelectPlayer = useCallback((id: number) => {
    dispatch({ type: 'SELECT_PLAYER', id });
  }, []);

  const handleNewGame = useCallback(() => {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const handleStartAdding = useCallback((playerId: number) => {
    dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId });
  }, []);

  const handleStopAdding = useCallback(() => {
    dispatch({ type: 'STOP_ADDING' });
  }, []);

  const handleHover = useCallback((cardName: string | null) => {
    dispatch({ type: 'SET_HOVERED', cardName });
  }, []);

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

      <Header
        selectedReleases={state.selectedReleases}
        selectedCollections={state.selectedCollections}
        onReleaseCollectionFilterChange={(releases, collections) =>
          dispatch({ type: 'SET_RELEASE_COLLECTION_FILTER', releases, collections })
        }
        playerCount={state.playerCount}
        onPlayerCountChange={(count) =>
          dispatch({ type: 'SET_PLAYER_COUNT', count })
        }
        onNewGame={handleNewGame}
      >
        <PlayerSection
          state={state}
          onSelectPlayer={handleSelectPlayer}
          onStartAdding={handleStartAdding}
          onStopAdding={handleStopAdding}
          onRemoveCard={handleRemoveCard}
          onOpenModal={handleOpenModal}
          onHover={handleHover}
          onDropCard={handleDropCard}
          gameScore={gameScore}
          cardsMap={cardsMap}
        />
      </Header>

      <PackDisplay
        cards={cardsMap}
        playerCount={state.playerCount}
        selectedReleases={state.selectedReleases}
        selectedCollections={state.selectedCollections}
        cardMatchesReleases={cardMatchesReleases}
        cardMatchesCollections={cardMatchesCollections}
        selectedPlayerId={state.selectedPlayerId}
        mobileAddingForPlayer={state.mobileAddingForPlayer}
        onClickCard={handleClickCard}
        onHover={handleHover}
        selectedCatastrophes={state.selectedCatastrophes}
        onClickCatastrophe={handleClickCatastrophe}
        onDeselectCatastrophe={handleDeselectCatastrophe}
      />

      <footer className="scoring-logs-footer">
        <button
          type="button"
          className="scoring-logs-footer-btn"
          onClick={() => dispatch({ type: 'OPEN_SCORING_LOGS' })}
          disabled={!gameScore}
          title={
            gameScore
              ? 'View detailed scoring logs'
              : 'Add cards to see scoring logs'
          }
        >
          View scoring logs
        </button>
      </footer>

      {state.scoringLogsModalOpen && (
        <ScoringLogsModal
          players={state.players}
          selectedCatastrophes={state.selectedCatastrophes}
          catastropheMetadata={state.catastropheMetadata}
          selectedReleases={state.selectedReleases}
          selectedCollections={state.selectedCollections}
          onClose={() => dispatch({ type: 'CLOSE_SCORING_LOGS' })}
          onImport={(payload) =>
            dispatch({ type: 'IMPORT_GAME_STATE', payload })
          }
        />
      )}

      <MetadataModal state={state} gameScore={gameScore} dispatch={dispatch} />
    </div>
  );
}
