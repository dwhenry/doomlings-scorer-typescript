import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

const camouflage: PlayerCard = {
  name: 'CAMOUFLAGE',
  type: ['red'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 2;
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field cards_in_hand');
    }
    inst.finalB = inst.metadata.cards_in_hand
  },
  metadataRequired: [['cards_in_hand', 'number']]
};
addCard(camouflage);
addBasicCard('CARNOSAUR JAW', 'red', 'Dinolings', 9);
addBasicCard('CERATOPSIAN HORNS', 'green', 'Dinolings', 4);
addBasicCard('CHROMATOPHORES', 'blue', 'Classic', 0);
addBasicCard('CLEVER', 'purple', 'Classic', 1);
addBasicCard('COASTAL FORMATIONS', 'green', 'Classic', 0);
addBasicCard('COLD BLOOD', 'blue', 'Classic', 1);
addBasicCard('COMET SHOWERS', 'red', 'Classic', 0);
addBasicCard('CONFUSION', 'colourless', 'Classic', -2);
addBasicCard('COSTLY SIGNALING', 'blue', 'Classic', -2);
const cranialCrest: PlayerCard = {
  name: 'CRANIAL CREST',
  type: ['colourless'],
  pack: 'Dinolings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 4;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const types = playerCards.map((inst) => inst.card.type).flat()
    // we minus one as we have at least one colourless that doesn't count
    inst.finalB = -([...new Set(types)].length - 1);
  },
}
addCard(cranialCrest);
addBasicCard('CURIOSITY', ['blue', 'red'], 'multi-colour', 1);
addBasicCard('CYBERNETIC', 'blue', 'Techlings', 1);
