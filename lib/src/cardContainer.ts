import { filterCardsByType } from './cards/helpers';
import {
  Card,
  PlayerCard,
  CardInstance,
  CardType,
  PlayerInput,
  CALC_B_PHASES,
  CatastropheCard,
  PlayerCardWithOptionalInputs
} from './types';

const cardsMap: Map<string, PlayerCard | CatastropheCard> = new Map();

function findCard(name: string): PlayerCard | CatastropheCard {
  const card: PlayerCard | CatastropheCard | undefined = cardsMap.get(name);
  if (card === undefined) {
    throw new Error(`unknown card: ${name}`);
  }
  return card;
}

export function addBasicCard(custom: { score: number }, card: PlayerCardWithOptionalInputs<'calcBRunPhase' | 'blocksDiscarding' | 'calcA'>) {
  addCard({
    calcBRunPhase: CALC_B_PHASES.POST_CATASTROPHE,
    blocksDiscarding: false,
    calcA: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>,
      currentPlayer: number
    ): void => {
      inst.applyPoints(currentPlayer, 'A', custom.score, inst, 'face card value')
    },
    ...card
  })
}

export function addCardThatPointsByColour(
  custom: { score: number, colour: CardType, pointsPerCard: number },
  card: PlayerCardWithOptionalInputs<'calcBRunPhase' | 'blocksDiscarding' | 'calcA'>
) {
  addBasicCard({ score: custom.score }, {
    calcB: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>,
      currentPlayer: number
    ): void => {
      filterCardsByType(allPlayerCards[currentPlayer], custom.colour).forEach(
        (colourInst) => {
          colourInst.applyPoints(currentPlayer,
            'B',
            custom.pointsPerCard,
            inst,
            `for being a ${custom.colour} card`
          );
        }
      );
    },
    ...card
  })
}

export function addCard(card: PlayerCard | CatastropheCard) {
  if (cardsMap.has(card.name)) {
    throw new Error(
      `Duplicate card name ${card.name} was attempted to be added`
    );
  }
  cardsMap.set(card.name, card);
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
