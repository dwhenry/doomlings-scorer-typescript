import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('OPTIMISTIC NIHILISM', 'colourless', 'Classic', 4);
addBasicCard('ORCISH TUSKS', 'green', 'Mythlings', 1);

// +1 for each green trait in your trait pile (including this one)
const overgrowth: PlayerCard = {
  name: 'OVERGROWTH',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const greenCount = playerCards.filter(c => c.type.includes('green')).length;
    inst.finalB = greenCount;
  }
};
addCard(overgrowth);

