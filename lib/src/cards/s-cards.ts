import { PlayerCard, CardInstance, CardType } from '../types';
import {
  addCard,
  addBasicCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { isDominant } from './effect_cards';
import { filterCardsByType, playerCards } from './helpers';

addBasicCard('SALIVA', 'blue', 'Classic', 1);
addBasicCard('SAUDADE', 'colourless', 'Classic', 2);
addBasicCard('SCUTES', 'blue', 'Classic', 3);
addBasicCard('SELECTIVE MEMORY', 'blue', 'Classic', 0);
addBasicCard('SELF-AWARENESS', 'colourless', 'Classic', -1);
addBasicCard('SELF-REPLICATING', 'green', 'Classic', 0);
addBasicCard('SELFISH', 'purple', 'Classic', 1);

// At World's End: Choose a color. +1 for all traits of that color in your trait pile.
const sentience: PlayerCard = {
  name: 'SENTIENCE',
  type: ['red'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 2;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (!inst.metadata.colour) {
      throw new Error('invalid data for metadata field colour');
    }
    const chosenColour = inst.metadata.colour as CardType;
    filterCardsByType(allPlayerCards[currentPlayer], chosenColour).forEach(
      (cardInst) => {
        cardInst.applyPoints(
          'B',
          1,
          inst,
          `for being a chosen colour (${chosenColour}) card`
        );
      }
    );
  },
  metadataRequired: [['colour', 'CardType', 'card']]
};
addCard(sentience);

// -2 for each dominant trait in your trait pile
const serratedTeeth: PlayerCard = {
  name: 'SERRATED TEETH',
  type: ['red'],
  pack: 'Dinolings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 5;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).filter((cardInst) => {
      if (isDominant(cardInst.card.name)) {
        cardInst.applyPoints('B', -2, inst, 'for being a dominant trait');
      }
    });
  }
};
addCard(serratedTeeth);

addBasicCard('SNEAKY', 'purple', 'Classic', 2);
addBasicCard('SPINY', 'blue', 'Classic', 1);
addCardThatPointsByColour(
  'STICKY SECRETIONS',
  'purple',
  'Classic',
  -1,
  'purple',
  1
);
addBasicCard('STONE SKIN', 'red', 'Classic', 2);
addBasicCard('SUBDERMAL PLATING', 'purple', 'Techlings', -1);
addBasicCard('SUPER SPREADER', 'purple', 'Classic', 2);

// Value is equal to the number of Swarm traits in all trait piles (including this one)
function createSwarm(name: string): PlayerCard {
  return {
    name,
    type: ['green'],
    pack: 'Classic',
    calcA: (inst: CardInstance): void => {
      inst.finalA = 0;
    },
    calcB: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>
    ): void => {
      const allCards = allPlayerCards.flat();
      const swarmCount = allCards.filter(
        (c) => !c.discarded && c.card.name.startsWith('SWARM')
      ).length;
      inst.applyPoints(
        'B',
        swarmCount,
        inst,
        'for each swarm trait in all trait piles'
      );
    }
  };
}

addCard(createSwarm('SWARM (1)'));
addCard(createSwarm('SWARM (2)'));
addCard(createSwarm('SWARM (3)'));
addCard(createSwarm('SWARM (4)'));
addCard(createSwarm('SWARM (5)'));
addCard(createSwarm('SWARM (6)'));

addBasicCard('SWEAT', 'blue', 'Classic', 2);

// +2 for every trait in your lowest color count (must have 2+ colors; if tied, pick 1)
const symbiosis: PlayerCard = {
  name: 'SYMBIOSIS',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 3;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const colourCounts: { [key: string]: number } = {};
    playerCards.forEach((c) => {
      c.type.forEach((type) => {
        if (
          type !== 'colourless' &&
          type !== 'catastrophe' &&
          type !== 'none'
        ) {
          colourCounts[type] = (colourCounts[type] || 0) + 1;
        }
      });
    });

    const colours = Object.keys(colourCounts);
    if (colours.length < 2) {
      inst.applyPoints('B', 0, inst, 'for not having 2+ colours');
      return;
    }

    const lowestCount = Math.min(...Object.values(colourCounts));

    const lowestColours = Object.keys(colourCounts)
      .filter((colour) => colourCounts[colour] == lowestCount)
      .map((colour) => colour as CardType);
    const lowestColour = lowestColours.sort((a, b) => a.localeCompare(b))[0];

    filterCardsByType(allPlayerCards[currentPlayer], lowestColour).forEach(
      (cardInst) => {
        cardInst.applyPoints(
          'B',
          2,
          inst,
          `for being in the smalled trait pile (${lowestColour})`
        );
      }
    );

    // TODO: we need to rescore this after any colour changes
  }
};
addCard(symbiosis);
