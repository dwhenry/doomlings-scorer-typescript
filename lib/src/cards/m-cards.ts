import { addBasicCard, addCardThatPointsByColour } from '../cardContainer';
import { CALC_B_PHASES, CardInstance } from '../types';
import { isEffectless } from './effect_cards';
import { playerCards } from './helpers';

addBasicCard({ score: 2 }, {
  name: 'MECHA',
  type: ['blue'],
  pack: 'Techlings',
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const attachedTo = playerCards(allPlayerCards, currentPlayer)
      .find((cardInst) => cardInst.card.name === inst.metadata.attached_to)
    // TODO: better feedback on why the attachment failed
    if (!attachedTo || !isEffectless(attachedTo.card.name)) {
      inst.generatedMetadata.attached_to = '';
      return
    }

    attachedTo.attachedCards.push(inst);
    attachedTo.applyPoints('B', 0, inst, 'attached');

    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (isEffectless(cardInst.card.name)) {
        cardInst.applyPoints('B', 0, inst, 'for being an effectless trait');
      }
    });
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});
addBasicCard({ score: 2 }, { name: 'MEMORY', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'MIGHTY', type: ['red'], pack: 'Mythlings' });
addBasicCard({ score: 2 }, { name: 'MIGRATORY', type: ['blue'], pack: 'Classic' });
addCardThatPointsByColour(
  { score: 0, colour: 'colourless', pointsPerCard: 1 },
  { name: 'MINDFUL', type: ['colourless'], pack: 'Classic' }
);
addBasicCard({ score: 1 }, { name: 'MITOCHONDRION', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'MITOSIS', type: ['blue', 'purple'], pack: 'multi-colour' });
addBasicCard({ score: 5 }, { name: 'MORALITY', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 4 }, { name: 'MOTLEY', type: ['blue', 'green', 'purple', 'red'], pack: 'multi-colour' });
