import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

// +1 for every pair of a color in your trait pile
const packBehavior: PlayerCard = {
  name: 'PACK BEHAVIOR',
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

    const multiColourCount = playerCards.filter(
      (c) => c.type.length > 1
    ).length;

    playerCards.forEach((c) => {
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

    inst.finalB = pairCount + multiColourCount;
  }
};
addCard(packBehavior);

addBasicCard('PAINTED SHELL', 'blue', 'Classic', 1);
addBasicCard('PARASITIC', 'purple', 'Classic', -2);
addBasicCard('PERSUASIVE', 'purple', 'Classic', 1);
addBasicCard('PHOTOSYNTHESIS', 'green', 'Classic', 1);
addBasicCard('PHREAKISH EYES', 'red', 'Techlings', 2);
addBasicCard('POISONOUS', 'purple', 'Classic', 2);

// +1 for every card in your trait pile with a face value of 1 (including this one)
const pollination: PlayerCard = {
  name: 'POLLINATION',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    // TODO: we actually modify the finalA value in the catastrophe processing.
    // We need to change this so that finalA is static - Plan add finalC to these adjustments
    const faceValueOneCount = playerCards.filter((c) => c.finalA === 1).length;
    inst.finalB = faceValueOneCount;
  }
};
addCard(pollination);

addBasicCard('PREPPER', 'colourless', 'Classic', 2);
addBasicCard('PRIDE', 'red', 'KSE', 2);
addBasicCard('PROPAGATION', 'green', 'Classic', 1);
addBasicCard('PROTOFEATHERS', 'purple', 'Dinolings', -2);
addBasicCard('PTEROSAUR WINGS', 'blue', 'Dinolings', 1);
addBasicCard('PYCNOFIBERS', 'colourless', 'Dinolings', 1);
