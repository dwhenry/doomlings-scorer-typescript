import { allCards } from '../src/cardContainer';
import { TRAIT_CARD_TYPES, PACK_TYPES } from '../src/types';
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
      expect(card.pack).toBeDefined();
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

describe('PACK_TYPES', () => {
  test('contains the expected pack types', () => {
    expect(PACK_TYPES).toContain('Classic');
    expect(PACK_TYPES).toContain('Dinolings');
    expect(PACK_TYPES).toContain('Mythlings');
  });

  test('has expected number of packs', () => {
    expect(PACK_TYPES.length).toBeGreaterThanOrEqual(8);
  });
});
