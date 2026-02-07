import { useMemo } from 'react';
import { Scorer, GameScore } from '@scorer/scorer';
import type { PlayerState } from '../types';

export function useScorer(
  players: PlayerState[],
  selectedCatastrophes: string[]
): GameScore | null {
  return useMemo(() => {
    // Need at least one player with cards to score
    const hasAnyCards = players.some((p) => p.cards.length > 0);
    if (!hasAnyCards) return null;

    try {
      const playerCards = players.map((p) => p.cards.map((c) => ({ ...c })));
      const scorer = new Scorer(...playerCards);

      if (selectedCatastrophes.length > 0) {
        scorer.addCatastrophes(
          selectedCatastrophes.map((name) => ({ name }))
        );
      }

      return scorer.scores();
    } catch (e) {
      console.error('Scoring error:', e);
      return null;
    }
  }, [players, selectedCatastrophes]);
}
