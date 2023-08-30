import { Card, cards } from "./cardContainer"
import './cards'

export class Scorer {
  // Properties
  p1Cards: Card[];
  p2Cards: Card[];
  p3Cards: Card[];
  p4Cards: Card[];

  constructor(p1Cards: string, p2Cards: string, p3Cards: string, p4Cards: string) {
    this.p1Cards = p1Cards.split(',').filter(Boolean).map((name) => cards.findCard(name));
    this.p2Cards = p2Cards.split(',').filter(Boolean).map((name) => cards.findCard(name));
    this.p3Cards = p3Cards.split(',').filter(Boolean).map((name) => cards.findCard(name));
    this.p4Cards = p4Cards.split(',').filter(Boolean).map((name) => cards.findCard(name));
  }

  // Functions
  scoreA(): number[] {
    return [
      this.p1Cards.reduce((total, card) => total + card.pointsA, 0),
      this.p2Cards.reduce((total, card) => total + card.pointsA, 0),
      this.p3Cards.reduce((total, card) => total + card.pointsA, 0),
      this.p4Cards.reduce((total, card) => total + card.pointsA, 0),
    ]
  }

  scoreB(): number[] {
    return [0, 0, 0, 0]
  }

  scoreC(): number[] {
    return [0, 0, 0, 0]
  }

  scores(): number[] {
    const roundAScore: number[] = this.scoreA()
    const roundBScore: number[] = this.scoreB()
    const roundCScore: number[] = this.scoreC()

    return [
      roundAScore[0] + roundBScore[0] + roundCScore[0],
      roundAScore[1] + roundBScore[1] + roundCScore[1],
      roundAScore[2] + roundBScore[2] + roundCScore[2],
      roundAScore[3] + roundBScore[3] + roundCScore[3]
    ]
  }
}