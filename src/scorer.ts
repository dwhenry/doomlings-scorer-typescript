import { CardInstance, PlayerInput } from './types';
import { getCard } from './cardContainer';
import './cards';

export enum Player {
  One = 0,
  Two = 1,
  Three = 2,
  Four = 3,
}

export class Scorer {
  // Properties
  // allCards contains player and catastrophe cards -  we only return scores for player cards
  private allPlayerCards: Array<Array<CardInstance>>;
  private catastopheCards: Array<CardInstance> = [];

  constructor(
    ...cardsInput: Array<Array<PlayerInput>>
  ) {
    this.allPlayerCards = cardsInput.map((playerCards) => {
      return playerCards.map(
        (playerInput: PlayerInput): CardInstance =>
          getCard(playerInput.name, playerInput)
      );
    });

  }

  addCatastrophes(catastopheInput: Array<PlayerInput>) {
    this.catastopheCards = [...this.catastopheCards, ...catastopheInput.map(
      (playerInput: PlayerInput): CardInstance =>
        getCard(playerInput.name, playerInput)
    )];
    return this;
  }

  // Functions
  scores(): GameScore {
    // calc A (base score) and apply any modifiers
    this.allPlayerCards.forEach((playerCards, playerIndex) => {
      playerCards.forEach((inst) => {
        inst.card.calcA?.(inst, this.allPlayerCards, playerIndex);
        inst.card.modify?.(inst, this.allPlayerCards, playerIndex);
        inst.attached.forEach((attched) => {
          attched.card.calcA?.(inst, this.allPlayerCards, playerIndex);
          attched.card.modify?.(inst, this.allPlayerCards, playerIndex);
        })
      });
    });
    // calc B (modifiers based on traits)
    this.allPlayerCards.forEach((playerCards, playerIndex) => {
      playerCards.forEach((inst) => {
        inst.card.calcB?.(inst, this.allPlayerCards, playerIndex);
        inst.attached.forEach((attched) => {
          attched.card.calcB?.(inst, this.allPlayerCards, playerIndex);
        })
      });
  });
    // calc C (catastophes)
    this.catastopheCards.forEach((inst) => {
      inst.card.calcC?.(inst, this.allPlayerCards);
    });

    const playerScores: PlayerScore[] = this.allPlayerCards.map((playerCards) => {
      // TODO AF: Add calcC when implemented
      const playerCardsScores: CardScore[] = playerCards.flatMap(c => {
        const finalA = c.finalA;
        const finalB = c.finalB ?? 0
        const total = finalA + finalB;
        let scores = [{finalA, finalB, total, card: c.card.name}]
        c.attached.forEach((attached) => {
          const attachedfinalA = attached.finalA;
          const attachedfinalB = attached.finalB ?? 0
          const attachedtotal = attachedfinalA + attachedfinalB;
          scores.push({finalA: attachedfinalA, finalB: attachedfinalB, total: attachedtotal, card: "Attached: " || attached.card.name})
        })
        return scores
      });

      return new PlayerScore(playerCardsScores)
    });

    const winningPlayersIndices = playerScores.reduce((maxScorePlayerIndices: number[], playerScore, index, arr) => {
      const currentMax = arr[maxScorePlayerIndices[0]] // Get value of first max, but we can have multiple "max" values however they should all be equal to be "equal winners" so we can always take the first.
      if (playerScore.total === currentMax.total ) {
        return [...maxScorePlayerIndices, index]
      } else if (playerScore.total > currentMax.total) {
        return [index]
      } else {
        return maxScorePlayerIndices
      }
    }, [0]);

    return new GameScore(winningPlayersIndices, playerScores);
  }

  getPlayerCards(playerIndex: Player): CardInstance[] {
    // TODO: Throw
    return this.allPlayerCards[playerIndex];
  }
}

export class GameScore {
  private winningPlayersIndices: Player[];
  private playerScores: PlayerScore[];

  constructor(winningPlayersIndices: Player[], playerScores: PlayerScore[]) {
    this.winningPlayersIndices = winningPlayersIndices;
    this.playerScores = playerScores;
  };

  getPlayerScores() : PlayerScore[] {
    return this.playerScores;
  }

  getPlayerScore(playerIndex: Player) : PlayerScore {
    const playerScore = this.playerScores[playerIndex];
    if (!playerScore) {
      throw new Error(`Player of index ${playerIndex} not found`)
    }
    return playerScore;
  }
}

export class PlayerScore {
  private _total: number;
  private playerCardsScores: CardScore[];

  constructor(playerCardsScores: CardScore[]) {
    this.playerCardsScores = playerCardsScores
    this._total = playerCardsScores.reduce((sum, current) => sum + current.total, 0)
  }


  public get total() {
      return this._total;
  }

  public getCardScoreByIndex(cardIndex: number) : CardScore {
    const cardScore = this.playerCardsScores.at(cardIndex);
    if (!cardScore) {
      throw new Error(`No card exists at index ${cardIndex}`)
    }
    return cardScore;
  }

  public getCardScores() : CardScore[] {
    return this.playerCardsScores
  }
}


export interface CardScore {
  total: number;
  finalA: number;
  finalB?: number;
  finalC?: number;
}
