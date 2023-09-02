const traitCardTypes = ['colourless', 'multi-colour', 'purple', 'red', 'green'] as const;
const catastropheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [...traitCardTypes, ...catastropheCardTypes, ...otherCardTypes] as const;
export type CardType = typeof CardTypes[number];

const simpleMetaDataTypes = ['number'] as const;
const catastropheMetaDataTypes = ['card_per_person'] as const;
const MetaDataTypes = [...simpleMetaDataTypes, ...catastropheMetaDataTypes] as const;
type MetaDataType = typeof MetaDataTypes[number];
type MetaData = [string, MetaDataType]

export interface Card {
  name: string;
  type: CardType,
  calcA(card: CardInstance, allPlayerCards: Array<Array<CardInstance>>, currentPlayer: number): void;
  calcB?(): number;
  calcC?(inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>): void;
  metadataRequired?: Array<MetaData>
}

export interface CardInstance {
  card: Card;
  traitPoints: number;
  finalA: number;
  finalB: number;
  metadata: { [key: string]: any }
}

export interface PlayerInput {
  name: string;
  [key: string]: any;
}