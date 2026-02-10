import { addBasicCard, addCard } from '../cardContainer';
import { CardInstance, PlayerCard } from '../types';
import { isEffectless } from './effect_cards';
import { forEachPlayerCards, playerCards } from './helpers';

addBasicCard('LATE', 'colourless', 'Classic', 1);
addBasicCard('LEAVES', 'green', 'Classic', 1);
addBasicCard('LEGENDARY', 'blue', 'Mythlings', 8);

const lyonization: PlayerCard = {
  name: 'LYONIZATION',
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
        attachedTo.applyPoints('B', 0, inst, 'attached and effect is disabled');
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
};
addCard(lyonization)
