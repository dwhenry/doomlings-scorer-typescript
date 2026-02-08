import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('MECHA', 'blue', 'Techlings', 2);
addBasicCard('MEMORY', 'purple', 'Classic', 2);
addBasicCard('MIGHTY', 'red', 'Mythlings', 2);
addBasicCard('MIGRATORY', 'blue', 'Classic', 2);

// +1 for each colorless trait in your trait pile (including this one)
const mindful: PlayerCard = {
  name: 'MINDFUL',
  type: ['colourless'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const colourlessCount = playerCards.filter((c) =>
      c.type.includes('colourless')
    ).length;
    inst.finalB = colourlessCount;
  }
};
addCard(mindful);

addBasicCard('MITOCHONDRION', 'colourless', 'Classic', 1);
addBasicCard('MITOSIS', ['blue', 'purple'], 'multi-colour', 1);
addBasicCard('MORALITY', 'colourless', 'Classic', 5);
addBasicCard('MOTLEY', ['blue', 'green', 'purple', 'red'], 'multi-colour', 4);
