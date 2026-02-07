import { useReducer, useEffect, useState, useCallback } from 'react';
import { allCards } from '@scorer/cardContainer';
import { PACK_TYPES } from '@scorer/types';
import '@scorer/cards';
import type { Card } from './types';
import type { PlayerState, PlayerCardEntry } from './types';
import { useScorer } from './hooks/useScorer';
import Header from './components/Header';
import PlayerSection from './components/PlayerSection';
import PackDisplay from './components/PackDisplay';
import CardZoom from './components/CardZoom';

// State
interface AppState {
  players: PlayerState[];
  selectedPlayerId: number | null;
  selectedPacks: string[];
  playerCount: number;
  selectedCatastrophes: string[];
  hoveredCard: string | null;
}

type Action =
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'SELECT_PLAYER'; id: number }
  | { type: 'ADD_CARD'; playerId: number; cardName: string }
  | { type: 'REMOVE_CARD'; playerId: number; cardName: string }
  | { type: 'SET_PACKS'; packs: string[] }
  | { type: 'TOGGLE_CATASTROPHE'; cardName: string }
  | { type: 'SET_HOVERED'; cardName: string | null };

function createPlayers(count: number): PlayerState[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    cards: [],
  }));
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PLAYER_COUNT': {
      const count = action.count;
      // Preserve existing players, trim or add as needed
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
            : null,
      };
    }
    case 'SELECT_PLAYER':
      return {
        ...state,
        selectedPlayerId:
          state.selectedPlayerId === action.id ? null : action.id,
      };
    case 'ADD_CARD': {
      const entry: PlayerCardEntry = { name: action.cardName };
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId
            ? { ...p, cards: [...p.cards, entry] }
            : p
        ),
      };
    }
    case 'REMOVE_CARD': {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p;
          const idx = p.cards.findIndex((c) => c.name === action.cardName);
          if (idx === -1) return p;
          const newCards = [...p.cards];
          newCards.splice(idx, 1);
          return { ...p, cards: newCards };
        }),
      };
    }
    case 'SET_PACKS':
      return { ...state, selectedPacks: action.packs };
    case 'TOGGLE_CATASTROPHE': {
      const has = state.selectedCatastrophes.includes(action.cardName);
      return {
        ...state,
        selectedCatastrophes: has
          ? state.selectedCatastrophes.filter((n) => n !== action.cardName)
          : [...state.selectedCatastrophes, action.cardName],
      };
    }
    case 'SET_HOVERED':
      return { ...state, hoveredCard: action.cardName };
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
  hoveredCard: null,
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
      const header = document.querySelector('.game-header') as HTMLElement | null;
      const container = document.querySelector('.game-container') as HTMLElement | null;
      if (header && container) {
        container.style.paddingTop = `${header.offsetHeight + 20}px`;
      }
    }
    adjustPadding();
    window.addEventListener('resize', adjustPadding);
    // Re-adjust when players change (header height may shift)
    const timer = setTimeout(adjustPadding, 100);
    return () => {
      window.removeEventListener('resize', adjustPadding);
      clearTimeout(timer);
    };
  }, [state.players, state.selectedPlayerId, state.playerCount]);

  const gameScore = useScorer(state.players, state.selectedCatastrophes);

  const handleClickCard = useCallback(
    (cardName: string) => {
      if (state.selectedPlayerId === null) return;
      dispatch({ type: 'ADD_CARD', playerId: state.selectedPlayerId, cardName });
    },
    [state.selectedPlayerId]
  );

  const handleDropCard = useCallback(
    (playerId: number, cardName: string) => {
      dispatch({ type: 'ADD_CARD', playerId, cardName });
    },
    []
  );

  const handleRemoveCard = useCallback(
    (playerId: number, cardName: string) => {
      dispatch({ type: 'REMOVE_CARD', playerId, cardName });
    },
    []
  );

  const handleSelectPlayer = useCallback((id: number) => {
    dispatch({ type: 'SELECT_PLAYER', id });
  }, []);

  const handleHover = useCallback((cardName: string | null) => {
    dispatch({ type: 'SET_HOVERED', cardName });
  }, []);

  const handleToggleCatastrophe = useCallback((cardName: string) => {
    dispatch({ type: 'TOGGLE_CATASTROPHE', cardName });
  }, []);

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
          onSelectPlayer={handleSelectPlayer}
          onRemoveCard={handleRemoveCard}
          onHover={handleHover}
          onDropCard={handleDropCard}
          gameScore={gameScore}
        />
      </Header>

      <PackDisplay
        cards={cardsMap}
        selectedPacks={state.selectedPacks}
        selectedPlayerId={state.selectedPlayerId}
        onClickCard={handleClickCard}
        onHover={handleHover}
        selectedCatastrophes={state.selectedCatastrophes}
        onToggleCatastrophe={handleToggleCatastrophe}
      />
    </div>
  );
}
