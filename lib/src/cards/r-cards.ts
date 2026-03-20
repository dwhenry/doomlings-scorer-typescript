import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { playerCards } from './helpers';

addBasicCard({ score: 2 }, { name: 'RAINBOW HORN', type: ['colourless'] });

// Value is equal to the size of your Gene Pool
addBasicCard({ score: 0 }, {
  name: 'RANDOM FERTILIZATION', type: ['green'],
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

addBasicCard({ score: 3 }, { name: 'RECKLESS', type: ['red'] });
addBasicCard({ score: 0 }, { name: 'REGENERATIVE TISSUE', type: ['blue'] });
addBasicCard({ score: 5 }, { name: 'RETRACTABLE CLAWS', type: ['red'] });
addBasicCard({ score: 1 }, { name: 'RIGHTEOUS', type: ['blue'] });
addBasicCard({ score: 4 }, {
  name: 'RUGGEDIZED', type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (inst: CardInstance,
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
    attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached');
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});