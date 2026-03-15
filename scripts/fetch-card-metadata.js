#!/usr/bin/env node
/**
 * Fetch Collection and Release for each card from worldofdoomlings.com.
 * Outputs JSON of card name -> { collection, release } and lists cards not found.
 *
 * Prerequisite: npm run build (lib must be built)
 * Usage: node scripts/fetch-card-metadata.js
 */

const path = require('path');
const fs = require('fs');
const https = require('https');

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
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractCollectionAndRelease(html) {
  const collectionMatch = html.match(/Collection:\s*\n\s*([^\n<]+)/);
  const releaseMatch = html.match(/Release:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|\n<|$)/);
  const collection = collectionMatch ? collectionMatch[1].trim() : undefined;
  let release = releaseMatch ? releaseMatch[1].trim() : undefined;
  if (release && release.includes('\n')) {
    release = release.split('\n').map((s) => s.trim()).filter(Boolean)[0] || release;
  }
  return { collection, release };
}

async function main() {
  const cards = allCards();
  const names = [...cards.keys()].sort();
  const results = {};
  const notFound = [];

  for (const name of names) {
    const slug = nameToSlug(name);
    const url = BASE_URL + slug;
    try {
      const html = await fetchPage(url);
      const { collection, release } = extractCollectionAndRelease(html);
      if (collection || release) {
        results[name] = { collection: collection || '', release: release || '' };
      } else {
        notFound.push({ name, slug, url });
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
