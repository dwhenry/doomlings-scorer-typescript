import { allCards } from '@scorer/cardContainer';
import type { MetaDataType, MetaDataScope } from '@scorer/types';
import type { PlayerCardEntry } from '../types';

export interface MetadataField {
  key: string;
  type: MetaDataType;
  scope: MetaDataScope;
}

export function getCardMetadataFields(cardName: string): MetadataField[] {
  const card = allCards().get(cardName);
  if (!card?.metadataRequired) return [];
  return card.metadataRequired.map(([key, type, scope]) => ({ key, type, scope }));
}

export function isMetadataComplete(card: PlayerCardEntry, fields: MetadataField[]): boolean {
  if (fields.length === 0) return true;
  return fields.every((field) => card[field.key] !== undefined && card[field.key] !== '');
}

export function hasCardScopedMetadata(fields: MetadataField[]): boolean {
  return fields.some((f) => f.scope === 'card');
}
