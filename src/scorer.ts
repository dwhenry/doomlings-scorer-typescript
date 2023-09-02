import { CardInstance, PlayerInput } from "./types"
import { getCard } from "./cardContainer"
import './cards'


export class Scorer {
  // Properties
  // allCards contains player and catastrophe cards -  we only return scores for player cards
  allCards: Array<Array<CardInstance>>

  constructor(cardsInput: Array<Array<PlayerInput>>) {
    this.allCards = cardsInput.map((playerCards) => {
      return playerCards.map((playerInput: PlayerInput): CardInstance => getCard(playerInput.name, playerInput))
    })
  }

  // Functions
  scores(): number[] {
    this.allCards.forEach((playerCards, i) => {
      playerCards.forEach((inst: CardInstance) => {
        inst.card.calcA(inst, this.allCards.slice(0, 4), i)
        inst.card.calcB?.()
        inst.card.calcC?.(inst, this.allCards)
      })
    })

    const result: number[] = this.allCards.slice(0, 4).map((playerCards) => {
      return playerCards.reduce((sum, inst: CardInstance) => sum + inst.finalA + inst.finalB || 0, 0)
    })

    return result
  }
}