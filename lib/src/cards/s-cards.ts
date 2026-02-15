import { CALC_B_PHASES, CardInstance, CardType, PlayerCardWithOptionalInputs } from '../types';
import {
  addBasicCard,
  addCardThatPointsByColour,
} from '../cardContainer';
import { isDominant } from './effect_cards';
import { filterCardsByType, forEachPlayerCards, playerCards } from './helpers';

addBasicCard({ score: 1 }, { name: 'SALIVA', type: ['blue'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'SAUDADE', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 3 }, { name: 'SCUTES', type: ['blue'], pack: 'Classic' });
addBasicCard({ score: 0 }, { name: 'SELECTIVE MEMORY', type: ['blue'], pack: 'Classic' });
addBasicCard({ score: -1 }, { name: 'SELF-AWARENESS', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 0 }, { name: 'SELF-REPLICATING', type: ['green'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'SELFISH', type: ['purple'], pack: 'Classic' });

// At World's End: Choose a color. +1 for all traits of that color in your trait pile.
addBasicCard({ score: 2 }, {
  name: 'SENTIENCE', type: ['red'], pack: 'Classic',
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
        cardInst.applyPoints(currentPlayer,
          'B',
          1,
          inst,
          `for being a chosen colour (${chosenColour}) card`
        );
      }
    );
  },
  metadataRequired: [['colour', 'CardType', 'card']]
});

// -2 for each dominant trait in your trait pile
addBasicCard({ score: 5 }, {
  name: 'SERRATED TEETH', type: ['red'], pack: 'Dinolings',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).filter((cardInst) => {
      if (isDominant(cardInst.card.name)) {
        cardInst.applyPoints(currentPlayer, 'B', -2, inst, 'for being a dominant trait');
      }
    });
  }
});

addBasicCard({ score: 2 }, { name: 'SNEAKY', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'SPINY', type: ['blue'], pack: 'Classic' });
addCardThatPointsByColour(
  { score: -1, colour: 'purple', pointsPerCard: 1 },
  { name: 'STICKY SECRETIONS', type: ['purple'], pack: 'Classic' }
);
addBasicCard({ score: 2 }, { name: 'STONE SKIN', type: ['red'], pack: 'Classic' });
addBasicCard({ score: -1 }, {
  name: 'SUBDERMAL PLATING', type: ['purple'], pack: 'Techlings',
  blocksDiscarding: true,
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {

    const [playerIndex, cardName] = inst.metadata.attached_to as [string, string];

    forEachPlayerCards(allPlayerCards, (playerCards, i) => {
      if (i.toString() === playerIndex) {
        const attachedTo = playerCards.find((cardInst) => cardInst.card.name === cardName);
        if (!attachedTo) {
          inst.generatedMetadata.attached_to = [];
          return
        }

        attachedTo.attachedCards.push(inst);
        attachedTo.blocksDiscardingOnInst = true;
        attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached and block discarding');
      }
    })
  },
  metadataRequired: [
    ['attached_to', 'any_player_card', 'card'],
  ]
});
addBasicCard({ score: 2 }, { name: 'SUPER SPREADER', type: ['purple'], pack: 'Classic' });

// Value is equal to the number of Swarm traits in all trait piles (including this one)
function createSwarm(name: string): [{ score: number }, PlayerCardWithOptionalInputs<'blocksDiscarding' | 'calcBRunPhase' | 'calcA'>] {
  return [{ score: 0 }, {
    name,
    type: ['green'],
    pack: 'Classic',
    calcB: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>
    ): void => {
      const allCards = allPlayerCards.flat();
      const swarmCount = allCards.filter(
        (c) => !c.discarded && c.card.name.startsWith('SWARM')
      ).length;
      inst.applyPoints(currentPlayer,
        'B',
        swarmCount,
        inst,
        'for each swarm trait in all trait piles'
      );
    }
  }];
}

addBasicCard(...createSwarm('SWARM (1)'));
addBasicCard(...createSwarm('SWARM (2)'));
addBasicCard(...createSwarm('SWARM (3)'));
addBasicCard(...createSwarm('SWARM (4)'));
addBasicCard(...createSwarm('SWARM (5)'));
addBasicCard(...createSwarm('SWARM (6)'));

addBasicCard({ score: 2 }, { name: 'SWEAT', type: ['blue'], pack: 'Classic' });

// +2 for every trait in your lowest color count (must have 2+ colors; if tied, pick 1)
addBasicCard({ score: 3 }, {
  name: 'SYMBIOSIS',
  type: ['green'],
  pack: 'Classic',
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
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for not having 2+ colours');
      return;
    }

    const lowestCount = Math.min(...Object.values(colourCounts));

    const lowestColours = Object.keys(colourCounts)
      .filter((colour) => colourCounts[colour] == lowestCount)
      .map((colour) => colour as CardType);
    const lowestColour = lowestColours.sort((a, b) => a.localeCompare(b))[0];

    filterCardsByType(allPlayerCards[currentPlayer], lowestColour).forEach(
      (cardInst) => {
        cardInst.applyPoints(currentPlayer,
          'B',
          2,
          inst,
          `for being in the smalled trait pile (${lowestColour})`
        );
      }
    );

    // TODO: we need to rescore this after any colour changes
  }
});
