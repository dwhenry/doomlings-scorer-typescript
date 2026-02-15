import { addBasicCard } from '../cardContainer';
import { CALC_B_PHASES, CardInstance } from '../types';
import { forEachPlayerCards } from './helpers';

addBasicCard({ score: 1 }, { name: 'LATE', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'LEAVES', type: ['green'], pack: 'Classic' });
addBasicCard({ score: 8 }, { name: 'LEGENDARY', type: ['blue'], pack: 'Mythlings' });

addBasicCard({ score: 1 }, {
  name: 'LYONIZATION', type: ['green'], pack: 'Techlings',
  calcBRunPhase: CALC_B_PHASES.DO_ME_FIRST,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const [playerIndex, cardName] = inst.metadata.attached_to as [string, string];

    forEachPlayerCards(allPlayerCards, (playerCards, i) => {
      if (i.toString() === playerIndex) {
        const attachedTo = playerCards.find((cardInst) => cardInst.card.name === cardName);
        if (!attachedTo) {
          inst.generatedMetadata.attached_to = [];
          return
        }

        attachedTo.attachedCards.push(inst);
        attachedTo.skipCalcB = true;
        attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached and effect is disabled');
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
})
