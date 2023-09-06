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
addCard(camouflage);