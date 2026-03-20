#!/usr/bin/env node
/**
 * Fetch Collection and Release for each card from worldofdoomlings.com.
 * Outputs JSON of card name -> { collection, release[] } and lists cards not found.
 * release is an array (cards can have multiple editions). Multiple .collections .stat-pill-value cause an error.
 *
 * Prerequisite: npm run build (lib must be built)
 * Usage: node scripts/fetch-card-metadata.js
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const NOT_FOUND_FILE = path.join(__dirname, '..', 'docs', 'cards-not-found.txt');

// Load cards from built lib (side-effect register, then get map)
const libPath = path.join(__dirname, '..', 'lib', 'dist');
require(path.join(libPath, 'cards', 'index.js'));
const { allCards } = require(path.join(libPath, 'cardContainer.js'));

const BASE_URL = 'https://www.worldofdoomlings.com/cards/';

function nameToSlug(name) {
  if (name.endsWith(' (kickstarter)')) {
    const base = name.slice(0, -13).trim();
    return base.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') + '-ks';
  }
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode === 404) {
        console.warn(`HTTP ${res.statusCode} for ${url}`);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Parse HTML and extract collection (single) and releases (multiple) using CSS selectors.
 * @returns {{ collection?: string, release: string[] }}
 * @throws {Error} If multiple `.collections .stat-pill-value` are found (exactly one expected).
 */
function extractCollectionAndRelease(html) {
  const $ = cheerio.load(html);

  const collectionEls = $('.collections .stat-pill-value');
  if (collectionEls.length > 1) {
    throw new Error(`Multiple .collections .stat-pill-value found (${collectionEls.length})`);
  }
  const collection = collectionEls.length === 1 ? collectionEls.first().text().trim() : undefined;

  const releaseEls = $('.editions .stat-pill-value');
  const release = releaseEls.map((_, el) => $(el).text().trim()).get().filter(Boolean);

  return { collection, release };
}

async function main() {
  const cards = allCards();
  const names = [...cards.keys()].sort();
  const results = {};
  const notFound = [];

  for (const name of names) {
    let slug
    // this is a special case that makes no real sense... but deal with it...
    if (name === 'BRAVE') {
      slug = nameToSlug(`${name}-2`);
    } else {
      slug = nameToSlug(name);
    }
    const url = BASE_URL + slug;
    try {
      let html
      try {
        console.warn(`Fetching ${url}`);
        html = await fetchPage(url);
      } catch (err) {
        console.warn(`Fetching ${url}-ks`);
        // try kicker starter version if not found
        html = await fetchPage(`${url}-ks`);
      }
      const { collection, release } = extractCollectionAndRelease(html);
      const hasData = collection || (release && release.length > 0);
      if (hasData) {
        results[name] = {
          collection: collection || '',
          release: Array.isArray(release) ? release : []
        };
      } else {
        notFound.push({ name, slug, url, error: 'Lookup failed for ' + url });
      }
    } catch (err) {
      notFound.push({ name, slug, url, error: err.message });
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(JSON.stringify(results, null, 2));
  if (notFound.length > 0) {
    const lines = [
      '# Cards not found or failed to fetch (manual update)',
      '# Run: node scripts/fetch-card-metadata.js',
      '',
      ...notFound.map(({ name, slug, url, error }) =>
        `${name} -> ${url}${error ? ' (' + error + ')' : ''}`
      )
    ];
    fs.mkdirSync(path.dirname(NOT_FOUND_FILE), { recursive: true });
    fs.writeFileSync(NOT_FOUND_FILE, lines.join('\n') + '\n', 'utf8');
    console.error(`\n--- ${notFound.length} cards not found; list written to ${NOT_FOUND_FILE} ---`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
