import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('ECHOLOCATION', 'blue', 'Classic', 4);
addBasicCard('ECLIPSE', 'purple', 'Classic', 0);
addBasicCard('EFFIGIAL', 'colourless', 'Mythlings', -3);
const egg_clusters: PlayerCard = {
  name: 'EGG CLUSTERS',
  type: ['blue'],
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
    const blueCards = playerCards.filter(
      (inst) => inst.type.includes('blue')
    );
    inst.finalB = blueCards.length
  }
};
addCard(egg_clusters);
addBasicCard('EGG PREDATION', 'purple', 'Dinolings', 1);
addBasicCard('ELECTROMAGNETIC', 'purple', 'Techlings', 1);
addBasicCard('ELONGATED NECK', 'blue', 'Dinolings', 1);
addBasicCard('ELOQUENCE', 'colourless', 'Classic', 1);
const elven_ears: PlayerCard = {
  name: 'ELVEN EARS',
  type: ['green'],
  pack: 'Mythlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    _currentPlayer: number
  ): void => {
    const allCards = allPlayerCards.flat();
    const mythlingCards = allCards.filter(
      (card) => card.card.pack === 'Mythlings'
    );
    inst.finalB = mythlingCards.length
  }
};
addCard(elven_ears);
addBasicCard('ENDURANCE', 'red', 'Classic', 1);
addBasicCard('ENLIGHTENMENT', 'purple', 'Classic', 0);
