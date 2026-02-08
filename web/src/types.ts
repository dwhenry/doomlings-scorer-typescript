import type { Card, CardType, PackType } from '@scorer/types';

export interface PlayerState {
  id: number;
  name: string;
  cards: PlayerCardEntry[];
}

export interface PlayerCardEntry {
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

export type { Card, CardType, PackType };
