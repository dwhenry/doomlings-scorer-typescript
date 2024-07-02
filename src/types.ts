const traitCardTypes = [
  'colourless',
  'purple',
  'red',
  'green',
  'blue'
] as const;
const catastropheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [
  ...traitCardTypes,
  ...catastropheCardTypes,
  ...otherCardTypes
] as const;
export type CardType = (typeof CardTypes)[number];

const PackTypes = [
  'Classic',
  'Special Edition',
  'multi-colour',
  'Dinolings',
  'Mythlings',
  'Techlings',
  'Meaning of Life',
  'Overlush'
] as const;
export type PackType = (typeof PackTypes)[number];

const simpleMetaDataTypes = ['number', 'trait', 'CardType'] as const;
const catastropheMetaDataTypes = ['card_per_person'] as const;
const MetaDataTypes = [
  ...simpleMetaDataTypes,
  ...catastropheMetaDataTypes
] as const;
type MetaDataType = (typeof MetaDataTypes)[number];
type MetaData = [string, MetaDataType];

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
  [key: string]: string | number | string[] | undefined,
  fromColour?: CardType,
  toColour?: CardType,
  colour?: CardType
};

export class CardInstance {
  card: Card;
  traitPoints: number = 0;
  overrides: { [key: string]: string[] | string | number } = {};
  finalA: number = 0;
  finalB: number = 0;
  metadata: Metadata

  constructor(card: Card, metadata: Metadata) {
    this.card = card;
    this.metadata = metadata
  }

  get type(): string[] {
    if(Array.isArray(this.overrides['type'])) {
      return this.overrides['type']
    }
    return this.card.type
  }

  setOverride(key: string, value: string[] | string | number ) {
    this.overrides[key] = value
  }
}

export interface PlayerInput {
  name: string;
  [key: string]: string | number | string[];
}
