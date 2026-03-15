#!/usr/bin/env node
/**
 * Download card images from worldofdoomlings.com.
 * Fetches each card page, finds the img with class "card-detail-img", and saves to images/cards.
 *
 * Usage: node scripts/download-card-images.js
 * Or:    node scripts/download-card-images.js [url-slug] [output-filename]
 *
 * With no args, downloads all KS variant and KS-only cards from the config below.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.worldofdoomlings.com/cards/';
const OUT_DIR = path.join(__dirname, '..', 'images', 'cards');

// Duplicate cards: (url slug for KS version, output filename without .png)
const KS_VARIANT_CARDS = [
  ['territorial-ks', 'TERRITORIAL (kickstarter)'],
  ['late-ks', 'LATE (kickstarter)'],
  ['self-awareness-ks', 'SELF-AWARENESS (kickstarter)'],
  ['saudade-ks', 'SAUDADE (kickstarter)'],
  ['camouflage-ks', 'CAMOUFLAGE (kickstarter)'],
  ['telekinetic-ks', 'TELEKINETIC (kickstarter)'],
  ['brave-ks', 'BRAVE (kickstarter)'],
  ['tectonic-shift-ks', 'TECTONIC SHIFT (kickstarter)'],
  ['deus-ex-machina-ks', 'DEUS EX MACHINA (kickstarter)'],
  ['glacial-meltdown-ks', 'GLACIAL MELTDOWN (kickstarter)'],
  ['mega-tsunami-ks', 'MEGA TSUNAMI (kickstarter)'],
  ['nuclear-winter-ks', 'NUCLEAR WINTER (kickstarter)'],
  ['ai-takeover-ks', 'AI TAKEOVER (kickstarter)'],
  ['boredom-ks', 'BOREDOM (kickstarter)'],
  ['faith-ks', 'FAITH (kickstarter)'],
  ['self-replicating-ks', 'SELF-REPLICATING (kickstarter)'],
  ['leaves-ks', 'LEAVES (kickstarter)'],
  ['fortunate-ks', 'FORTUNATE (kickstarter)'],
  ['pack-behavior-ks', 'PACK BEHAVIOR (kickstarter)'],
  ['tentacles-ks', 'TENTACLES (kickstarter)'],
  ['regenerative-tissue-ks', 'REGENERATIVE TISSUE (kickstarter)'],
  ['automimicry-ks', 'AUTOMIMICRY (kickstarter)'],
];

// KS-only cards (only in Kickstarter pack)
const KS_ONLY_CARDS = [
  ['tube-feet-ks', 'TUBE FEET'],
  ['beauty-ks', 'BEAUTY'],
  ['bones-ks', 'BONES'],
  ['pride-ks', 'PRIDE'],
  ['juicy-ks', 'JUICY'],
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractImageUrl(html) {
  const match = html.match(/<img[^>]+class="[^"]*card-detail-img[^"]*"[^>]+src="([^"]+)"/)
    || html.match(/<img[^>]+src="([^"]+)"[^>]+class="[^"]*card-detail-img[^"]*"/);
  return match ? match[1] : null;
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadOne(slug, outputName) {
  const pageUrl = BASE_URL + slug;
  const outPath = path.join(OUT_DIR, outputName + '.png');

  try {
    const html = await fetchPage(pageUrl);
    const imgUrl = extractImageUrl(html);
    if (!imgUrl) {
      console.error(`No card-detail-img found: ${pageUrl}`);
      return false;
    }
    const buf = await downloadImage(imgUrl);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log(`OK ${outputName}.png`);
    return true;
  } catch (err) {
    console.error(`FAIL ${slug} -> ${outputName}.png:`, err.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const [slug, outputName] = args;
    const ok = await downloadOne(slug, outputName);
    process.exit(ok ? 0 : 1);
  }

  const all = [...KS_VARIANT_CARDS, ...KS_ONLY_CARDS];
  let ok = 0;
  let fail = 0;
  for (const [slug, outputName] of all) {
    const result = await downloadOne(slug, outputName);
    if (result) ok++;
    else fail++;
  }
  console.log(`Done: ${ok} ok, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
