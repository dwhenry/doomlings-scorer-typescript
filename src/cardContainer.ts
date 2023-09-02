
import { Card, CardInstance, PlayerInput } from './types'

const unknownCard: Card = {
  name: "unknown",
  type: 'none',
  calcA: (inst: CardInstance): number => inst.finalA = 0,
}

let cardsMap: Map<string, Card> = new Map()

function findCard(name: string): Card {
  return cardsMap.get(name) || unknownCard
}

export function addCard(card: Card) {
  cardsMap.set(card.name, card)
}

export function getCard(name: string, metadata: PlayerInput): CardInstance {
  const card = findCard(name)

  const inst: CardInstance = {
    card: card,
    traitPoints: 0,
    finalA: 0,
    finalB: 0,
    metadata: metadata
  }
  if(card.metadataRequired === undefined) {
    return inst
  }
  card.metadataRequired.forEach(([key, _]) => {
    if(metadata[key] === undefined) {
      throw new Error(`missing metadata field ${key}`)
    }
  })

  return inst
}
