import { CardInstance, CardType } from '../types';
import { addBasicCard } from '../cardContainer';
import { forEachPlayerCards } from './helpers';

addBasicCard({ score: 3 }, { name: 'VAMPIRISM', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: -2 }, { name: 'VENOMOUS', type: ['purple'], pack: 'Classic' });

// At World's End: Choose a color. Opponents receive -1 for each trait of that color in their trait pile.
addBasicCard({ score: 2 }, {
  name: 'VIRAL',
  type: ['purple'],
  pack: 'Classic',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (!inst.metadata.colour) {
      throw new Error('invalid data for metadata field colour');
    }
    const chosenColour = inst.metadata.colour as CardType;

    forEachPlayerCards(allPlayerCards, (playerCards, playerIndex) => {
      if (playerIndex !== currentPlayer) {
        playerCards.forEach((card) => {
          if (card.type.includes(chosenColour)) {
            card.applyPoints(
              'B',
              -1,
              inst,
              'for being a ' + chosenColour + ' trait'
            );
          }
        });
      }
    });

    // TODO: rescore after any colour changes
    // TODO: test that this actually works
  },
  metadataRequired: [['colour', 'CardType', 'card']]
});

addBasicCard({ score: 2 }, { name: 'VORACIOUS', type: ['red'], pack: 'Classic' });
