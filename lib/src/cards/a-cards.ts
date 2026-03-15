import { CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { forEachPlayerCards } from './helpers';

addBasicCard({ score: 2 }, { name: 'ACROBATIC', type: ['purple', 'green'] });
addBasicCard({ score: 4 }, { name: 'ADORABLE', type: ['purple'] });
addBasicCard({ score: 0 }, {
  name: 'ALTRUISTIC', type: ['colourless'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    inst.applyPoints(currentPlayer, 'B', inst.metadata.gene_pool_size, inst, 'Gene Pool Size');
  },
  metadataRequired: [['gene_pool_size', 'number', 'player']]
})
addBasicCard({ score: 2 }, { name: 'ANCIENT', type: ['red'] });
addBasicCard({ score: 3 }, { name: 'ANTLERS', type: ['red'] });
addBasicCard({ score: 4 }, {
  name: 'APEX PREDATOR', type: ['red'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let points: number = 4;
    const myCount: number = allPlayerCards[currentPlayer].length;

    forEachPlayerCards(allPlayerCards, (playerCards, i) => {
      if (i !== currentPlayer && playerCards.length >= myCount) {
        points = 0;
      }
    });

    inst.applyPoints(currentPlayer, 'B', points, inst, 'has the most traits');
  }
})
addBasicCard({ score: 3 }, { name: 'APPEALING', type: ['green'] });
addBasicCard({ score: 0 }, { name: 'AUTOMIMICRY', type: ['blue'] });
