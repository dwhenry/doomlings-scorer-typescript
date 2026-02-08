import { PlayerCard, CardInstance } from '../types';
import { addCard } from '../cardContainer';

// Value is equal to the number of Kidneys in your trait pile (including this one)
function createKidney(name: string): PlayerCard {
  return {
    name,
    type: ['red'],
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
      const kidneyCount = playerCards.filter((c) =>
        c.card.name.startsWith('KIDNEY')
      ).length;
      inst.finalB = kidneyCount;
    }
  };
}

addCard(createKidney('KIDNEY (1)'));
addCard(createKidney('KIDNEY (2)'));
addCard(createKidney('KIDNEY (3)'));
addCard(createKidney('KIDNEY (4)'));
addCard(createKidney('KIDNEY (5)'));
