import { PlayerCard, CardInstance, CardType } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

addBasicCard('VAMPIRISM', 'purple', 'Classic', 3);
addBasicCard('VENOMOUS', 'purple', 'Classic', -2);

// At World's End: Choose a color. Opponents receive -1 for each trait of that color in their trait pile.
const viral: PlayerCard = {
  name: 'VIRAL',
  type: ['purple'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 2;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (!inst.metadata.colour) {
      throw new Error('invalid data for metadata field colour');
    }
    const chosenColour = inst.metadata.colour as CardType;

    // Apply -1 per trait of chosen color to each opponent
    allPlayerCards.forEach((playerCards, playerIndex) => {
      if (playerIndex !== currentPlayer) {
        playerCards.forEach((card) => {
          if (card.type.includes(chosenColour)) {
            card.finalA -= 1;
          }
        });
      }
    });

    inst.finalB = 0;
  },
  metadataRequired: [['colour', 'CardType', 'card']]
};
addCard(viral);

addBasicCard('VORACIOUS', 'red', 'Classic', 2);
