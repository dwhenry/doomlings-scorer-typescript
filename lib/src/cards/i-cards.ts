import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, PlayerCard } from "../types";

addBasicCard('ICY', 'blue', 'Mythlings', 3);

const immunity: PlayerCard = {
  name: 'IMMUNITY',
  type: ['blue'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 4;
  },
  calcB: (inst: CardInstance, 
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number): void => {
    const currentPlayerCards = allPlayerCards[currentPlayer];
    // TODO: Fix me - this only works if the instance is put back.
    const negativeFaceValueTraitsCount = currentPlayerCards.filter(c => c.finalA < 0).length;
    inst.finalB = negativeFaceValueTraitsCount * 2;
  }
};
addCard(immunity);

addBasicCard('IMPATIENCE', 'purple', 'Classic', 1);
addBasicCard('INTROSPECTIVE', 'colourless', 'Classic', 1);
addBasicCard('INVENTIVE', 'purple', 'Classic', 1);
addBasicCard('IRIDESCENT SCALES', 'blue', 'Classic', 1);
