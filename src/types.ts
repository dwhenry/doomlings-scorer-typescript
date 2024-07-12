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

// const simpleMetaDataTypes = ['number', 'trait', 'CardType'] as const;
// const catastropheMetaDataTypes = ['card_per_person'] as const;
// const MetaDataTypes = [
//   ...simpleMetaDataTypes,
//   ...catastropheMetaDataTypes
// ] as const;
// type MetaDataType = (typeof MetaDataTypes)[number];
// type MetaData = [string, MetaDataType];

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
  metadataRequired?: MetaDataKeys[];
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

type MetaDataKeys = (
  'cards_in_hand' |
  'discard' |
  'gene_pool_size' |
  'colour' |
  'fromColour' |
  'toColour' |
  'missing' |
  'attached_trait' |
  'trait' |
  'biggest_gene_pool_size' |
  // catastrophe
  'card_per_person'
)
type Metadata = {
  cards_in_hand?: number,
  discard?: string[],
  gene_pool_size?: number,
  colour?: CardType,
  fromColour?: CardType,
  toColour?: CardType,
  missing?: number,
  attached_trait: CardType,
  trait: CardType,
  biggest_gene_pool_size: number,
  card_per_person: number
};

export class CardInstance {
  card: Card;
  // TODO AF: See if we can delete traitPoints?
  traitPoints: number = 0;
  overrides: { [key: string]: string[] | string | number } = {};
  finalA: number = 0;
  finalB: number = 0;
  metadata: Metadata;
  attached: CardInstance[];
  parent: (CardInstance | undefined);

  constructor(card: Card, metadata: Metadata, attached: [card: Card, metadata: Metadata][] = [], parent: (CardInstance | undefined) = undefined) {
    this.card = card;
    this.metadata = metadata;
    this.attached = attached.map((attached: [card: Card, metadata: Metadata]): CardInstance => {
      return new CardInstance(attached[0], attached[1], [], this);
    })
    this.parent = parent;
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

export type PlayerInput = {
  // [key: string]: string | number | string[] | [name: string, metadata: PlayerInput][] | undefined,
  // [key: string]: any,
  cards_in_hand?: number,
  discard?: string[],
  gene_pool_size?: number,
  colour?: CardType,
  fromColour?: CardType,
  toColour?: CardType,
  missing?: number,
  attached?: [name: string, metadata: PlayerInput][],
  attached_trait?: CardType,
  trait?: CardType,
  biggest_gene_pool_size?: number,
  card_per_person?: number
  name: string,
}

