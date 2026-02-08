import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { allCards } from '@scorer/cardContainer';
import { PACK_TYPES } from '@scorer/types';
import '@scorer/cards';
import type { Card, ModalState } from './types';
import type { PlayerState, PlayerCardEntry } from './types';
import { useScorer } from './hooks/useScorer';
import {
  getCardMetadataFields,
  getEditableMetadataFields,
  getInternalMetadataFields
} from './utils/cardMetadata';
import Header from './components/Header';
import PlayerSection from './components/PlayerSection';
import PackDisplay from './components/PackDisplay';
import CardZoom from './components/CardZoom';
import MetadataModal from './components/MetadataModal';

// State
interface AppState {
  players: PlayerState[];
  selectedPlayerId: number | null;
  selectedPacks: string[];
  playerCount: number;
  selectedCatastrophes: string[];
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >;
  hoveredCard: string | null;
  modal: ModalState | null;
  mobileAddingForPlayer: number | null;
}

type Action =
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'SELECT_PLAYER'; id: number }
  | { type: 'ADD_CARD'; playerId: number; cardName: string }
  | { type: 'REMOVE_CARD'; playerId: number; cardIndex: number }
  | { type: 'SET_PACKS'; packs: string[] }
  | { type: 'TOGGLE_CATASTROPHE'; cardName: string }
  | { type: 'SET_HOVERED'; cardName: string | null }
  | {
      type: 'OPEN_MODAL';
      playerId: number;
      cardIndex: number;
      cardName: string;
    }
  | { type: 'CLOSE_MODAL' }
  | {
      type: 'UPDATE_CARD_METADATA';
      playerId: number;
      cardIndex: number;
      cardName: string;
      values: Record<string, string | number>;
      scope: string;
    }
  | {
      type: 'UPDATE_CATASTROPHE_METADATA';
      metadata: Record<string, Record<string, string | number | string[]>>;
    }
  | { type: 'START_ADDING_FOR_PLAYER'; playerId: number }
  | { type: 'STOP_ADDING' };

function createPlayers(count: number): PlayerState[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    cards: []
  }));
}

function applyMetadataByScope(
  players: PlayerState[],
  playerId: number,
  cardIndex: number,
  cardName: string,
  values: Record<string, string | number>,
  scope: string
): PlayerState[] {
  return players.map((p) => {
    if (scope === 'card') {
      if (p.id !== playerId) return p;
      return {
        ...p,
        cards: p.cards.map((c, i) =>
          i === cardIndex ? { ...c, ...values } : c
        )
      };
    }
    if (scope === 'player') {
      if (p.id !== playerId) return p;
      return {
        ...p,
        cards: p.cards.map((c) =>
          c.name === cardName ? { ...c, ...values } : c
        )
      };
    }
    // global: update all players
    return {
      ...p,
      cards: p.cards.map((c) => (c.name === cardName ? { ...c, ...values } : c))
    };
  });
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PLAYER_COUNT': {
      const count = action.count;
      const players = createPlayers(count).map((newPlayer, i) => {
        if (i < state.players.length) {
          return { ...state.players[i], id: i };
        }
        return newPlayer;
      });
      return {
        ...state,
        playerCount: count,
        players,
        selectedPlayerId:
          state.selectedPlayerId !== null && state.selectedPlayerId < count
            ? state.selectedPlayerId
            : null
      };
    }
    case 'SELECT_PLAYER':
      return {
        ...state,
        selectedPlayerId:
          state.selectedPlayerId === action.id ? null : action.id
      };
    case 'ADD_CARD': {
      const fields = getCardMetadataFields(action.cardName);
      const editableFields = fields.filter((f) => f.scope !== 'internal');
      const entry: PlayerCardEntry = { name: action.cardName };

      // For player/global scoped metadata, copy values from existing cards
      if (editableFields.length > 0) {
        const allSameScope = editableFields.every((f) => f.scope !== 'card');
        if (allSameScope) {
          // we can pull the metadata from any card that has the same field
          // for global scope we can pull from any card
          // for player scope we can pull from any card in the current player
          editableFields.forEach((f) => {
            if (f.scope === 'global') {
              const sourceCard = state.players
                .map((p) => p.cards.find((c) => c[f.key]))
                .filter((c) => c !== undefined)[0];

              if (sourceCard) {
                entry[f.key] = sourceCard[f.key];
              }
            } else if (f.scope === 'player') {
              const sourceCard = state.players
                .find((p) => p.id === action.playerId)
                ?.cards.find((c) => c[f.key]);
              if (sourceCard) {
                entry[f.key] = sourceCard[f.key];
              }
            }
          });
        }
      }

      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId ? { ...p, cards: [...p.cards, entry] } : p
        )
      };
    }
    case 'REMOVE_CARD': {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p;
          const newCards = [...p.cards];
          newCards.splice(action.cardIndex, 1);
          return { ...p, cards: newCards };
        }),
        modal:
          state.modal?.playerId === action.playerId &&
          state.modal?.cardIndex === action.cardIndex
            ? null
            : state.modal
      };
    }
    case 'SET_PACKS':
      return { ...state, selectedPacks: action.packs };
    case 'TOGGLE_CATASTROPHE': {
      const has = state.selectedCatastrophes.includes(action.cardName);
      const newCatastrophes = has
        ? state.selectedCatastrophes.filter((n) => n !== action.cardName)
        : [...state.selectedCatastrophes, action.cardName];
      // Clean up metadata for removed catastrophes
      const newCatMeta = { ...state.catastropheMetadata };
      if (has) {
        delete newCatMeta[action.cardName];
      }
      return {
        ...state,
        selectedCatastrophes: newCatastrophes,
        catastropheMetadata: newCatMeta
      };
    }
    case 'SET_HOVERED':
      return { ...state, hoveredCard: action.cardName };
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          playerId: action.playerId,
          cardIndex: action.cardIndex,
          cardName: action.cardName
        }
      };
    case 'CLOSE_MODAL':
      return { ...state, modal: null };
    case 'UPDATE_CARD_METADATA':
      return {
        ...state,
        players: applyMetadataByScope(
          state.players,
          action.playerId,
          action.cardIndex,
          action.cardName,
          action.values,
          action.scope
        ),
        modal: null
      };
    case 'UPDATE_CATASTROPHE_METADATA':
      return {
        ...state,
        catastropheMetadata: action.metadata
      };
    case 'START_ADDING_FOR_PLAYER':
      return {
        ...state,
        selectedPlayerId: action.playerId,
        mobileAddingForPlayer: action.playerId
      };
    case 'STOP_ADDING':
      return {
        ...state,
        selectedPlayerId: null,
        mobileAddingForPlayer: null
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  players: createPlayers(2),
  selectedPlayerId: null,
  selectedPacks: ['Classic'],
  playerCount: 2,
  selectedCatastrophes: [],
  catastropheMetadata: {},
  hoveredCard: null,
  modal: null,
  mobileAddingForPlayer: null
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cardsMap, setCardsMap] = useState<Map<string, Card>>(new Map());

  useEffect(() => {
    setCardsMap(allCards());
  }, []);

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
    if (catGenMeta.length === 0) return;

    const newMeta: Record<
      string,
      Record<string, string | number | string[]>
    > = {};
    state.selectedCatastrophes.forEach((name, i) => {
      if (catGenMeta[i] && Object.keys(catGenMeta[i]).length > 0) {
        newMeta[name] = catGenMeta[i];
      }
    });

    // Only dispatch if the metadata actually changed (prevent infinite loop)
    const serialized = JSON.stringify(newMeta);
    if (serialized !== prevCatMetaRef.current) {
      prevCatMetaRef.current = serialized;
      dispatch({ type: 'UPDATE_CATASTROPHE_METADATA', metadata: newMeta });
    }
  }, [gameScore, state.selectedCatastrophes]);

  const openModalIfNeeded = useCallback(
    (playerId: number, cardIndex: number, cardName: string) => {
      const fields = getCardMetadataFields(cardName);
      if (fields.length > 0) {
        dispatch({ type: 'OPEN_MODAL', playerId, cardIndex, cardName });
      }
    },
    []
  );

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

  const handleStartAdding = useCallback((playerId: number) => {
    dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId });
  }, []);

  const handleStopAdding = useCallback(() => {
    dispatch({ type: 'STOP_ADDING' });
  }, []);

  const handleHover = useCallback((cardName: string | null) => {
    dispatch({ type: 'SET_HOVERED', cardName });
  }, []);

  const handleToggleCatastrophe = useCallback((cardName: string) => {
    dispatch({ type: 'TOGGLE_CATASTROPHE', cardName });
  }, []);

  const handleDeselectCatastrophe = useCallback(
    (cardName: string) => {
      if (state.selectedCatastrophes.includes(cardName)) {
        dispatch({ type: 'TOGGLE_CATASTROPHE', cardName });
      }
    },
    [state.selectedCatastrophes]
  );

  // Modal data - separate editable fields from internal
  const modalEditableFields = state.modal
    ? getEditableMetadataFields(state.modal.cardName)
    : [];
  const modalInternalFields = state.modal
    ? getInternalMetadataFields(state.modal.cardName)
    : [];
  const modalCard = state.modal
    ? state.players.find((p) => p.id === state.modal!.playerId)?.cards[
        state.modal.cardIndex
      ]
    : null;

  // Build internal values from generated metadata in game score
  const modalInternalValues: Record<string, string | number | string[]> = {};
  if (state.modal && gameScore && modalInternalFields.length > 0) {
    try {
      const playerIndex = state.players.findIndex(
        (p) => p.id === state.modal!.playerId
      );
      const genMeta = gameScore
        .getPlayerScore(playerIndex)
        .getGeneratedMetadata(state.modal.cardIndex);
      if (genMeta) {
        Object.assign(modalInternalValues, genMeta);
      }
    } catch {
      // Card may not have generated metadata
    }
  }

  // Determine the dominant scope for save propagation (only from editable fields)
  const modalScope =
    modalEditableFields.length > 0
      ? modalEditableFields.some((f) => f.scope === 'global')
        ? 'global'
        : modalEditableFields.some((f) => f.scope === 'player')
          ? 'player'
          : 'card'
      : 'card';

  // Show modal if there are any fields (editable or internal)
  const hasAnyModalFields =
    modalEditableFields.length > 0 || modalInternalFields.length > 0;

  return (
    <div className="game-container">
      <CardZoom cardName={state.hoveredCard} />

      <Header
        packs={[...PACK_TYPES]}
        selectedPacks={state.selectedPacks}
        onPacksChange={(packs) => dispatch({ type: 'SET_PACKS', packs })}
        playerCount={state.playerCount}
        onPlayerCountChange={(count) =>
          dispatch({ type: 'SET_PLAYER_COUNT', count })
        }
      >
        <PlayerSection
          players={state.players}
          selectedPlayerId={state.selectedPlayerId}
          mobileAddingForPlayer={state.mobileAddingForPlayer}
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
        selectedPacks={state.selectedPacks}
        selectedPlayerId={state.selectedPlayerId}
        mobileAddingForPlayer={state.mobileAddingForPlayer}
        onClickCard={handleClickCard}
        onHover={handleHover}
        selectedCatastrophes={state.selectedCatastrophes}
        onToggleCatastrophe={handleToggleCatastrophe}
        onDeselectCatastrophe={handleDeselectCatastrophe}
      />

      {state.modal && modalCard && hasAnyModalFields && (
        <MetadataModal
          cardName={state.modal.cardName}
          selectedCatastrophes={state.selectedCatastrophes}
          fields={modalEditableFields}
          internalFields={modalInternalFields}
          internalValues={modalInternalValues}
          currentValues={modalCard}
          onSave={(values) =>
            dispatch({
              type: 'UPDATE_CARD_METADATA',
              playerId: state.modal!.playerId,
              cardIndex: state.modal!.cardIndex,
              cardName: state.modal!.cardName,
              values,
              scope: modalScope
            })
          }
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        />
      )}
    </div>
  );
}
