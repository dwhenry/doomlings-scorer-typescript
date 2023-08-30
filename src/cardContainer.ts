export interface Card {
  name: string;
  type: string,
  pointsA: number;
  pointsB?(): number;
  pointsC?(playerCards: Array<CardInstance>, oponentCards: Array<Array<CardInstance>>): number;
}

export interface CardInstance {
  card: Card;
  traitPoints: number;
}

const unknownCard: Card = {
  name: "unknown",
  type: 'none',
  pointsA: 0
}

let cardsMap: Map<string, Card> = new Map()

function findCard(name: string): Card {
  return cardsMap.get(name) || unknownCard
}

export function addCard(card: Card) {
  cardsMap.set(card.name, card)
}

export function getCard(name: string): CardInstance {
  return {
    card: findCard(name),
    traitPoints: 0
  }
}
