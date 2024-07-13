import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, CardType, PlayerCard } from "../types";

const gmo: PlayerCard = {
  name: 'KIDNEY',
  type: ['red'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const kidneyCards = allPlayerCards[currentPlayer].filter(a => a.card.name == 'KIDNEY')
    inst.finalB = kidneyCards.length
  }
};
addCard(gmo);