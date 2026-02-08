import { filterCardsByType } from './cards/helpers';
import {
  Card,
  PlayerCard,
  CardInstance,
  CardType,
  PackType,
  PlayerInput
} from './types';

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
    throw new Error(
      `Duplicate card name ${card.name} was attempted to be added`
    );
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

export function addCardThatPointsByColour(
  name: string,
  colours: CardType[] | CardType,
  pack: PackType,
  score: number,
  colour: CardType,
  pointsPerCard: number,
) {
  const card: PlayerCard = {
    name: name,
    type: Array.isArray(colours) ? colours : [colours],
    pack: pack,
    calcA: (inst: CardInstance): void => {
      inst.finalA = score;
    },
    calcB: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>,
      currentPlayer: number
    ): void => {
      filterCardsByType(allPlayerCards[currentPlayer], colour).forEach((colourInst) => {
        colourInst.applyPoints('B', pointsPerCard, inst, `for being a ${colour} card`);
      })
    }
  };
  addCard(card);
}

export function allCards(): Map<string, Card> {
  return cardsMap;
}

export function getCard(name: string, metadata: PlayerInput): CardInstance {
  const card = findCard(name);

  const inst: CardInstance = new CardInstance(card, metadata);
  if (card.metadataRequired === undefined) {
    return inst;
  }
  const userMetadata = card.metadataRequired.filter(
    ([, , scope]) => scope !== 'internal'
  );
  const allMetadataPresent = userMetadata.every(
    ([key]) => metadata[key] !== undefined
  );
  if (!allMetadataPresent) {
    inst.metadataComplete = false;
  }

  return inst;
}
