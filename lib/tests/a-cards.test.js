"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
describe('Using ACROBATIC card', () => {
    let acrobaticCard = { 'name': 'ACROBATIC' };
    test('single card gives the user a total score of 2', () => {
        const scores = new scorer_1.Scorer([acrobaticCard]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ total: 2 });
    });
    test('each card is worth 2 base points', () => {
        const scores = new scorer_1.Scorer([acrobaticCard, acrobaticCard, acrobaticCard], [acrobaticCard, acrobaticCard], [acrobaticCard]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One)).toMatchObject({ total: 6 });
        expect(scores.getPlayerScore(scorer_1.Player.Two)).toMatchObject({ total: 4 });
        expect(scores.getPlayerScore(scorer_1.Player.Three)).toMatchObject({ total: 2 });
        // Every Acrobatic card is worth 2
        for (const player of [scorer_1.Player.One, scorer_1.Player.Two, scorer_1.Player.Three]) {
            scores.getPlayerScore(player).getCardScores().forEach(c => expect(c).toMatchObject({ total: 2, finalA: 2, finalB: 0 }));
        }
    });
});
describe('Using ALTRUISTIC card', () => {
    const altruisticWithGenePool4 = { 'name': 'ALTRUISTIC', 'gene_pool_size': 4 };
    test('single card gives the user a total score of based on metadata', () => {
        const scores = new scorer_1.Scorer([altruisticWithGenePool4]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ total: 4, finalA: 0 });
    });
    test('multiple cards give the user a total score of based on metadata', () => {
        const scores = new scorer_1.Scorer([altruisticWithGenePool4, altruisticWithGenePool4], [{ 'name': 'ALTRUISTIC', 'gene_pool_size': 6 }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ total: 4 });
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(1)).toMatchObject({ total: 4 });
        expect(scores.getPlayerScore(scorer_1.Player.Two).getCardScoreByIndex(0)).toMatchObject({ total: 6 });
    });
    test('missing metadata does not throw and sets finalB to undefined', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ALTRUISTIC', 'missing': 4 }]).scores();
        const cardScore = scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0);
        expect(cardScore.finalB).toBeUndefined();
        expect(cardScore.total).toBeUndefined();
    });
    test('missing metadata does not break scoring for other cards', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ALTRUISTIC', 'missing': 4 }, { 'name': 'ACROBATIC' }]).scores();
        // ALTRUISTIC with missing metadata has undefined score
        const altruisticScore = scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0);
        expect(altruisticScore.finalB).toBeUndefined();
        expect(altruisticScore.total).toBeUndefined();
        // ACROBATIC still scores normally
        const acrobaticScore = scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(1);
        expect(acrobaticScore).toMatchObject({ total: 2, finalA: 2, finalB: 0 });
    });
    test('missing metadata card does not contribute to player total', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ALTRUISTIC', 'missing': 4 }, { 'name': 'ACROBATIC' }]).scores();
        // Player total should only include ACROBATIC's 2 points
        expect(scores.getPlayerScore(scorer_1.Player.One).total).toBe(2);
    });
    test('invalid metadata throws an invalid data error', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'ALTRUISTIC', 'gene_pool_size': 'apples' }]);
        const t = () => { scores.scores(); };
        expect(t).toThrow(Error);
        expect(t).toThrow(new Error('invalid data for metadata field gene_pool_size'));
    });
});
describe('Using AUTOMIMICRY card', () => {
    test('card with 0 score has finalB of 0, not undefined', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'AUTOMIMICRY' }]).scores();
        const cardScore = scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0);
        expect(cardScore.finalA).toBe(0);
        expect(cardScore.finalB).toBe(0);
        expect(cardScore.total).toBe(0);
    });
});
describe('Using APEX PREDATOR card', () => {
    const apexPredator = { 'name': 'APEX PREDATOR' };
    test('+4 when user has most cards', () => {
        const scores = new scorer_1.Scorer([apexPredator]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ total: 8, finalB: 4, finalA: 4 });
    });
    test('only scores 4 points when user has equal or less card total', () => {
        const scores = new scorer_1.Scorer([apexPredator], [apexPredator, apexPredator], [apexPredator, apexPredator], [apexPredator, apexPredator, apexPredator]).scores();
        // Only the last player's cards should score more than 4
        for (const player of [scorer_1.Player.One, scorer_1.Player.Two, scorer_1.Player.Three]) {
            const cards = scores.getPlayerScore(player).getCardScores();
            cards.forEach(c => {
                expect(c).toMatchObject({ total: 4, finalB: 0, finalA: 4 });
            });
        }
        // Player Four has the most cards
        const playerFour = scores.getPlayerScore(scorer_1.Player.Four);
        playerFour.getCardScores().forEach(card => {
            expect(card).toMatchObject({ total: 8, finalB: 4, finalA: 4 });
        });
        expect(scores.getPlayerScore(scorer_1.Player.Four).total).toBe(24);
    });
});
