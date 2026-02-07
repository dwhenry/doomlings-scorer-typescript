import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, CardType, PlayerCard } from "../types";

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
    card.finalA = 1;
  }, 
  calcB: function (card: CardInstance, allPlayerCards, currentPlayer: number) : void {
     const currentPlayerCards = allPlayerCards[currentPlayer];
    
    const validColours: readonly CardType[] = ['purple', 'green', 'red', 'blue'] as const;
    const uniqueMatchingColours: Set<CardType> = new Set(currentPlayerCards.filter(c => validColours.find(colour => c.card.type.includes(colour))).map(c => c.card.type).flat());

    if (uniqueMatchingColours.size === validColours.length) {
      card.finalB = 4;
    } else {
      card.finalB = 0;
    }
  }
};
addCard(dragonHeart);

addBasicCard('DREAMER', 'purple', 'Classic', 1);