import { Card, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('BAD', 'red', 'Classic', 1);
addBasicCard('BARK', 'green', 'Classic', 2);
addBasicCard('BEAUTY', 'green', 'Classic', 2);
addBasicCard('BIG EARS', 'green', 'Classic', 2);
addBasicCard('BINARY', 'colourless', 'Techlings', 0);

const bionic_arm: Card = {
  name: 'BIONIC ARM',
  type: 'red',
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const techlingCards = playerCards.filter(
      (inst) => inst.card.pack === 'Techlings'
    );

    // TODO: wokr out when this is attached and set to 2 when it is
    const multiplier = 1;

    inst.finalB = techlingCards.length * multiplier;
  }
};
addCard(bionic_arm);
