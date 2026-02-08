import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard, addCardThatPointsByColour } from '../cardContainer';
import { filterCardByPack, playerCards } from './helpers';

addBasicCard('ECHOLOCATION', 'blue', 'Classic', 4);
addBasicCard('EFFIGIAL', 'colourless', 'Mythlings', -3);
addCardThatPointsByColour('EGG CLUSTERS', 'blue', 'Classic', -1, 'blue', 1);
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
    const mythlingCards = filterCardByPack(allPlayerCards.flat(), 'Mythlings')

    inst.applyPoints('B', mythlingCards.length, inst, 'for mythling cards for all players');
  }
};
addCard(elven_ears);
addBasicCard('ENDURANCE', 'red', 'Classic', 1);
