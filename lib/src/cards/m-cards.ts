import { addBasicCard, addCardThatPointsByColour } from '../cardContainer';
import { CALC_B_PHASES, CardInstance } from '../types';
import { isEffectless } from './effect_cards';
import { playerCards } from './helpers';

addBasicCard({ score: 2 }, {
  name: 'MECHA',
  type: ['blue'],
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const attachedTo = playerCards(allPlayerCards, currentPlayer)
      .find((cardInst) => cardInst.card.name === inst.metadata.attached_to)
    // TODO: better feedback on why the attachment failed
    if (!attachedTo) {
      inst.generatedMetadata.attached_to = '';
      if(inst.metadata.attached_to) {
        inst.generatedMetadata.error = `Attempted to attach to ${inst.metadata.attached_to} but it was not found in the player's hand`;
      }
      return
    }
    if (!isEffectless(attachedTo.card.name)) {
      inst.generatedMetadata.attached_to = '';
      inst.generatedMetadata.error = `Attempted to attach to ${attachedTo.card.name} but it is not effectless`;
      return
    }

    attachedTo.attachedCards.push(inst);
    attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached');

    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (isEffectless(cardInst.card.name)) {
        cardInst.applyPoints(currentPlayer, 'B', 0, inst, 'for being an effectless trait');
      }
    });
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});
addBasicCard({ score: 2 }, { name: 'MEMORY', type: ['purple'] });
addBasicCard({ score: 2 }, { name: 'MIGHTY', type: ['red'] });
addBasicCard({ score: 2 }, { name: 'MIGRATORY', type: ['blue'] });
addCardThatPointsByColour(
  { score: 0, colour: 'colourless', pointsPerCard: 1 },
  { name: 'MINDFUL', type: ['colourless'] }
);
addBasicCard({ score: 1 }, { name: 'MITOCHONDRION', type: ['colourless'] });
addBasicCard({ score: 1 }, { name: 'MITOSIS', type: ['blue', 'purple'] });
addBasicCard({ score: 5 }, { name: 'MORALITY', type: ['colourless'] });
addBasicCard({ score: 4 }, { name: 'MOTLEY', type: ['blue', 'green', 'purple', 'red'] });
