"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('IMMUNITY', () => {
    it('base scores 4', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'IMMUNITY' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            finalA: 4,
            finalB: 0,
            total: 4
        });
    });
    it('scores +2 for each trait with negative base value, but only negative traits', () => {
        const scores = new scorer_1.Scorer([
            { 'name': 'IMMUNITY' },
            { 'name': 'ELVEN EARS' },
            (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointPurpleCard)(), (0, helpers_1.zeroPointBlueCard)(), (0, helpers_1.zeroPointColourlessCard)()
        ]).scores();
        // Eleven Ears has a base of -1,
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(1)).toMatchObject({
            finalA: -1,
        });
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            finalB: 2,
        });
    });
});
