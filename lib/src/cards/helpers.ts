import { CardInstance, CardType, CollectionType, PLAYER_CARD_NAME } from '../types';

/** True if the card is the special per-player card (not a trait; used for catastrophe player-level points). */
export function isPlayerCard(card: CardInstance): boolean {
  return card.card.name === PLAYER_CARD_NAME;
}

/** Filter: active trait cards only (excludes discarded and the player card). Same filtering as discards. */
function activeTraitCards(cards: CardInstance[]): CardInstance[] {
  return cards.filter((card) => !card.discarded && !isPlayerCard(card));
}

export const filterCardsByType = (
  cards: CardInstance[],
  type: CardType
): CardInstance[] => {
  return cards.filter(
    (card) => !card.discarded && !isPlayerCard(card) && card.card.type.includes(type)
  );
};

export const filterCardsByCollection = (
  cards: CardInstance[],
  collection: CollectionType
): CardInstance[] => {
  return cards.filter(
    (card) => !card.discarded && !isPlayerCard(card) && card.card.collection === collection
  );
};

export const forEachPlayerCards = (
  allPlayerCards: Array<Array<CardInstance>>,
  callback: (cards: CardInstance[], i: number) => void
) => {
  allPlayerCards.forEach((playerCards, i) => {
    callback(activeTraitCards(playerCards), i);
  });
};

export const playerCards = (
  allPlayerCards: Array<Array<CardInstance>>,
  i: number
): CardInstance[] => {
  return activeTraitCards(allPlayerCards[i]);
};

/** Returns the special player card for a given player (for catastrophe player-level points). */
export function getPlayerCard(
  allPlayerCards: Array<Array<CardInstance>>,
  playerIndex: number
): CardInstance | undefined {
  return allPlayerCards[playerIndex]?.find((c) => isPlayerCard(c));
}
