import { addBasicCard } from '../cardContainer';
import { CardInstance } from '../types';
import { playerCards } from './helpers';

addBasicCard({ score: 3 }, { name: 'ICY', type: ['blue'], pack: 'Mythlings' });

addBasicCard({ score: 4 }, {
  name: 'IMMUNITY', type: ['blue'], pack: 'Classic',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (cardInst.finalA < 0) {
        cardInst.applyPoints(
          'B',
          2,
          inst,
          'for being a negative face value trait'
        );
      }
    });
  }
});

addBasicCard({ score: 1 }, { name: 'IMPATIENCE', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'INTROSPECTIVE', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'INVENTIVE', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'IRIDESCENT SCALES', type: ['blue'], pack: 'Classic' });
