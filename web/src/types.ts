import type { Card, CardType, PackType } from '@scorer/types';

export interface PlayerState {
  id: number;
  name: string;
  cards: CardEntry[];
}

export interface CardEntry {
  name: string;
  [key: string]: string | number | string[];
}

export interface CardGroup {
  name: string;
  count: number;
  totalScore: number | null;
  perCardScores: Array<{
    finalA: number;
    finalB: number | undefined;
    total: number | undefined;
    discarded?: boolean;
  }>;
  hasMetadata: boolean;
  metadataMissing: boolean;
  cardIndices: number[];
  discardedIndices: number[];
}

export interface ModalState {
  playerId: number;
  cardIndex: number;
  cardName: string;
}

export interface CatastropheModalState {
  cardName: string;
}

/** Serializable game state for export/import */
export const GAME_STATE_EXPORT_VERSION = 1;

export interface GameStateExport {
  version: number;
  exportedAt: string;
  players: PlayerState[];
  selectedCatastrophes: CardEntry[];
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >;
  selectedPacks?: string[];
}

export type { Card, CardType, PackType };
