import { addBasicCard } from '../cardContainer';
import { CardInstance } from '../types';
import { playerCards } from './helpers';

addBasicCard({ score: 3 }, { name: 'ICY', type: ['blue'] });

addBasicCard({ score: 4 }, {
  name: 'IMMUNITY', type: ['blue'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (cardInst.finalA < 0) {
        cardInst.applyPoints(currentPlayer,
          'B',
          2,
          inst,
          'for being a negative face value trait'
        );
      }
    });
  }
});

addBasicCard({ score: 1 }, { name: 'IMPATIENCE', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'INTROSPECTIVE', type: ['colourless'] });
addBasicCard({ score: 1 }, { name: 'INVENTIVE', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'IRIDESCENT SCALES', type: ['blue'] });
