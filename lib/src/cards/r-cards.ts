import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('RAINBOW HORN', 'colourless', 'Mythlings', 2);

// Value is equal to the size of your Gene Pool
const randomFertilization: PlayerCard = {
  name: 'RANDOM FERTILIZATION',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 0, inst, 'face card value')
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    inst.applyPoints('B', inst.metadata.gene_pool_size, inst, 'Gene Pool Size');
  },
  metadataRequired: [['gene_pool_size', 'number', 'player']]
};
addCard(randomFertilization);

addBasicCard('RECKLESS', 'red', 'Classic', 3);
addBasicCard('REGENERATIVE TISSUE', 'blue', 'Classic', 0);
addBasicCard('RETRACTABLE CLAWS', 'red', 'Classic', 5);
addBasicCard('RIGHTEOUS', 'blue', 'Mythlings', 1);
addBasicCard('RUGGEDIZED', 'colourless', 'Techlings', 4);
