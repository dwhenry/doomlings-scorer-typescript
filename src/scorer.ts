import { CardInstance, getCard } from "./cardContainer"
import './cards'

export class Scorer {
  // Properties
  p1Cards: CardInstance[];
  p2Cards: CardInstance[];
  p3Cards: CardInstance[];
  p4Cards: CardInstance[];
  playersCards: Array<Array<CardInstance>>

  constructor(p1Cards: string, p2Cards: string, p3Cards: string, p4Cards: string) {
    this.p1Cards = p1Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p2Cards = p2Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p3Cards = p3Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p4Cards = p4Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.playersCards = [
      this.p1Cards,
      this.p2Cards,
      this.p3Cards,
      this.p4Cards
    ]

  }

  // Functions
  scores(): number[] {
    this.playersCards.forEach((playerCards) => {
      playerCards.forEach((inst: CardInstance) => {
        inst.card.calcB?.()
        inst.card.calcC?.(this.playersCards)
      })
    })

    const result: number[] = this.playersCards.map((playerCards) => {
      return playerCards.reduce((sum, inst: CardInstance) => sum + inst.finalA + inst.finalB || 0, 0)
    })

    return result
  }
}