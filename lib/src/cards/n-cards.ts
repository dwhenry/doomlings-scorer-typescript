import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

// Attach to a trait in any trait pile. Value is equal to the face value of the host trait.
const nano: PlayerCard = {
  name: 'NANO',
  type: ['green'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.host_face_value !== 'number') {
      throw new Error('invalid data for metadata field host_face_value');
    }
    inst.applyPoints(
      'B',
      inst.metadata.host_face_value,
      inst,
      'for being a host trait'
    );

    // TODO: add selection of existing card by name
  },
  metadataRequired: [['host_face_value', 'number', 'card']]
};
addCard(nano);

addBasicCard('NECROMANTIC', 'purple', 'Mythlings', 1);
addBasicCard('NEURAL LINK', 'blue', 'Techlings', 2);
addBasicCard('NOCTURNAL', 'purple', 'Classic', 3);
addBasicCard('NOSY', 'purple', 'Classic', 1);
