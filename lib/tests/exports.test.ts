import { allCards } from '../src/cardContainer';
import { TRAIT_CARD_TYPES, RELEASE_TYPES, COLLECTION_TYPES } from '../src/types';
import '../src/cards';

describe('allCards', () => {
  test('returns a Map of all registered cards', () => {
    const cards = allCards();
    expect(cards).toBeInstanceOf(Map);
    expect(cards.size).toBeGreaterThan(0);
  });

  test('contains known cards', () => {
    const cards = allCards();
    expect(cards.has('ACROBATIC')).toBe(true);
    expect(cards.has('IMMUNITY')).toBe(true);
  });

  test('each card has required properties', () => {
    const cards = allCards();
    for (const [name, card] of cards) {
      expect(card.name).toBe(name);
      expect(card.type).toBeDefined();
      expect(card.collection).toBeDefined();
      expect(Array.isArray(card.release)).toBe(true);
      expect(card.release.length).toBeGreaterThan(0);
    }
  });
});

describe('TRAIT_CARD_TYPES', () => {
  test('contains the expected trait types', () => {
    expect(TRAIT_CARD_TYPES).toContain('colourless');
    expect(TRAIT_CARD_TYPES).toContain('purple');
    expect(TRAIT_CARD_TYPES).toContain('red');
    expect(TRAIT_CARD_TYPES).toContain('green');
    expect(TRAIT_CARD_TYPES).toContain('blue');
  });

  test('has exactly 5 trait types', () => {
    expect(TRAIT_CARD_TYPES).toHaveLength(5);
  });
});

describe('RELEASE_TYPES', () => {
  test('contains expected release names', () => {
    expect(RELEASE_TYPES).toContain('Classic Game');
    expect(RELEASE_TYPES).toContain('Classic Game (Kickstarter)');
    expect(RELEASE_TYPES).toContain('Deluxe Bundle');
  });

  test('has expected number of releases', () => {
    expect(RELEASE_TYPES.length).toBeGreaterThanOrEqual(5);
  });
});

describe('COLLECTION_TYPES', () => {
  test('contains expected collection names', () => {
    expect(COLLECTION_TYPES).toContain('Classic');
    expect(COLLECTION_TYPES).toContain('Dinolings');
    expect(COLLECTION_TYPES).toContain('Mythlings');
  });

  test('has expected number of collections', () => {
    expect(COLLECTION_TYPES.length).toBeGreaterThanOrEqual(5);
  });
});
