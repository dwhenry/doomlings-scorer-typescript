import type { Card } from '../types';
import { getCardMetadataFields } from '../utils/cardMetadata';

function canUseDemoCard(card: Card, hasMetadata: boolean): boolean {
  if (card.type.includes('catastrophe')) return false;
  if (card.type.includes('none')) return false;
  if(hasMetadata!) {
    return getCardMetadataFields(card.name).length > 0;
  } else {
    return getCardMetadataFields(card.name).length === 0;
  }

}

/** A pack card unlikely to open metadata modals during the tour. */
export function pickDemoPackCardName(cards: Map<string, Card>): string | null {
  for (const card of cards.values()) {
    if (canUseDemoCard(card, false)) return card.name;
  }
  return null;
}

/** The first currently rendered pack card that will not open metadata prompts. */
export function pickVisibleDemoPackCardName(
  cards: Map<string, Card>,
  hasMetadata: boolean = false
): string | null {
  const visibleCardEls = document.querySelectorAll<HTMLElement>(
    '[data-pack-card-name]'
  );

  for (const el of visibleCardEls) {
    if (el.offsetParent === null) continue;

    const cardName = el.dataset.packCardName;
    const card = cardName ? cards.get(cardName) : undefined;
    if (card && canUseDemoCard(card, hasMetadata)) return card.name;
  }

  return pickDemoPackCardName(cards);
}
