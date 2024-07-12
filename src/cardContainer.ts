import { Card, PlayerCard, CardInstance, CardType, PackType, PlayerInput } from './types';

const cardsMap: Map<string, Card> = new Map();

function findCard(name: string): Card {
  const card: Card | undefined = cardsMap.get(name);
  if (card === undefined) {
    throw new Error(`unknown card: ${name}`);
  }
  return card;
}

export function addCard(card: Card) {
  if (cardsMap.has(card.name)) {
    throw new Error(`Duplicate card name ${card.name} was attempted to be added`);
  }
  cardsMap.set(card.name, card);
}

export function addBasicCard(
  name: string,
  colours: CardType[] | CardType,
  pack: PackType,
  score: number
) {
  const card: PlayerCard = {
    name: name,
    type: Array.isArray(colours) ? colours : [colours],
    pack: pack,
    calcA: (inst: CardInstance): void => {
      inst.finalA = score;
    }
  };
  addCard(card);
}

export function getCard(name: string, metadata: PlayerInput): CardInstance {
  const card = findCard(name);
  let attached: [card: Card, metadata: PlayerInput][] = [];

  // validate metadata fields
  if (card.metadataRequired !== undefined) {
    card.metadataRequired.forEach(([key]) => {
      if (metadata[key] === undefined) {
        throw new Error(`missing metadata field ${key}`);
      }
    });
  }

  if(metadata.attached) {
    attached = metadata.attached.map((attached: [name: string, metadata: PlayerInput]): [card: Card, metadata: PlayerInput] => {
      const attachedCard = findCard(attached[0])
      if (attachedCard.metadataRequired !== undefined) {
        attachedCard.metadataRequired.forEach(([key]) => {
          if (attached[1][key] === undefined) {
            throw new Error(`missing metadata field ${key}`);
          }
        });
      }

      return [attachedCard, attached[1]]
    })
    delete metadata.attached
  }

 const inst: CardInstance = new CardInstance(card, metadata, attached);
  return inst;
}
