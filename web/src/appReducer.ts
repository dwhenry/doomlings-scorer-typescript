import { CardScore } from '@scorer/scorer';
import { PLAYER_CARD_NAME } from '@scorer/types';
import type {
  CardEntry,
  CatastropheModalState,
  GameStateExport,
  ModalState,
  PlayerState
} from './types';
import { getCardMetadataFields } from './utils/cardMetadata';

export const GAME_STATE_STORAGE_KEY = 'doomlings-scorer-game-state';

function isValidPersistedState(data: unknown): data is GameStateExport {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.version === 'number' &&
    Array.isArray(o.players) &&
    (o.selectedReleases === undefined || Array.isArray(o.selectedReleases)) &&
    (o.selectedCollections === undefined || Array.isArray(o.selectedCollections))
  );
}

export interface AppState {
  players: PlayerState[];
  selectedPlayerId: number | null;
  selectedReleases: string[];
  selectedCollections: string[];
  playerCount: number;
  selectedCatastrophes: CardEntry[];
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >;
  hoveredCard: string | null;
  modal: ModalState | null;
  catastropheModal: CatastropheModalState | null;
  mobileAddingForPlayer: number | null;
  scoringLogsModalOpen: boolean;
}

export type Action =
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'SELECT_PLAYER'; id: number }
  | { type: 'ADD_CARD'; playerId: number; cardName: string }
  | { type: 'REMOVE_CARD'; playerId: number; cardIndex: number }
  | {
      type: 'SET_RELEASE_COLLECTION_FILTER';
      releases: string[];
      collections: string[];
    }
  | { type: 'TOGGLE_CATASTROPHE'; cardName: string }
  | { type: 'SET_HOVERED'; cardName: string | null }
  | {
      type: 'OPEN_MODAL';
      playerId: number;
      cardIndex: number;
      cardName: string;
    }
  | { type: 'OPEN_CATASTROPHE_MODAL'; cardName: string }
  | { type: 'CLOSE_MODAL' }
  | {
      type: 'UPDATE_CARD_METADATA';
      payload: {
        playerId: number;
        cardIndex: number;
        cardName: string;
        values: Record<string, string | number | string[]>;
        scope: string;
      };
    }
  | {
      type: 'UPDATE_CATASTROPHE_CARD_METADATA';
      payload: {
        cardName: string;
        values: Record<string, string | number | string[]>;
      };
    }
  | { type: 'CLEAR_PLAYER_CARD_METADATA_ERROR'; modal: ModalState }
  | {
      type: 'CLEAR_CATASTROPHE_CARD_METADATA_ERROR';
      catastropheModal: CatastropheModalState;
    }
  | {
      type: 'UPDATE_CATASTROPHE_METADATA';
      metadata: Record<string, Record<string, string | number | string[]>>;
    }
  | {
      type: 'UPDATE_PLAYER_CARD_METADATA';
      metadata: { card: CardScore; playerIndex: number; cardIndex: number }[];
    }
  | { type: 'START_ADDING_FOR_PLAYER'; playerId: number }
  | { type: 'STOP_ADDING' }
  | { type: 'OPEN_SCORING_LOGS' }
  | { type: 'CLOSE_SCORING_LOGS' }
  | { type: 'IMPORT_GAME_STATE'; payload: GameStateExport }
  | { type: 'NEW_GAME' }
  | { type: 'NEW_GAME_WITH_PLAYER_COUNT'; count: 2 | 3 | 4 };

function createPlayers(count: number): PlayerState[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    cards: [{ name: PLAYER_CARD_NAME }]
  }));
}

function getDefaultState(): AppState {
  return {
    players: createPlayers(2),
    selectedPlayerId: null,
    selectedReleases: [],
    selectedCollections: [],
    playerCount: 2,
    selectedCatastrophes: [],
    catastropheMetadata: {},
    hoveredCard: null,
    catastropheModal: null,
    modal: null,
    mobileAddingForPlayer: null,
    scoringLogsModalOpen: false
  };
}

function applyMetadataByScope(
  players: PlayerState[],
  playerId: number,
  cardIndex: number,
  cardName: string,
  values: Record<string, string | number | string[]>,
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

export function reducer(state: AppState, action: Action): AppState {
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
      const entry: CardEntry = { name: action.cardName };

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
      const targetPlayer = state.players.find((p) => p.id === action.playerId);
      const targetCard = targetPlayer?.cards[action.cardIndex];
      if (targetCard?.name === PLAYER_CARD_NAME) {
        return state;
      }
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
    case 'SET_RELEASE_COLLECTION_FILTER':
      return {
        ...state,
        selectedReleases: action.releases,
        selectedCollections: action.collections
      };
    case 'TOGGLE_CATASTROPHE': {
      const has = state.selectedCatastrophes.find(
        (c) => c.name === action.cardName
      );
      const newCatastrophes = has
        ? state.selectedCatastrophes.filter((n) => n.name !== action.cardName)
        : [...state.selectedCatastrophes, { name: action.cardName }];
      // Clean up metadata for removed catastrophes
      const newCatMeta = { ...state.catastropheMetadata };
      let currentState = { ...state };
      if (has) {
        delete newCatMeta[action.cardName];
      }
      return {
        ...currentState,
        selectedCatastrophes: newCatastrophes,
        catastropheMetadata: newCatMeta
      };
    }
    case 'SET_HOVERED':
      return { ...state, hoveredCard: action.cardName };
    case 'OPEN_MODAL':
      return {
        ...state,
        selectedPlayerId:
          state.selectedPlayerId === null ? action.playerId : state.selectedPlayerId,
        modal: {
          playerId: action.playerId,
          cardIndex: action.cardIndex,
          cardName: action.cardName
        }
      };
    case 'OPEN_CATASTROPHE_MODAL':
      return {
        ...state,
        catastropheModal: {
          cardName: action.cardName
        }
      };
    case 'CLOSE_MODAL': {
      let next = { ...state, modal: null, catastropheModal: null };
      if (state.modal) {
        const player = state.players.find((p) => p.id === state.modal!.playerId);
        const card = player?.cards[state.modal.cardIndex];
        if (card?.error !== undefined) {
          next = {
            ...next,
            players: next.players.map((p) => {
              if (p.id !== state.modal!.playerId) return p;
              return {
                ...p,
                cards: p.cards.map((c, i) => {
                  if (i !== state.modal!.cardIndex) return c;
                  const copy = { ...c };
                  delete copy.error;
                  return copy;
                })
              };
            })
          };
        }
      }
      if (state.catastropheModal) {
        const cat = state.selectedCatastrophes.find(
          (c) => c.name === state.catastropheModal!.cardName
        );
        if (cat?.error !== undefined) {
          next = {
            ...next,
            selectedCatastrophes: next.selectedCatastrophes.map((c) => {
              if (c.name !== state.catastropheModal!.cardName) return c;
              const copy = { ...c };
              delete copy.error;
              return copy;
            })
          };
        }
      }
      return next;
    }
    case 'UPDATE_CARD_METADATA': {
      const { playerId, cardIndex, cardName, values, scope } = action.payload;
      return {
        ...state,
        players: applyMetadataByScope(
          state.players,
          playerId,
          cardIndex,
          cardName,
          values,
          scope
        ),
        modal: null
      };
    }
    case 'UPDATE_CATASTROPHE_CARD_METADATA': {
      const { cardName, values } = action.payload;
      const selectedCatastrophes = state.selectedCatastrophes.map(
        (selectedCatastrophe) => {
          if (selectedCatastrophe.name === cardName) {
            return {
              ...selectedCatastrophe,
              ...values
            };
          }
          return selectedCatastrophe;
        }
      );

      return {
        ...state,
        selectedCatastrophes,
        catastropheModal: null
      };
    }
    case 'CLEAR_PLAYER_CARD_METADATA_ERROR': {
      const { playerId, cardIndex } = action.modal;
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            cards: p.cards.map((c, i) => {
              if (i !== cardIndex) return c;
              const next = { ...c };
              delete next.error;
              return next;
            })
          };
        })
      };
    }
    case 'CLEAR_CATASTROPHE_CARD_METADATA_ERROR': {
      const { cardName } = action.catastropheModal;
      return {
        ...state,
        selectedCatastrophes: state.selectedCatastrophes.map((c) => {
          if (c.name !== cardName) return c;
          const next = { ...c };
          delete next.error;
          return next;
        })
      };
    }
    case 'UPDATE_CATASTROPHE_METADATA':
      return {
        ...state,
        catastropheMetadata: action.metadata
      };
    case 'UPDATE_PLAYER_CARD_METADATA': {
      let currentState = state;
      action.metadata.forEach(({ card, playerIndex, cardIndex }) => {
        currentState = {
          ...currentState,
          players: currentState.players.map((p, i) => {
            if (i !== playerIndex) return p;
            return {
              ...p,
              cards: p.cards.map((c, i) => {
                if (i !== cardIndex) return c;
                let updatedCard = { ...c };
                card.generatedMetadata;
                if (card.generatedMetadata) {
                  Object.keys(card.generatedMetadata).forEach((key) => {
                    if (card.generatedMetadata![key] === '') {
                      delete updatedCard[key];
                    } else {
                      updatedCard[key] = card.generatedMetadata![key];
                    }
                  });
                }
                return updatedCard;
              })
            };
          })
        };
      });
      return { ...currentState };
    }

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
    case 'OPEN_SCORING_LOGS':
      return { ...state, scoringLogsModalOpen: true };
    case 'CLOSE_SCORING_LOGS':
      return { ...state, scoringLogsModalOpen: false };
    case 'IMPORT_GAME_STATE': {
      const { payload } = action;
      const players = payload.players.map((p, i) => {
        const cards = Array.isArray(p.cards) ? p.cards : [];
        const hasPlayerCard = cards.some((c) => c.name === PLAYER_CARD_NAME);
        const normalizedCards = hasPlayerCard ? cards : [{ name: PLAYER_CARD_NAME }, ...cards];
        return {
          ...p,
          id: i,
          name: p.name ?? `Player ${i + 1}`,
          cards: normalizedCards
        };
      });
      const playerCount = players.length;
      return {
        ...state,
        players,
        playerCount,
        selectedCatastrophes: Array.isArray(payload.selectedCatastrophes)
          ? payload.selectedCatastrophes
          : [],
        catastropheMetadata:
          payload.catastropheMetadata &&
          typeof payload.catastropheMetadata === 'object'
            ? payload.catastropheMetadata
            : {},
        selectedReleases: payload.selectedReleases ?? [],
        selectedCollections: payload.selectedCollections ?? [],
        selectedPlayerId: null,
        modal: null,
        catastropheModal: null,
        mobileAddingForPlayer: null,
        scoringLogsModalOpen: false
      };
    }
    case 'NEW_GAME':
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      return getDefaultState();
    case 'NEW_GAME_WITH_PLAYER_COUNT': {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      const count = action.count;
      return {
        ...getDefaultState(),
        playerCount: count,
        players: createPlayers(count)
      };
    }
    default:
      return state;
  }
}

export function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) return getDefaultState();
    const data = JSON.parse(raw) as unknown;
    if (!isValidPersistedState(data)) return getDefaultState();
    const players = data.players.map(
      (p: PlayerState & { name?: string; cards?: CardEntry[] }, i: number) => {
        const cards = Array.isArray(p.cards) ? p.cards : [];
        const hasPlayerCard = cards.some((c) => c.name === PLAYER_CARD_NAME);
        const normalizedCards = hasPlayerCard ? cards : [{ name: PLAYER_CARD_NAME }, ...cards];
        return {
          ...p,
          id: i,
          name: p.name ?? `Player ${i + 1}`,
          cards: normalizedCards
        };
      }
    );
    const playerCount = players.length;
    return {
      ...getDefaultState(),
      players,
      playerCount,
      selectedCatastrophes: Array.isArray(data.selectedCatastrophes)
        ? data.selectedCatastrophes
        : [],
      catastropheMetadata:
        data.catastropheMetadata &&
        typeof data.catastropheMetadata === 'object'
          ? data.catastropheMetadata
          : {},
      selectedReleases: data.selectedReleases ?? [],
      selectedCollections: data.selectedCollections ?? []
    };
  } catch {
    return getDefaultState();
  }
}
