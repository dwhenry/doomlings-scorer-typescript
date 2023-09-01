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
    this.playersCards = [
      this.p1Cards = this.buildCardInsts(p1Cards),
      this.p2Cards = this.buildCardInsts(p2Cards),
      this.p3Cards = this.buildCardInsts(p3Cards),
      this.p4Cards = this.buildCardInsts(p4Cards)
      ]

  }

  // Functions
  scores(): number[] {
    this.playersCards.forEach((playerCards) => {
      playerCards.forEach((inst: CardInstance) => {
        if(typeof inst.card.pointsA === 'function') {
          inst.finalA = inst.card.pointsA(inst)
        } else {
          inst.finalA = inst.card.pointsA
        }
        inst.card.calcB?.()
        inst.card.calcC?.(this.playersCards)
      })
    })

    const result: number[] = this.playersCards.map((playerCards) => {
      return playerCards.reduce((sum, inst: CardInstance) => sum + inst.finalA + inst.finalB || 0, 0)
    })

    return result
  }

  buildCardInsts(cards: string): CardInstance[] {
    return cards.split(',').filter(a => a).map((name) => {
      let realName: string, metadata: string[]
      [realName, ...metadata] = name.split('+')
      let metadataValues: Array<string[]> = metadata.map((str) => str.split('=', 2))
      const card = getCard(realName, metadataValues)
      return card
    })

  }
}