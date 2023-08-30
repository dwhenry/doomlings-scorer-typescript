export class Scorer {
  // Properties
  p1Cards: string[];
  p2Cards: string[];
  p3Cards: string[];
  p4Cards: string[];

  constructor(p1Cards: string, p2Cards: string, p3Cards: string, p4Cards: string) {
    this.p1Cards = p1Cards.split(',');
    this.p2Cards = p2Cards.split(',');
    this.p3Cards = p3Cards.split(',');
    this.p4Cards = p4Cards.split(',');
  }

  // Functions
  scoreA(): number[] {
    return [2, 0, 0, 0]
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