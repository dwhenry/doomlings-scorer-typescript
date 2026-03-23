import type { Card } from '../types';
import { getCardMetadataFields } from '../utils/cardMetadata';

/** A pack card unlikely to open metadata modals during the tour. */
export function pickDemoPackCardName(cards: Map<string, Card>): string | null {
  for (const card of cards.values()) {
    if (card.type.includes('catastrophe')) continue;
    if (card.type.includes('none')) continue;
    if (getCardMetadataFields(card.name).length > 0) continue;
    return card.name;
  }
  return null;
}
