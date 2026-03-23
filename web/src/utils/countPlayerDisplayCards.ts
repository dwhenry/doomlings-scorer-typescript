import { PLAYER_CARD_NAME } from '@scorer/types';

/** Cards shown in the hand UI / tallies, excluding the synthetic player marker card. */
export function countPlayerDisplayCards(
  cards: ReadonlyArray<{ name: string }>
): number {
  return cards.filter((c) => c.name !== PLAYER_CARD_NAME).length;
}
