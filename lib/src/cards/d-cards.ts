import { addBasicCard, addCard } from '../cardContainer';
import { CardInstance, CardType, PlayerCard } from '../types';
import { playerCards } from './helpers';

addBasicCard('DEEP ROOTS', 'green', 'Classic', 2);
addBasicCard('DELICIOUS', 'colourless', 'Classic', 4);
addBasicCard('DERMAL ARMOR', 'colourless', 'Dinolings', 2);
addBasicCard('DESTINED', 'colourless', 'Mythlings', 4);
addBasicCard('DIAPHANOUS WINGS', 'blue', 'Mythlings', -1);
addBasicCard('DIRECTLY REGISTER', 'purple', 'Classic', 1);
addBasicCard('DOTING', 'colourless', 'Classic', 2);

// Bonus 4 points if "all 4 colours" are present
const dragonHeart: PlayerCard = {
  name: 'DRAGON HEART',
  type: ['red'],
  pack: 'Mythlings',
  calcA: function (card: CardInstance): void {
    card.applyPoints('A', 1, card, 'face card value')
  },
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
      card.applyPoints('B', 4, card, 'all 4 colours are present');
    } else {
      card.applyPoints('B', 0, card, 'not all 4 colours are present');
    }
  }
};
addCard(dragonHeart);

// TODO: we need to order the catastrophe cards based on the order they are selected.
// ignore_next_catastrophe will then ignore based off position in the order.
const denial: PlayerCard = {
  name: 'DENIAL',
  type: ['colourless'],
  pack: 'Classic',
  calcA: function (card: CardInstance): void {
    card.applyPoints('A', 4, card, 'face card value')
  },
  metadataRequired: [['ignore_next_catastrophe', 'catastrophe', 'card']]
};
addCard(denial);

addBasicCard('DREAMER', 'purple', 'Classic', 1);
