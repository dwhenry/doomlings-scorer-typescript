import { CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { playerCards } from './helpers';

// +1 for every pair of a color in your trait pile
addBasicCard({ score: 3 }, {
  name: 'PACK BEHAVIOR',
  type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const colourCounts: { [key: string]: number } = {};

    const currentPlayerCards = playerCards(allPlayerCards, currentPlayer);
    const multiColourCount = currentPlayerCards.filter(
      (c) => c.type.length > 1
    ).length;

    currentPlayerCards.forEach((c) => {
      // we have already counter the multi colour cards, so we only need to
      // count the single colour cards
      if (c.type.length === 1) {
        c.type.forEach((type) => {
          if (
            type !== 'colourless' &&
            type !== 'catastrophe' &&
            type !== 'none'
          ) {
            colourCounts[type] = (colourCounts[type] || 0) + 1;
          }
        });
      }
    });
    const totalCards = Object.values(colourCounts).reduce(
      (max, count) => max + count,
      0
    );

    // maximum number of pairs is either half the total cards if count of any
    // single color is lower half or the count of other cards if the single
    // colour is over half the cards
    const maxPairCount = Math.floor(totalCards / 2);

    const maxSingleColourCount = Object.values(colourCounts).sort(
      (a, b) => b - a
    )[0];

    let pairCount: number;
    if (maxSingleColourCount > maxPairCount) {
      pairCount = totalCards - maxSingleColourCount;
    } else {
      pairCount = maxPairCount;
    }
    inst.applyPoints(currentPlayer,
      'B',
      pairCount + multiColourCount,
      inst,
      'point for each pair of colours'
    );
  }
});

addBasicCard({ score: 1 }, { name: 'PAINTED SHELL', type: ['blue'] });
addBasicCard({ score: -2 }, { name: 'PARASITIC', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'PERSUASIVE', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'PHOTOSYNTHESIS', type: ['green'] });
addBasicCard({ score: 2 }, { name: 'PHREAKISH EYES', type: ['red'] });
addBasicCard({ score: 2 }, { name: 'POISONOUS', type: ['purple'] });

// +1 for every card in your trait pile with a face value of 1 (including this one)
addBasicCard({ score: 1 }, {
  name: 'POLLINATION',
  type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (cardInst.finalA === 1) {
        cardInst.applyPoints(currentPlayer, 'B', 1, inst, 'for having a face value of 1');
      }
    });
  }
});

addBasicCard({ score: 2 }, { name: 'PREPPER', type: ['colourless'] });
addBasicCard({ score: 2 }, { name: 'PRIDE', type: ['red'] });
addBasicCard({ score: 1 }, { name: 'PROPAGATION', type: ['green'] });
addBasicCard({ score: -2 }, { name: 'PROTOFEATHERS', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'PTEROSAUR WINGS', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'PYCNOFIBERS', type: ['colourless'] });
