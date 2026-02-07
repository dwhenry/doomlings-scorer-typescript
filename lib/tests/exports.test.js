"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardContainer_1 = require("../src/cardContainer");
const types_1 = require("../src/types");
require("../src/cards");
describe('allCards', () => {
    test('returns a Map of all registered cards', () => {
        const cards = (0, cardContainer_1.allCards)();
        expect(cards).toBeInstanceOf(Map);
        expect(cards.size).toBeGreaterThan(0);
    });
    test('contains known cards', () => {
        const cards = (0, cardContainer_1.allCards)();
        expect(cards.has('ACROBATIC')).toBe(true);
        expect(cards.has('IMMUNITY')).toBe(true);
    });
    test('each card has required properties', () => {
        const cards = (0, cardContainer_1.allCards)();
        for (const [name, card] of cards) {
            expect(card.name).toBe(name);
            expect(card.type).toBeDefined();
            expect(card.pack).toBeDefined();
        }
    });
});
describe('TRAIT_CARD_TYPES', () => {
    test('contains the expected trait types', () => {
        expect(types_1.TRAIT_CARD_TYPES).toContain('colourless');
        expect(types_1.TRAIT_CARD_TYPES).toContain('purple');
        expect(types_1.TRAIT_CARD_TYPES).toContain('red');
        expect(types_1.TRAIT_CARD_TYPES).toContain('green');
        expect(types_1.TRAIT_CARD_TYPES).toContain('blue');
    });
    test('has exactly 5 trait types', () => {
        expect(types_1.TRAIT_CARD_TYPES).toHaveLength(5);
    });
});
describe('PACK_TYPES', () => {
    test('contains the expected pack types', () => {
        expect(types_1.PACK_TYPES).toContain('Classic');
        expect(types_1.PACK_TYPES).toContain('Dinolings');
        expect(types_1.PACK_TYPES).toContain('Mythlings');
    });
    test('has expected number of packs', () => {
        expect(types_1.PACK_TYPES.length).toBeGreaterThanOrEqual(8);
    });
});
