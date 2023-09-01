import { CardInstance, getCard } from "./cardContainer"
import './cards'

export class Scorer {
  // Properties
  p1Cards: CardInstance[];
  p2Cards: CardInstance[];
  p3Cards: CardInstance[];
  p4Cards: CardInstance[];

  constructor(p1Cards: string, p2Cards: string, p3Cards: string, p4Cards: string) {
    this.p1Cards = p1Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p2Cards = p2Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p3Cards = p3Cards.split(',').filter(a => a).map((name) => getCard(name));
    this.p4Cards = p4Cards.split(',').filter(a => a).map((name) => getCard(name));
  }

  // Functions
  scoreA(): number[] {
    return [
      this.p1Cards.reduce((total, inst) => total + inst.card.pointsA, 0),
      this.p2Cards.reduce((total, inst) => total + inst.card.pointsA, 0),
      this.p3Cards.reduce((total, inst) => total + inst.card.pointsA, 0),
      this.p4Cards.reduce((total, inst) => total + inst.card.pointsA, 0),
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