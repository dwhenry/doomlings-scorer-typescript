import { PlayerCard, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { playerCards } from './helpers';

// Value is equal to the number of Kidneys in your trait pile (including this one)
function createKidney(name: string): [{ score: number }, PlayerCard] {
  return [{ score: 0 }, {
    name,
    type: ['red'],
    pack: 'Classic',
    calcB: (
      inst: CardInstance,
      allPlayerCards: Array<Array<CardInstance>>,
      currentPlayer: number
    ): void => {
      playerCards(allPlayerCards, currentPlayer).filter((c) => {
        if (c.card.name.startsWith('KIDNEY')) {
          c.applyPoints('B', 1, inst, 'for being a kidney card');
        }
      });
    }
  } as PlayerCard];
}

addBasicCard(...createKidney('KIDNEY (1)'));
addBasicCard(...createKidney('KIDNEY (2)'));
addBasicCard(...createKidney('KIDNEY (3)'));
addBasicCard(...createKidney('KIDNEY (4)'));
addBasicCard(...createKidney('KIDNEY (5)'));
