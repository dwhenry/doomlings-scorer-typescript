import { CardInstance, getCard, PlayerInput } from "./cardContainer"
import './cards'


export class Scorer {
  // Properties
  allPlayerCards: Array<Array<CardInstance>>

  constructor(cardsInput: Array<Array<PlayerInput>>) {
    this.allPlayerCards = cardsInput.map((playerCards) => {
      return playerCards.map((playerInput: PlayerInput): CardInstance => getCard(playerInput.name, playerInput))
    })
  }

  // Functions
  scores(): number[] {
    this.allPlayerCards.forEach((playerCards) => {
      playerCards.forEach((inst: CardInstance) => {
        inst.card.calcA(inst)
        inst.card.calcB?.()
        inst.card.calcC?.(this.allPlayerCards)
      })
    })

    const result: number[] = this.allPlayerCards.map((playerCards) => {
      return playerCards.reduce((sum, inst: CardInstance) => sum + inst.finalA + inst.finalB || 0, 0)
    })

    return result
  }
}