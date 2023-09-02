import { CardInstance, PlayerInput } from './types';
import { getCard } from './cardContainer';
import './cards';

export class Scorer {
  // Properties
  // allCards contains player and catastrophe cards -  we only return scores for player cards
  allPlayerCards: Array<Array<CardInstance>>;
  catastopheCards: Array<CardInstance>;

  constructor(
    catastopheInput: Array<PlayerInput>,
    ...cardsInput: Array<Array<PlayerInput>>
  ) {
    this.allPlayerCards = cardsInput.map((playerCards) => {
      return playerCards.map(
        (playerInput: PlayerInput): CardInstance =>
          getCard(playerInput.name, playerInput)
      );
    });
    this.catastopheCards = catastopheInput.map(
      (playerInput: PlayerInput): CardInstance =>
        getCard(playerInput.name, playerInput)
    );
  }

  // Functions
  scores(): number[] {
    this.allPlayerCards.forEach((playerCards, i) => {
      playerCards.forEach((inst) => {
        inst.card.calcA?.(inst, this.allPlayerCards, i);
        inst.card.calcB?.(inst, this.allPlayerCards, i);
      });
    });
    this.catastopheCards.forEach((inst) => {
      inst.card.calcC?.(inst, this.allPlayerCards);
    });

    const result: number[] = this.allPlayerCards.map((playerCards) => {
      return playerCards.reduce(
        (sum, inst) => sum + inst.finalA + inst.finalB || 0,
        0
      );
    });

    return result;
  }
}
