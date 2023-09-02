const traitCardTypes = ['colourless', 'multi-colour', 'purple'] as const;
const costopheCardTypes = ['catastrophe'] as const;
const otherCardTypes = ['none'] as const;
const CardTypes = [...traitCardTypes, ...costopheCardTypes, ...otherCardTypes] as const;
type CardType = typeof CardTypes[number];

export interface Card {
  name: string;
  type: CardType,
  calcA(card: CardInstance): void;
  calcB?(): number;
  calcC?(oplayersCards: Array<Array<CardInstance>>): void;
  metadataRequired?: Array<[string, string]>
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