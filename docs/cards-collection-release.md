# Card collection and release (worldofdoomlings.com)

Cards have required `collection` and `release` fields (see `lib/src/types.ts`). These mirror the game’s grouping: **release** (e.g. "Classic Game", "Classic Game (Kickstarter)"), **collection** (e.g. "Classic", "Techlings").

Known values are defined in `lib/src/types.ts` as `RELEASE_TYPES` and `COLLECTION_TYPES` (order controls display in the UI). Filtering matches directly on these card values.

The web UI filter lets you select multiple **Releases** or multiple **Collections** (not both). Cards are shown if they match any selected release or any selected collection.

## Populating collection/release on cards

When cards are registered via `addCard()`, `lib/src/cardContainer.ts` sets `collection` and `release` from `lib/src/cards/cardCollectionRelease.ts` (CARD_COLLECTION_RELEASE). If a card name is missing from that map, it gets default `Classic` / `Classic Game`.

## Fetching collection/release from the website

After building the lib (`npm run build`), run:

```bash
node scripts/fetch-card-metadata.js
```

- **stdout**: JSON map `cardName -> { collection, release }` for cards that were found and parsed.
- **stderr**: List of cards that could not be found or parsed. Redirect to a file for manual updates:

```bash
node scripts/fetch-card-metadata.js 2> docs/cards-not-found.txt
```

URLs are built as `https://www.worldofdoomlings.com/cards/<slug>` where:

- Normal cards: slug = name lowercased, spaces → hyphens (e.g. `TERRITORIAL` → `territorial`).
- Kickstarter variants: base name + `-ks` (e.g. `TERRITORIAL (kickstarter)` → `territorial-ks`).

Cards in `docs/cards-not-found.txt` (or that 404 / don’t have Collection/Release on the page) need an entry in `CARD_COLLECTION_RELEASE` if you want them to appear under a specific release/collection in the filter.
