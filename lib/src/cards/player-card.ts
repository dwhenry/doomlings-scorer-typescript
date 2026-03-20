import { CALC_B_PHASES, CardInstance } from '../types';
import { addCard } from '../cardContainer';
import { PLAYER_CARD_NAME } from '../types';

/**
 * Special per-player card: not visible in UI, cannot be removed.
 * Used by catastrophes (e.g. GREY GOO, OVERPOPULATION) to apply points to the player.
 * Has no colour/pack; filtered out with discards so it does not affect scoring.
 */
addCard({
  name: PLAYER_CARD_NAME,
  type: ['none'],
  calcBRunPhase: CALC_B_PHASES.POST_CATASTROPHE,
  blocksDiscarding: false,
  calcA: (
    _inst: CardInstance,
    _allPlayerCards: Array<Array<CardInstance>>,
    _currentPlayer: number
  ): void => {
    // No-op: player card does not contribute to phase A/B
  }
});
