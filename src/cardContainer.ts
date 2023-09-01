interface basicCard {
  name: string;
  type: CardType,
  calcB?(): number;
  calcC?(oplayersCards: Array<Array<CardInstance>>): void;
  metadataRequired?: Array<[string, string]>
}
interface valueACard extends basicCard {
  pointsA: number;
}
interface calcACard extends basicCard {
  pointsA(card: CardInstance): number;
}
export type Card = valueACard | calcACard;

export interface CardInstance {
  card: Card;
  traitPoints: number;
  finalA: number;
  finalB: number;
  metadata: { [key: string]: string }
}


const traitCardTypes = ['colourless', 'multi-colour', 'purple'] as const;
const costopheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [...traitCardTypes, ...costopheCardTypes, ...otherCardTypes] as const;
type CardType = typeof CardTypes[number];

const unknownCard: Card = {
  name: "unknown",
  type: 'none',
  pointsA: 0
}

let cardsMap: Map<string, Card> = new Map()

function findCard(name: string): Card {
  return cardsMap.get(name) || unknownCard
}

export function addCard(card: Card) {
  cardsMap.set(card.name, card)
}

export function getCard(name: string, metadataArray: Array<string[]>): CardInstance {
  const card = findCard(name)
  let metadata: { [key: string]: string } = {}
  metadataArray.forEach(([key, value]) => {
    metadata[key] = value
  })

  const inst: CardInstance = {
    card: card,
    traitPoints: 0,
    finalA: 0,
    finalB: 0,
    metadata: metadata
  }
  if(card.metadataRequired !== undefined) {
    card.metadataRequired.forEach(([key, _]) => {
      if(metadata[key] === undefined) {
        throw new Error(`missing metadata field ${key}`)
      }
    })
  }

  return inst
}
