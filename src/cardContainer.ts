export interface Card {
  name: string;
  pointsA: number;
  pointsB?(): number;
  pointsC?(): number;
}

const unknownCard: Card = {
  name: "unknown",
  pointsA: 0
}

class Cards {
  cards: Map<string, Card> = new Map()

  addCard(card: Card): void {
    this.cards.set(card.name, card)
  }

  findCard(name: string): Card {
    return this.cards.get(name) || unknownCard
  }
}

export const cards = new Cards()
