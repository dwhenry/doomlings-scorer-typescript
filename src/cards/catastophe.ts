import { Card, CardInstance } from "../types"
import { addCard } from "../cardContainer"

const aiTakeover: Card = {
  name: 'AI TAKEOVER',
  type: 'catastrophe',
  pack: 'Classic',
  calcA: (inst: CardInstance): void => { inst.finalA = 0 },
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    let colourlessCards: Array<CardInstance> = allPlayerCards
      .reduce((allCards, playerCards) => {
        const clessCards: Array<CardInstance> = playerCards.filter((inst: CardInstance) => inst.card.type === "colourless")
        return [...clessCards, ...allCards]
      }, [])

    colourlessCards.forEach((inst: CardInstance) => {
      inst.finalA = 2
      inst.finalB = 0
    })
  }
};
addCard(aiTakeover)

const bio_plague: Card = {
  name: 'BIOENGINEERED PLAGUE',
  type: 'catastrophe',
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => { inst.finalA = 0 },
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    // remove a card (set score to 0) from each players hand
    // the card must come from the colour with the highest count - this logic is not implemented
    [0, 1, 2, 3].forEach((position) => {
      const cardName: string = inst.metadata.discard[position]
      const playerCards = allPlayerCards[position]

      if(playerCards.length > 0) {
        if(cardName === undefined) {
          throw new Error(`no card selected to discard for Player ${position+1}`)
        }
        let removed:boolean = false
        playerCards.forEach((inst: CardInstance, index: number) => {
          if(!removed && inst.card.name === cardName) {
            removed = true
            playerCards.splice(index,1);
          }
        })

        if(!removed) {
          throw new Error(`could not find card to discard: ${cardName} for Player ${position+1}`)
        }
      }
    })
  },
  metadataRequired: [
    ['discard', 'card_per_person'],
  ]
};
addCard(bio_plague)
