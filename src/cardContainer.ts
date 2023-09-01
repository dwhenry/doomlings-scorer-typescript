export interface Card {
  name: string;
  type: CardType,
  pointsA: number;
  calcB?(): number;
  calcC?(oplayersCards: Array<Array<CardInstance>>): void;
}

export interface CardInstance {
  card: Card;
  traitPoints: number;
  finalA: number;
  finalB: number;
}

const traitCardTypes = ['colourless', 'multi-colour', 'purple'] as const;
const costopheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [...traitCardTypes, ...costopheCardTypes, ...otherCardTypes] as const;
type CardType = typeof CardTypes[number];

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
  const card = findCard(name)
  return {
    card: card,
    traitPoints: 0,
    finalA: card.pointsA,
    finalB: 0
  }
}
