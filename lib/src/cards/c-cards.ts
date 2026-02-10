import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { playerCards } from './helpers';

const camouflage: PlayerCard = {
  name: 'CAMOUFLAGE',
  type: ['red'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 2, inst, 'face card value')
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field cards_in_hand');
    }
    inst.applyPoints('B', inst.metadata.cards_in_hand, inst, 'point for each card in hand');
  },
  metadataRequired: [['cards_in_hand', 'number', 'player']]
};
addCard(camouflage);
addBasicCard('CARNOSAUR JAW', 'red', 'Dinolings', 9);
addBasicCard('CERATOPSIAN HORNS', 'green', 'Dinolings', 4);
addBasicCard('CHROMATOPHORES', 'blue', 'Classic', 0);
addBasicCard('CLEVER', 'purple', 'Classic', 1);
addBasicCard('COLD BLOOD', 'blue', 'Classic', 1);
addBasicCard('CONFUSION', 'colourless', 'Classic', -2);
addBasicCard('COSTLY SIGNALING', 'blue', 'Classic', -2);
const cranialCrest: PlayerCard = {
  name: 'CRANIAL CREST',
  type: ['colourless'],
  pack: 'Dinolings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 4, inst, 'face card value')
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const types = playerCards(allPlayerCards, currentPlayer)
      .flatMap((inst) => inst.type)
    // we minus one as we have at least one colourless that doesn't count
    inst.applyPoints('B', -([...new Set(types)].length - 1), inst, 'point for each colour trait that we have');
  }
};
addCard(cranialCrest);
addBasicCard('CURIOSITY', ['blue', 'red'], 'multi-colour', 1);
const cybernetic: PlayerCard = {
  name: 'CYBERNETIC',
  type: ['blue'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 1, inst, 'face card value')
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const attachedTo = playerCards(allPlayerCards, currentPlayer)
      .find((cardInst) => cardInst.card.name === inst.metadata.attached_to)
    if (!attachedTo) {
      inst.generatedMetadata.attached_to = '';
      return
    }

    attachedTo.attachedCards.push(inst);
    attachedTo.setOverride('type', ['blue']);
    attachedTo.applyPoints('B', 0, inst, 'attached and colour set to blue');
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
};
addCard(cybernetic);