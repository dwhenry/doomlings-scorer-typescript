"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('Using BIONIC ARM', () => {
    it("when on a single card", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BIONIC ARM' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: -1, finalB: 1 });
    });
    it("when multiple techlings", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BIONIC ARM' }, { 'name': 'BINARY' }, { 'name': 'BINARY' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: -1, finalB: 3, total: 2 });
    });
    it("1 for each techling", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BIONIC ARM' }, { 'name': 'BINARY' }, { 'name': 'BINARY' }, { 'name': 'BINARY' }, { 'name': 'BINARY' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: -1, finalB: 5, total: 4 });
    });
});
describe('Using BOREDOM + other cards', () => {
    it("add points when cards have effects", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BOREDOM' }, (0, helpers_1.zeroPointColourlessCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: 0, finalB: 2, total: 2 });
    });
    it("does not add points when cards have no effects", () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BOREDOM' }, { 'name': 'ADORABLE' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: 0, finalB: 1, total: 1 });
    });
});
describe('Using BRANCHES + other cards', () => {
    it('point for pairs of green cards in opponents hands', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BRANCHES' }], [(0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointGreenCard)()], [(0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointGreenCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({ finalA: 0, finalB: 2, total: 2 });
    });
    it('no points for green cards in the owner\'s hands', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'BRANCHES' }, (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointGreenCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).total).toBe(0);
    });
});
