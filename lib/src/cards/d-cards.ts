import { addBasicCard } from '../cardContainer';
import { CardInstance, CardType } from '../types';
import { playerCards } from './helpers';

addBasicCard({ score: 2 }, { name: 'DEEP ROOTS', type: ['green'] });
addBasicCard({ score: 4 }, { name: 'DELICIOUS', type: ['colourless'] });
addBasicCard({ score: 2 }, { name: 'DERMAL ARMOR', type: ['colourless'] });
addBasicCard({ score: 4 }, { name: 'DESTINED', type: ['colourless'] });
addBasicCard({ score: -1 }, { name: 'DIAPHANOUS WINGS', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'DIRECTLY REGISTER', type: ['purple'] });
addBasicCard({ score: 2 }, { name: 'DOTING', type: ['colourless'] });
// Bonus 4 points if "all 4 colours" are present
addBasicCard({ score: 1 }, {
  name: 'DRAGON HEART', type: ['red'],
  calcB: function (
    card: CardInstance,
    allPlayerCards,
    currentPlayer: number
  ): void {
    const currentPlayerCards = playerCards(allPlayerCards, currentPlayer);

    const validColours: readonly CardType[] = [
      'purple',
      'green',
      'red',
      'blue'
    ] as const;
    const uniqueMatchingColours: Set<CardType> = new Set(
      currentPlayerCards
        .filter((c) =>
          validColours.find((colour) => c.card.type.includes(colour))
        )
        .flatMap((c) => c.card.type)
    );

    if (uniqueMatchingColours.size === validColours.length) {
      card.applyPoints(currentPlayer, 'B', 4, card, 'all 4 colours are present');
    } else {
      card.applyPoints(currentPlayer, 'B', 0, card, 'not all 4 colours are present');
    }
  }
});

// ignore_next_catastrophe will then ignore based off position in the order.
addBasicCard({ score: 4 }, { name: 'DENIAL', type: ['colourless']});
addBasicCard({ score: 1 }, { name: 'DREAMER', type: ['purple'] });
