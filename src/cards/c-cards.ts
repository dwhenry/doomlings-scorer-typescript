import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

const camouflage: PlayerCard = {
  name: 'CAMOUFLAGE',
  type: 'red',
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 2;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field cards_in_hand');
    }
    inst.finalB = inst.metadata.cards_in_hand
  },
  metadataRequired: [['cards_in_hand', 'number']]
};
addBasicCard('CARNOSAUR JAW', 'red', 'Dinolings', 9);
addBasicCard('CERATOPSIAN HORNS', 'green', 'Dinolings', 4);
addBasicCard('CHROMATOPHORES', 'blue', 'Classic', 0);
addBasicCard('CLEVER', 'purple', 'Classic', 1);
addBasicCard('COASTAL FORMATIONS', 'green', 'Classic', 0);
addBasicCard('COLD BLOOD', 'blue', 'Classic', 1);
addBasicCard('COMET SHOWERS', 'red', 'Classic', 0);
addBasicCard('CONFUSION', 'colourless', 'Classic', -2);
addBasicCard('COSTLY SIGNALING', 'blue', 'Classic', -2);
addBasicCard('CRANIAL CREST', 'colourless', 'Dinolings', 4);
addBasicCard('CURIOSITY', 'multi-colour', 'multi-colour', 1);
addBasicCard('CYBERNETIC', 'blue', 'Techlings', 1);
