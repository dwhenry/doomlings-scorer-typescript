import { addBasicCard, addCard, addCardThatPointsByColour } from '../cardContainer';
import { CardInstance, PlayerCard } from '../types';
import { isEffectless } from './effect_cards';
import { playerCards } from './helpers';

const mecha: PlayerCard = {
  name: 'MECHA',
  type: ['blue'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 2, inst, 'face card value')
  },
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
};
addCard(mecha);
addBasicCard('MEMORY', 'purple', 'Classic', 2);
addBasicCard('MIGHTY', 'red', 'Mythlings', 2);
addBasicCard('MIGRATORY', 'blue', 'Classic', 2);
addCardThatPointsByColour(
  'MINDFUL',
  'colourless',
  'Classic',
  0,
  'colourless',
  1
);
addBasicCard('MITOCHONDRION', 'colourless', 'Classic', 1);
addBasicCard('MITOSIS', ['blue', 'purple'], 'multi-colour', 1);
addBasicCard('MORALITY', 'colourless', 'Classic', 5);
addBasicCard('MOTLEY', ['blue', 'green', 'purple', 'red'], 'multi-colour', 4);
