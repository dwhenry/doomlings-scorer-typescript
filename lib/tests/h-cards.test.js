"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('HEAT VISION', () => {
    it('scores 0 if no other red cards', () => {
        const scorer = new scorer_1.Scorer([], [{ 'name': 'HEAT VISION' }]);
        expect(scorer.scores()).toStrictEqual([0]);
    });
    it('scores 1 for each other red card', () => {
        const scorer = new scorer_1.Scorer([], [{ 'name': 'HEAT VISION' }, (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointRedCard)()]);
        expect(scorer.scores()).toStrictEqual([2]);
    });
});
describe('HYPER-MYELINATION', () => {
    test('single card gives the user a total score of based on metadata', () => {
        const scorer = new scorer_1.Scorer([], [{ 'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4 }]);
        expect(scorer.scores()).toStrictEqual([4]);
    });
    test('multiple cards give the user a total score of based on metadata', () => {
        const scorer = new scorer_1.Scorer([], [{ 'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4 }, { 'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4 }], [{ 'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4 }]);
        expect(scorer.scores()).toStrictEqual([8, 4]);
    });
    test('missing metadata does not throw and sets finalB to undefined', () => {
        const scores = new scorer_1.Scorer([], [{ 'name': 'HYPER-MYELINATION', 'missing': 4 }]).scores();
        const cardScore = scores.getPlayerScore(1).getCardScoreByIndex(0);
        expect(cardScore.finalB).toBeUndefined();
        expect(cardScore.total).toBeUndefined();
    });
});
