import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { forEachPlayerCards } from './helpers';

// Attach to a trait in any trait pile. Value is equal to the face value of the host trait.
addBasicCard({ score: 0 }, {
  name: 'NANO',
  type: ['green'],
  pack: 'Techlings',
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (inst: CardInstance,
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
        attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached');

        inst.applyPoints(currentPlayer,
          'B',
          attachedTo.finalA,
          inst,
          'for being a host trait'
        );
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
});
addBasicCard({ score: 1 }, { name: 'NECROMANTIC', type: ['purple'], pack: 'Mythlings' });
addBasicCard({ score: 2 }, { name: 'NEURAL LINK', type: ['blue'], pack: 'Techlings' });
addBasicCard({ score: 3 }, { name: 'NOCTURNAL', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'NOSY', type: ['purple'], pack: 'Classic' });
