import {
  addBasicCard,
  addCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { CardInstance, PlayerCard } from '../types';

addBasicCard('HAND-WING', ['red', 'purple'], 'multi-colour', 1);
addCardThatPointsByColour('HEAT VISION', 'red', 'Classic', -1, 'red', 1);
addBasicCard('HEROIC', 'green', 'Classic', 7);
addBasicCard('HOT TEMPER', 'red', 'Classic', 2);
addBasicCard('HYPER-INTELLIGENCE', 'red', 'Classic', 4);
const hyperMyelination: PlayerCard = {
  name: 'HYPER-MYELINATION',
  type: ['purple'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 0, inst, 'face card value')
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.biggest_gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    inst.applyPoints(
      'B',
      inst.metadata.biggest_gene_pool_size,
      inst,
      'biggest gene pool size'
    );
  },
  metadataRequired: [['biggest_gene_pool_size', 'number', 'global']]
};
addCard(hyperMyelination);
