import {
  addBasicCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { CardInstance } from '../types';

addBasicCard({ score: 1 }, { name: 'HAND-WING', type: ['red', 'purple'], pack: 'multi-colour' });
addCardThatPointsByColour({ score: -1, colour: 'red', pointsPerCard: 1 }, { name: 'HEAT VISION', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 7 }, { name: 'HEROIC', type: ['green'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'HOT TEMPER', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 4 }, { name: 'HYPER-INTELLIGENCE', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 0 }, {
  name: 'HYPER-MYELINATION', type: ['purple'], pack: 'Techlings',
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
});
