import { useMemo } from 'react';
import { Scorer, GameScore } from '@scorer/scorer';
import type { PlayerState } from '../types';
import type { PlayerInput } from '@scorer/types';

export interface CatastropheState {
  name: string;
  metadata: Record<string, string | number | string[]>;
}

export function useScorer(
  players: PlayerState[],
  selectedCatastrophes: string[],
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >
): GameScore | null {
  return useMemo(() => {
    // Need at least one player with cards to score
    const hasAnyCards = players.some((p) => p.cards.length > 0);
    if (!hasAnyCards) return null;

    try {
      const playerCards = players.map((p) => p.cards.map((c) => ({ ...c })));
      const scorer = new Scorer(...playerCards);

      if (selectedCatastrophes.length > 0) {
        const catastropheInputs: PlayerInput[] = selectedCatastrophes.map(
          (name) => ({
            name,
            ...catastropheMetadata[name]
          })
        );
        scorer.addCatastrophes(catastropheInputs);
      }

      return scorer.scores();
    } catch (e) {
      console.error('Scoring error:', e);
      return null;
    }
  }, [players, selectedCatastrophes, catastropheMetadata]);
}
