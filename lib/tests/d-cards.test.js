"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('Using DRAGON HEART card', () => {
    test('scores 1 if there is not all 4 colours present', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'DRAGON HEART' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 1,
            finalA: 1,
            finalB: 0
        });
    });
    test('scores 5 when all the colours are present', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'DRAGON HEART' }, (0, helpers_1.zeroPointBlueCard)(), (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointPurpleCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 5,
            finalA: 1,
            finalB: 4
        });
    });
});
