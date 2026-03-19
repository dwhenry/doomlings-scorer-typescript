export const SCORING_PHASES = {
  CALC_A: 'calcA',
  CALC_B: 'calcB',
  CALC_C: 'calcC',
  CATASTROPHE: 'catastrophe',
} as const;

export const CALC_B_PHASES = {
  DO_ME_FIRST: 'pre_start',
  PRE_CATASTROPHE: 'pre_catastrophe',
  POST_CATASTROPHE: 'post_catastrophe',
  PRE_MEANING_OF_LIFE: 'pre_meaning_of_life',
  MEANING_OF_LIFE: 'meaning_of_life',
} as const

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

/** Known release names (display order). From worldofdoomlings.com */
export const RELEASE_TYPES = [
  'Classic Game',
  'Classic Game (Kickstarter)',
  'Black Box (Kickstarter)',
  'Gold Box (Kickstarter)',
  'Deluxe Bundle',
  'Upgrade Pack',
  'Special Edition',
  'Overlush'
] as const;
export type ReleaseType = (typeof RELEASE_TYPES)[number];

/** Known collection names (display order). From worldofdoomlings.com */
export const COLLECTION_TYPES = [
  'Classic',
  'Dinolings',
  'Mythlings',
  'Techlings',
  'Multi-Color',
  'Special Edition',
  'Meaning of Life',
  'Overlush'
] as const;
export type CollectionType = (typeof COLLECTION_TYPES)[number];

/** Name of the special per-player card used for catastrophe player-level points. Not visible in UI; cannot be removed. */
export const PLAYER_CARD_NAME = '__PLAYER__';

const simpleMetaDataTypes = [
  'number',
  'trait',
  'card_type',
  'catastrophe',
  'player_card',
  'any_player_card'
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

type MetaData =
| [string, MetaDataType, MetaDataScope]
| [string, MetaDataType, MetaDataScope, 'player' | 'deck']
| [string, MetaDataType, MetaDataScope, 'player' | 'deck', (typeof TRAIT_CARD_TYPES)[number]];

export interface Card {
  name: string;
  type: CardType[];
  /** Collection from worldofdoomlings.com (e.g. "Classic", "Special Edition") */
  collection: CollectionType;
  /** Releases from worldofdoomlings.com (e.g. ["Classic Game", "Deluxe Bundle"]) */
  release: ReleaseType[];
  effect?: string;
  calcA?(
    card: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
  calcC?(inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>): void;
  metadataRequired?: Array<MetaData>;
}

export interface CatastropheCard extends Card {
  calcC(inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>): void;
  calcB?(
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
}

/** Catastrophe card without collection/release (set by addCard from CARD_COLLECTION_RELEASE) */
export type CatastropheCardInput = Omit<CatastropheCard, 'collection' | 'release'> & Partial<Pick<CatastropheCard, 'collection' | 'release'>>;

export interface PlayerCard extends Card {
  calcBRunPhase: typeof CALC_B_PHASES[keyof typeof CALC_B_PHASES];
  calcBRunPhase2?: typeof CALC_B_PHASES[keyof typeof CALC_B_PHASES];
  blocksDiscarding: boolean;
  calcA(
    card: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void;
  calcB?: CatastropheCard['calcB']
  calcB2?: CatastropheCard['calcB']
}

export type PlayerCardWithOptionalInputs<T extends keyof PlayerCard> =
  Omit<PlayerCard, T> & Partial<Pick<PlayerCard, T>>;

type Metadata = {
  [key: string]: string | number | string[] | undefined;
  fromColour?: CardType;
  toColour?: CardType;
  colour?: CardType;
};

export type PointsLog = {
  currentPlayer: number;
  phase: 'A' | 'B' | 'C';
  phaseSubtotal: number | undefined;
  points: number | undefined;
  fromCard: CardInstance;
  message: string;
}
export class CardInstance {
  card: PlayerCard | CatastropheCard;
  overrides: { [key: string]: string[] | string | number } = {};
  finalA: number = 0;
  finalB: number | undefined = 0;
  finalC: number = 0;
  metadataComplete: boolean = true;
  metadata: Metadata;
  discarded: CardInstance | undefined = undefined;
  attachedCards: CardInstance[] = [];
  skipCalcB: boolean = false;
  generatedMetadata: Record<string, string | number | string[]> = {};
  blocksDiscardingOnInst: boolean = false;
  pointsLog: Array<PointsLog> = [];

  constructor(card: PlayerCard | CatastropheCard, metadata: Metadata) {
    this.card = card;
    this.metadata = metadata;
  }

  get type(): string[] {
    if (Array.isArray(this.overrides['type'])) {
      return this.overrides['type'];
    }
    return this.card.type;
  }

  get blocksDiscarding(): boolean {
    return this.blocksDiscardingOnInst || (this.card as PlayerCard).blocksDiscarding;
  }

  setOverride(key: string, value: string[] | string | number) {
    this.overrides[key] = value;
  }

  applyPoints(
    currentPlayer: number,
    phase: 'A' | 'B' | 'C',
    points: number | undefined,
    fromCard: CardInstance,
    message: string
  ) {
    let finalMessage: string = message;
    let phaseSubtotal: number | undefined = undefined;

    if (phase === 'A') {
      this.finalA = points ?? 0;
      phaseSubtotal = this.finalA;
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
        phaseSubtotal = this.finalB ? this.finalB + this.finalA : undefined;
      }
    } else if (phase === 'C') {
      this.finalC += points ?? 0;
      phaseSubtotal = this.finalB ? this.finalA + this.finalB + this.finalC : undefined;
    }
    this.pointsLog.push({ currentPlayer, phase, phaseSubtotal, points, fromCard, message: finalMessage });
  }
}

export interface PlayerInput {
  name: string;
  [key: string]: string | number | string[];
}
