import { addBasicCard, addCard } from '../cardContainer';
import { CardInstance, PlayerCard } from '../types';
import { playerCards } from './helpers';

addBasicCard('ICY', 'blue', 'Mythlings', 3);

const immunity: PlayerCard = {
  name: 'IMMUNITY',
  type: ['blue'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 4, inst, 'face card value')
  },
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
};
addCard(immunity);

addBasicCard('IMPATIENCE', 'purple', 'Classic', 1);
addBasicCard('INTROSPECTIVE', 'colourless', 'Classic', 1);
addBasicCard('INVENTIVE', 'purple', 'Classic', 1);
addBasicCard('IRIDESCENT SCALES', 'blue', 'Classic', 1);
