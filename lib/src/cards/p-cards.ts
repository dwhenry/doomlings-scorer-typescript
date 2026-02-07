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
    playerCards.forEach(c => {
      c.type.forEach(type => {
        if (type !== 'colourless' && type !== 'catastrophe' && type !== 'none') {
          colourCounts[type] = (colourCounts[type] || 0) + 1;
        }
      });
    });
    const pairCount = Object.values(colourCounts).reduce(
      (sum, count) => sum + Math.floor(count / 2), 0
    );
    inst.finalB = pairCount;
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
    const faceValueOneCount = playerCards.filter(c => c.finalA === 1).length;
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
