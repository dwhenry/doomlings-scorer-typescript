"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('AI TAKEOVER', () => {
    test('overrides colourless cards to score 2', () => {
        const scores = new scorer_1.Scorer([(0, helpers_1.zeroPointColourlessCard)(), (0, helpers_1.zeroPointColourlessCard)(), (0, helpers_1.zeroPointColourlessCard)(), (0, helpers_1.zeroPointColourlessCard)()]).addCatastrophes([{ 'name': 'AI TAKEOVER' }]).scores();
        scores.getPlayerScore(scorer_1.Player.One).getCardScores().forEach(card => {
            expect(card).toMatchObject({
                total: 2,
                finalB: 0
            });
        });
    });
    test('ignores colourless cards effects', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ALTRUISTIC', 'gene_pool_size': 4 }]).addCatastrophes([{ 'name': 'AI TAKEOVER' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            finalB: 0
        });
    });
});
describe('Using BIOENGINEERED PLAGUE + other cards', () => {
    it("soft-discards one card per player when provided previous discard", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }])
            .addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC'] }])
            .scores();
        const playerScores = scores.getPlayerScores();
        // Cards remain in array but are marked as discarded with 0 total
        for (const playerScore of playerScores) {
            expect(playerScore.getCardScores().length).toBe(1);
            expect(playerScore.getCardScoreByIndex(0).discarded).toBe(true);
            expect(playerScore.getCardScoreByIndex(0).total).toBe(0);
        }
    });
    it("soft-discards only one when multiple cards of same type", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }, { 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }, { 'name': 'ACROBATIC' }])
            .addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC'] }])
            .scores();
        for (let i = 0; i < 2; i++) {
            const cardScores = scores.getPlayerScore(i).getCardScores();
            expect(cardScores.length).toBe(2);
            const discardedCount = cardScores.filter(c => c.discarded).length;
            expect(discardedCount).toBe(1);
        }
    });
    it("auto-computes discard when no previous selection provided", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }])
            .addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE' }])
            .scores();
        // Engine auto-selects a card to discard
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0).discarded).toBe(true);
        expect(scores.getPlayerScore(scorer_1.Player.Two).getCardScoreByIndex(0).discarded).toBe(true);
        // Generated metadata records the discard decisions
        const catMeta = scores.getCatastropheGeneratedMetadata();
        expect(catMeta[0].discard).toBeDefined();
        expect(catMeta[0].discard.length).toBe(2);
    });
    it("auto-computes discard when previous selection is invalid", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }])
            .addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE', 'discard': ['DANCE', 'DANCE'] }])
            .scores();
        // Engine falls back to auto-select since DANCE doesn't exist in piles
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0).discarded).toBe(true);
        expect(scores.getPlayerScore(scorer_1.Player.Two).getCardScoreByIndex(0).discarded).toBe(true);
    });
    it("works when < maximum number of players", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }, { 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }, { 'name': 'ACROBATIC' }])
            .addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC'] }])
            .scores();
        // Cards remain but one per player is discarded
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScores().length).toEqual(2);
        expect(scores.getPlayerScore(scorer_1.Player.Two).getCardScores().length).toEqual(2);
        const p1Discarded = scores.getPlayerScore(scorer_1.Player.One).getCardScores().filter(c => c.discarded).length;
        const p2Discarded = scores.getPlayerScore(scorer_1.Player.Two).getCardScores().filter(c => c.discarded).length;
        expect(p1Discarded).toEqual(1);
        expect(p2Discarded).toEqual(1);
    });
    it("handles non-array discard gracefully by auto-computing", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ACROBATIC' }], [{ 'name': 'ACROBATIC' }]).addCatastrophes([{ 'name': 'BIOENGINEERED PLAGUE', 'discard': 1 }])
            .scores();
        // Engine auto-computes since discard is not a valid array
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0).discarded).toBe(true);
        expect(scores.getPlayerScore(scorer_1.Player.Two).getCardScoreByIndex(0).discarded).toBe(true);
    });
});
