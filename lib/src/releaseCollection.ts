import type { Card, PackType } from './types';

/** For legacy import: convert selected pack names to release|collection keys */
export function getReleaseCollectionKeysForPacks(
  cards: Map<string, Card>,
  packs: string[]
): string[] {
  const set = new Set<string>();
  for (const card of cards.values()) {
    if (packs.includes(card.pack)) {
      for (const key of getReleaseCollectionKeys(card)) {
        set.add(key);
      }
    }
  }
  return [...set];
}

const PACK_DEFAULTS: Record<PackType, { release: string; collection: string }> = {
  'Classic': { release: 'Classic Game', collection: 'Classic' },
  'Classic (Kickstarter)': { release: 'Classic Game (Kickstarter)', collection: 'Classic (Kickstarter)' },
  'Special Edition': { release: 'Special Edition', collection: 'Special Edition' },
  'multi-colour': { release: 'Classic Game', collection: 'multi-colour' },
  'Dinolings': { release: 'Dinolings', collection: 'Dinolings' },
  'Mythlings': { release: 'Mythlings', collection: 'Mythlings' },
  'Techlings': { release: 'Techlings', collection: 'Techlings' },
  'Meaning of Life': { release: 'Meaning of Life', collection: 'Meaning of Life' },
  'Overlush': { release: 'Overlush', collection: 'Overlush' },
  'KSE': { release: 'Classic Game (Kickstarter)', collection: 'Special Edition' }
};

export function getRelease(card: Card): string {
  const r = card.release;
  if (r?.length) return r[0];
  return PACK_DEFAULTS[card.pack].release;
}

export function getCollection(card: Card): string {
  return card.collection ?? PACK_DEFAULTS[card.pack].collection;
}

/** All release|collection keys for this card (one per release when card has multiple) */
export function getReleaseCollectionKeys(card: Card): string[] {
  const collection = getCollection(card);
  const releases = card.release?.length
    ? card.release
    : [getRelease(card)];
  return releases.map((release) => `${release}|${collection}`);
}

/** Single key for backward compat (first release + collection) */
export function getReleaseCollectionKey(card: Card): string {
  return getReleaseCollectionKeys(card)[0];
}

export interface ReleaseGroup {
  release: string;
  collections: string[];
}

/** Build grouped options: release first, then collections (for grouped select UI) */
export function getGroupedReleaseCollections(cards: Map<string, Card>): ReleaseGroup[] {
  const byRelease = new Map<string, Set<string>>();
  for (const card of cards.values()) {
    for (const key of getReleaseCollectionKeys(card)) {
      const [release, collection] = key.split('|');
      if (!byRelease.has(release)) {
        byRelease.set(release, new Set());
      }
      byRelease.get(release)!.add(collection);
    }
  }
  const releases = [...byRelease.keys()].sort();
  return releases.map((release) => ({
    release,
    collections: [...(byRelease.get(release) ?? [])].sort()
  }));
}
