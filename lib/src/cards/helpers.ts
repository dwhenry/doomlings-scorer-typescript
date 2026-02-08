import { CardInstance, CardType, PackType } from "../types";

export const filterCardsByType = (cards: CardInstance[], type: CardType): CardInstance[] => {
  return cards.filter((card) => !card.discarded && card.card.type.includes(type));
}

export const filterCardByPack = (cards: CardInstance[], pack: PackType): CardInstance[] => {
  return cards.filter((card) => !card.discarded && card.card.pack === pack);
}

export const forEachPlayerCards = (allPlayerCards: Array<Array<CardInstance>>, callback: (cards: CardInstance[], i: number) => void) => {
  allPlayerCards.forEach((playerCards, i) => {
    const filteredCards = playerCards.filter((card) => !card.discarded)
    callback(filteredCards, i)
  })
}

export const playerCards = (allPlayerCards: Array<Array<CardInstance>>, i: number): CardInstance[] => {
  return allPlayerCards[i].filter((card) => !card.discarded)
}


