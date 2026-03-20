import { TRAIT_CARD_TYPES } from '@scorer/types';

export const METADATA_COLOR_OPTIONS = TRAIT_CARD_TYPES.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1)
}));
