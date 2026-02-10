import { CALC_B_PHASES, CardInstance, PlayerInput, SCORING_PHASES } from './types';
import { getCard } from './cardContainer';
import './cards';

export enum Player {
  One = 0,
  Two = 1,
  Three = 2,
  Four = 3
}

export class Scorer {
  // Properties
  // allCards contains player and catastrophe cards -  we only return scores for player cards
  private allPlayerCards: Array<Array<CardInstance>>;
  private catastopheCards: Array<CardInstance> = [];

  constructor(...cardsInput: Array<Array<PlayerInput>>) {
    this.allPlayerCards = cardsInput.map((playerCards) => {
      return playerCards.map(
        (playerInput: PlayerInput): CardInstance =>
          getCard(playerInput.name, playerInput)
      );
    });
  }

  addCatastrophes(catastopheInput: Array<PlayerInput>) {
    this.catastopheCards = [
      ...this.catastopheCards,
      ...catastopheInput.map(
        (playerInput: PlayerInput): CardInstance =>
          getCard(playerInput.name, playerInput)
      )
    ];
    return this;
  }

  calcA() {
    this.allPlayerCards.forEach((playerCards, playerIndex) => {
      playerCards.forEach((inst) => {
        inst.card.calcA?.(inst, this.allPlayerCards, playerIndex);
      });
    });
  }

  calcB(calcBRunPhase: typeof CALC_B_PHASES[keyof typeof CALC_B_PHASES]) {
    this.allPlayerCards.forEach((playerCards, i) => {
      playerCards.forEach((inst) => {
        if (calcBRunPhase === inst.card.calcBRunPhase) {
          if (inst.discarded || inst.skipCalcB) {
            return;
          }
          if (!inst.metadataComplete) {
            inst.finalB = undefined;
          } else {
            inst.card.calcB?.(inst, this.allPlayerCards, i);
          }
        }
      });
    });

  }

  calcC() {
    this.allPlayerCards.forEach((playerCards) => {
      playerCards.forEach((inst) => {
        if (inst.discarded) {
          inst.applyPoints(
            'C',
            -(inst.finalA + (inst.finalB ?? 0)),
            inst,
            'Discarded'
          );
        }
      });
    });
  }

  catastrophe() {
    // We have a special card that ignores the next catastrophe
    // this does not fit with the current scoring logic, so we
    // need to handle it separately.
    // we first find all cards that ignore the next catastrophe
    // then map to the catastrophe position and player position
    // when that catastrophe is processed, we filter out the player
    // cards so they are not included in the scoring.
    const ignoreCatastrophes = this.allPlayerCards.flatMap((playerCards, pos) =>
      playerCards
        .filter((card) => card.metadata.ignore_next_catastrophe)
        .map((card) => [card.metadata.ignore_next_catastrophe, pos])
    );

    // calc C (catastrophes) - runs before calcB so discards/overrides affect conditional scoring
    this.catastopheCards.forEach((inst, catIndex) => {
      // this is a list of player position that ignore this catastrophe
      const applyPosFilter = ignoreCatastrophes
        .filter(([name, _pos]) => name === catIndex.toString())
        .map(([_, pos]) => pos);

      // this is the player cards with filtered users not being applied
      const filteredPlayerCards = this.allPlayerCards.map((playerCards, pos) =>
        applyPosFilter.includes(pos) ? [] : playerCards
      );

      inst.card.calcC?.(inst, filteredPlayerCards);
    });
  }

  // Functions
  scores(): GameScore {
    type PHASES_TYPE = (
      [typeof SCORING_PHASES[keyof typeof SCORING_PHASES], typeof CALC_B_PHASES[keyof typeof CALC_B_PHASES]] |
      [typeof SCORING_PHASES[keyof typeof SCORING_PHASES]]
    )[]
    const phases: PHASES_TYPE = [
      [SCORING_PHASES.CALC_A],
      [SCORING_PHASES.CALC_B, CALC_B_PHASES.PRE_CATASTROPHE],
      [SCORING_PHASES.CATASTROPHE],
      [SCORING_PHASES.CALC_B, CALC_B_PHASES.POST_CATASTROPHE],
      [SCORING_PHASES.CALC_B, CALC_B_PHASES.PRE_MEANING_OF_LIFE],
      [SCORING_PHASES.CALC_B, CALC_B_PHASES.MEANING_OF_LIFE],
      [SCORING_PHASES.CALC_C]
    ]
    phases.forEach((phase) => {
      const [phaseType, ...args] = phase;
      (this[phaseType] as (...args: unknown[]) => void)(...args);
    })

    const playerScores: PlayerScore[] = this.allPlayerCards.map(
      (playerCards) => {
        const playerCardsScores: CardScore[] = playerCards.map((c) => {
          const finalA = c.finalA;
          const finalB = c.finalB;
          const finalC = c.finalC;
          const discarded = c.discarded;
          const total =
            finalB !== undefined ? finalA + finalB + finalC : undefined;
          const generatedMetadata =
            Object.keys(c.generatedMetadata).length > 0
              ? { ...c.generatedMetadata }
              : undefined;
          return { finalA, finalB, total, discarded, generatedMetadata };
        });

        return new PlayerScore(playerCardsScores);
      }
    );

    const catastropheGeneratedMetadata: Array<
      Record<string, string | number | string[]>
    > = this.catastopheCards.map((c) =>
      Object.keys(c.generatedMetadata).length > 0
        ? { ...c.generatedMetadata }
        : {}
    );

    const winningPlayersIndices = playerScores.reduce(
      (maxScorePlayerIndices: number[], playerScore, index, arr) => {
        const currentMax = arr[maxScorePlayerIndices[0]];
        if (playerScore.total === currentMax.total) {
          return [...maxScorePlayerIndices, index];
        } else if (playerScore.total > currentMax.total) {
          return [index];
        } else {
          return maxScorePlayerIndices;
        }
      },
      [0]
    );

    return new GameScore(
      winningPlayersIndices,
      playerScores,
      catastropheGeneratedMetadata
    );
  }

  getPlayerCards(playerIndex: Player): CardInstance[] {
    // TODO: Throw
    return this.allPlayerCards[playerIndex];
  }
}

export class GameScore {
  private winningPlayersIndices: Player[];
  private playerScores: PlayerScore[];
  private _catastropheGeneratedMetadata: Array<
    Record<string, string | number | string[]>
  >;

  constructor(
    winningPlayersIndices: Player[],
    playerScores: PlayerScore[],
    catastropheGeneratedMetadata: Array<
      Record<string, string | number | string[]>
    > = []
  ) {
    this.winningPlayersIndices = winningPlayersIndices;
    this.playerScores = playerScores;
    this._catastropheGeneratedMetadata = catastropheGeneratedMetadata;
  }

  getPlayerScores(): PlayerScore[] {
    return this.playerScores;
  }

  getPlayerScore(playerIndex: Player): PlayerScore {
    const playerScore = this.playerScores[playerIndex];
    if (!playerScore) {
      throw new Error(`Player of index ${playerIndex} not found`);
    }
    return playerScore;
  }

  getPlayerCardsWithGeneratedMetadata() {
    let cardsWithGeneratedMetadata: { card: CardScore, playerIndex: number, cardIndex: number }[] = [];
    this.playerScores.forEach(
      (playerScore, playerIndex) => playerScore.getCardScores().forEach(
        (cardScore, cardIndex) => {
          if (cardScore.generatedMetadata && Object.keys(cardScore.generatedMetadata).length > 0) {
            cardsWithGeneratedMetadata.push({ card: cardScore, playerIndex, cardIndex });
          }
        }
      )
    )
    return cardsWithGeneratedMetadata;
  }

  getCatastropheGeneratedMetadata(): Array<
    Record<string, string | number | string[]>
  > {
    return this._catastropheGeneratedMetadata;
  }
}

export class PlayerScore {
  private _total: number;
  private playerCardsScores: CardScore[];

  constructor(playerCardsScores: CardScore[]) {
    this.playerCardsScores = playerCardsScores;
    this._total = playerCardsScores.reduce(
      (sum, current) => sum + (current.total ?? 0),
      0
    );
  }

  public get total() {
    return this._total;
  }

  public getCardScoreByIndex(cardIndex: number): CardScore {
    const cardScore = this.playerCardsScores.at(cardIndex);
    if (!cardScore) {
      throw new Error(`No card exists at index ${cardIndex}`);
    }
    return cardScore;
  }

  public getCardScores(): CardScore[] {
    return this.playerCardsScores;
  }

  public getGeneratedMetadata(
    cardIndex: number
  ): Record<string, string | number | string[]> | undefined {
    const cardScore = this.playerCardsScores.at(cardIndex);
    return cardScore?.generatedMetadata;
  }
}

export interface CardScore {
  total: number | undefined;
  finalA: number;
  finalB?: number;
  finalC?: number;
  discarded?: boolean;
  generatedMetadata?: Record<string, string | number | string[]>;
}
