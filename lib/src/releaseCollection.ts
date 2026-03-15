import type { Card } from './types';

/** Card matches when it has at least one release in the selected list. */
export function cardMatchesReleases(
  card: Card,
  selectedReleases: string[]
): boolean {
  if (selectedReleases.length === 0) return true;
  return card.release.some((r) => selectedReleases.includes(r));
}

/** Card matches when its collection is in the selected list. */
export function cardMatchesCollections(
  card: Card,
  selectedCollections: string[]
): boolean {
  if (selectedCollections.length === 0) return true;
  return selectedCollections.includes(card.collection);
}
