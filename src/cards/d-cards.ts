import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, CardType, PlayerCard } from "../types";

addBasicCard('DEEP ROOTS', 'green', 'Classic', 2);

const delicious: PlayerCard = {
  name: 'DELICIOUS',
  type: 'colourless',
  pack: 'Classic',
  calcA: function (card: CardInstance, allPlayerCards: CardInstance[][], currentPlayer: number): void {
    const currentPlayerCards = allPlayerCards[currentPlayer];
    // A different colourless card!
    const colourlessTraitCard = currentPlayerCards.find(card => card.card.type === 'colourless' && this.name !== card.card.name);
    if (colourlessTraitCard) {
        card.finalA = 4;
    } else {
        card.finalA = 0;
    }
  }
};
addCard(delicious);

// TODO: Denial has been skipped as it's catastrophe. related
// addBasicCard('DENIAL', 'colourless', 'Classic', 4);

addBasicCard('DERMAL ARMOR', 'colourless', 'Dinolings', 2);
addBasicCard('DESTINED', 'colourless', 'Mythlings', 4);
addBasicCard('DIAPHANOUS WINGS', 'blue', 'Mythlings', -1);
addBasicCard('DIRECTLY REGISTER', 'purple', 'Classic', 1);
addBasicCard('DOTING', 'colourless', 'Classic', 2);

// 4 points if "all 4 colours" are present
const dragonHeart: PlayerCard = {
  name: 'DRAGON HEART',
  type: 'red',
  pack: 'Mythlings',
  calcA: function (card: CardInstance, allPlayerCards: CardInstance[][], currentPlayer: number): void {
    const currentPlayerCards = allPlayerCards[currentPlayer];
    
    const validColours = ['purple', 'green', 'red', 'blue'] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueMatchingColours = new Set(currentPlayerCards.filter(c => validColours.includes(c.card.type as unknown as any) ).map(c => c.card.type));

    if (uniqueMatchingColours.size === validColours.length) {
      card.finalA = 5;
    } else {
      card.finalA = 1;
    }
  }
};
addCard(dragonHeart);

addBasicCard('DREAMER', 'purple', 'Classic', 1);