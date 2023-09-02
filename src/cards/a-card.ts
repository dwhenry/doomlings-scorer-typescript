import { Card, CardInstance } from "../types"
import { addCard, addBasicCard } from "../cardContainer"

addBasicCard('ACROBATIC', 'multi-colour', 2)
addBasicCard('ADORABLE', 'purple', 4)

const altruistic: Card = {
  name: 'ALTRUISTIC',
  type: 'colourless',
  calcA: (inst: CardInstance): void => { inst.finalA = 0 },
  calcB: (inst: CardInstance): void => {
    if(typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size')
    }
    inst.finalB = inst.metadata.gene_pool_size
  },
  metadataRequired: [
    ['gene_pool_size', 'number']
  ]
};
addCard(altruistic)

addBasicCard('ANCIENT', 'red', 2)
addBasicCard('ANTLERS', 'red', 3)

const apex_predator: Card = {
  name: 'APEX PREDATOR',
  type: 'red',
  calcA: (inst: CardInstance): void => { inst.finalA = 4 },
  calcB: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>, currentPlayer: number): void => {
    let points: number = 4
    let myCount: number = allPlayerCards[currentPlayer].length

    allPlayerCards.forEach((playerCards, i) => {
      if(i !== currentPlayer && playerCards.length >= myCount) {
        points = 0
      }
    })

    inst.finalB = points
  }
};
addCard(apex_predator)

addBasicCard('APPEALING', 'green', 3)

