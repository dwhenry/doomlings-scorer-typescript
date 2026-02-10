import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { forEachPlayerCards } from './helpers';

// Attach to a trait in any trait pile. Value is equal to the face value of the host trait.
const nano: PlayerCard = {
  name: 'NANO',
  type: ['green'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 0, inst, 'face card value')
  },
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
        attachedTo.applyPoints('B', 0, inst, 'attached');

        inst.applyPoints(
          'B',
          attachedTo.finalA,
          inst,
          'for being a host trait'
        );
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
};
addCard(nano);
addBasicCard('NECROMANTIC', 'purple', 'Mythlings', 1);
addBasicCard('NEURAL LINK', 'blue', 'Techlings', 2);
addBasicCard('NOCTURNAL', 'purple', 'Classic', 3);
addBasicCard('NOSY', 'purple', 'Classic', 1);
