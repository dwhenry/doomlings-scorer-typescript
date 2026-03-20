import { allCards } from '@scorer/cardContainer';
import type { MetaDataType, MetaDataScope, TRAIT_CARD_TYPES } from '@scorer/types';
import type { CardEntry } from '../types';

export interface MetadataField {
  key: string;
  type: MetaDataType;
  scope: MetaDataScope;
  source?: 'player' | 'deck' | 'custom',
  trait?: (typeof TRAIT_CARD_TYPES)[number] | 'player_highest_value' | 'player_value_over_4'
}

/** Returns all metadata fields for a card (both user-editable and internal) */
export function getCardMetadataFields(cardName: string): MetadataField[] {
  const card = allCards().get(cardName);
  if (!card?.metadataRequired) return [];
  return card.metadataRequired.map(([key, type, scope, source, trait]) => ({
    key,
    type,
    scope,
    source,
    trait
  }));
}

/** Returns only user-editable metadata fields (excludes internal scope) */
export function getEditableMetadataFields(cardName: string): MetadataField[] {
  return getCardMetadataFields(cardName).filter((f) => f.scope !== 'internal');
}

/** Returns only internal (engine-generated) metadata fields */
export function getInternalMetadataFields(cardName: string): MetadataField[] {
  return getCardMetadataFields(cardName).filter((f) => f.scope === 'internal');
}

export function getCatastropheMetadataFields(metadata: Record<string, string | number | string[]> | undefined): MetadataField[] {
  if (metadata === undefined) return []
  return Object.keys(metadata).map((key) => ({
    key,
    type: metadata[key] as unknown as MetaDataType,
    scope: 'internal'
  } as MetadataField));
}
/** Checks if user-required metadata is complete (ignores internal fields) */
export function isMetadataComplete(
  card: CardEntry,
  fields: MetadataField[]
): boolean {
  const editableFields = fields.filter((f) => f.scope !== 'internal');
  if (editableFields.length === 0) return true;
  return editableFields.every(
    (field) => card[field.key] !== undefined && card[field.key] !== ''
  );
}

export function hasCardScopedMetadata(fields: MetadataField[]): boolean {
  return fields.some((f) => f.scope === 'card');
}

/** Checks if a card has any internal metadata fields */
export function hasInternalMetadata(cardName: string): boolean {
  return getInternalMetadataFields(cardName).length > 0;
}
