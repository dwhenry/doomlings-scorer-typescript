import {
  addBasicCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { CardInstance } from '../types';

addBasicCard({ score: 1 }, { name: 'HAND-WING', type: ['red', 'purple'] });
addCardThatPointsByColour({ score: -1, colour: 'red', pointsPerCard: 1 }, { name: 'HEAT VISION', type: ['red'] });
addBasicCard({ score: 7 }, { name: 'HEROIC', type: ['green'] });
addBasicCard({ score: 2 }, { name: 'HOT TEMPER', type: ['red'] });
addBasicCard({ score: 4 }, { name: 'HYPER-INTELLIGENCE', type: ['red'] });
addBasicCard({ score: 0 }, {
  name: 'HYPER-MYELINATION', type: ['purple'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.biggest_gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    inst.applyPoints(currentPlayer,
      'B',
      inst.metadata.biggest_gene_pool_size,
      inst,
      'biggest gene pool size'
    );
  },
  metadataRequired: [['biggest_gene_pool_size', 'number', 'global']]
});
