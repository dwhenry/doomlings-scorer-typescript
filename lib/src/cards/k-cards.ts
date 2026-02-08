import { PlayerCard, CardInstance } from '../types';
import { addCard } from '../cardContainer';
import { playerCards } from './helpers';

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
      playerCards(allPlayerCards, currentPlayer).filter((c) => {
        if (c.card.name.startsWith('KIDNEY')) {
          c.applyPoints('B', 1, inst, 'for being a kidney card');
        }
      });
    }
  };
}

addCard(createKidney('KIDNEY (1)'));
addCard(createKidney('KIDNEY (2)'));
addCard(createKidney('KIDNEY (3)'));
addCard(createKidney('KIDNEY (4)'));
addCard(createKidney('KIDNEY (5)'));
