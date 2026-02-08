export const TRAIT_CARD_TYPES = [
  'colourless',
  'purple',
  'red',
  'green',
  'blue'
] as const;
const catastropheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [
  ...TRAIT_CARD_TYPES,
  ...catastropheCardTypes,
  ...otherCardTypes
] as const;
export type CardType = (typeof CardTypes)[number];

export const PACK_TYPES = [
  'Classic',
  'Special Edition',
  'multi-colour',
  'Dinolings',
  'Mythlings',
  'Techlings',
  'Meaning of Life',
  'Overlush',
  'KSE'
] as const;
export type PackType = (typeof PACK_TYPES)[number];

const simpleMetaDataTypes = [
  'number',
  'trait',
  'CardType',
  'catastrophe',
  'player_card'
] as const;
const catastropheMetaDataTypes = ['card_per_person'] as const;
const MetaDataTypes = [
  ...simpleMetaDataTypes,
  ...catastropheMetaDataTypes
] as const;
export type MetaDataType = (typeof MetaDataTypes)[number];

export const META_DATA_SCOPES = [
  'card',
  'player',
  'global',
  'internal'
] as const;
export type MetaDataScope = (typeof META_DATA_SCOPES)[number];

type MetaData = [string, MetaDataType, MetaDataScope];

export interface Card {
  name: string;
  type: CardType[];
  pack: PackType;
  effect?: string;
  calcA?(
    card: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
  modify?(
    card: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
  calcB?(
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
  calcC?(inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>): void;
  metadataRequired?: Array<MetaData>;
}

export interface CatastopheCard extends Card {
  calcC(inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>): void;
}

export interface PlayerCard extends Card {
  calcA(
    card: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
}

type Metadata = {
  [key: string]: string | number | string[] | undefined;
  fromColour?: CardType;
  toColour?: CardType;
  colour?: CardType;
};

export class CardInstance {
  card: Card;
  // TODO AF: See if we can delete traitPoints?
  traitPoints: number = 0;
  overrides: { [key: string]: string[] | string | number } = {};
  finalA: number = 0;
  finalB: number | undefined = 0;
  finalC: number = 0;
  metadataComplete: boolean = true;
  metadata: Metadata;
  discarded: boolean = false;
  skipCalcB: boolean = false;
  generatedMetadata: Record<string, string | number | string[]> = {};
  pointsLog: Array<{
    phase: 'A' | 'B' | 'C';
    phaseSubtotal: number | undefined;
    points: number | undefined;
    fromCard: CardInstance;
    message: string;
  }> = [];

  constructor(card: Card, metadata: Metadata) {
    this.card = card;
    this.metadata = metadata;
  }

  get type(): string[] {
    if (Array.isArray(this.overrides['type'])) {
      return this.overrides['type'];
    }
    return this.card.type;
  }

  setOverride(key: string, value: string[] | string | number) {
    this.overrides[key] = value;
  }

  applyPoints(
    phase: 'A' | 'B' | 'C',
    points: number | undefined,
    fromCard: CardInstance,
    message: string
  ) {
    let finalPoints: number | undefined = undefined;
    let finalMessage: string = message;
    let phaseSubtotal: number | undefined = undefined;

    if (phase === 'A') {
      throw new Error('Cannot modify finalA points');
    } else if (phase === 'B') {
      // undefined is due to metadata not being set, this will update once the metadata is set
      if (this.finalB !== undefined) {
        if (points === undefined) {
          // this is a edge case related to other player card counts.
          this.finalB = undefined;
          finalMessage += '; Reset B phase due to missing data';
        } else {
          this.finalB += points;
        }
        phaseSubtotal = this.finalB
      }
    } else if (phase === 'C') {
      this.finalC += points ?? 0;
      phaseSubtotal = this.finalC;
    }
    this.pointsLog.push({ phase, phaseSubtotal, points: finalPoints, fromCard, message: finalMessage });
  }
}

export interface PlayerInput {
  name: string;
  [key: string]: string | number | string[];
}
