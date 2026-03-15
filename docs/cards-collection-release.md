# Card collection and release (worldofdoomlings.com)

Cards can have optional `collection` and `release` fields (see `lib/src/types.ts`). These mirror the game’s grouping: **release** first (e.g. "Classic Game", "Dinolings"), then **collection** (e.g. "Classic", "Special Edition").

The web UI uses these for the grouped “Select by release / collection” filter. If a card has no `collection`/`release`, defaults are derived from its `pack` (see `lib/src/releaseCollection.ts`).

## Fetching collection/release from the website

After building the lib (`npm run build`), run:

```bash
node scripts/fetch-card-metadata.js
```

- **stdout**: JSON map `cardName -> { collection, release }` for cards that were found and parsed.
- **stderr**: List of cards that could not be found or parsed (URL and optional error). Redirect to a file to keep a “not found” list for manual updates:

```bash
node scripts/fetch-card-metadata.js 2> docs/cards-not-found.txt
```

URLs are built as `https://www.worldofdoomlings.com/cards/<slug>` where:

- Normal cards: slug = name lowercased, spaces → hyphens (e.g. `TERRITORIAL` → `territorial`).
- Kickstarter variants: base name + `-ks` (e.g. `TERRITORIAL (kickstarter)` → `territorial-ks`).

Cards listed in `docs/cards-not-found.txt` (or that 404 / don’t have Collection/Release on the page) need `collection` and `release` set manually on their card definition if you want them to appear under a specific release/collection in the grouped select.
