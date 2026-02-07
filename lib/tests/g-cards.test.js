"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('GMO', () => {
    it('scores -1 if no other traits', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'GMO', 'attached_trait': 'red' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: -1,
            finalA: -1,
            finalB: 0,
        });
    });
    it('scores only for scores which match the trait under test', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'GMO', 'attached_trait': 'red' }, (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointPurpleCard)(), (0, helpers_1.zeroPointBlueCard)(), (0, helpers_1.zeroPointColourlessCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 0,
            finalA: -1,
            finalB: 1,
        });
    });
    it('scores only for each card matching the trait', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'GMO', 'attached_trait': 'red' }, (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointBlueCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 2,
            finalA: -1,
            finalB: 3,
        });
    });
});
describe('Gratitude', () => {
    it('scores 0 if only colourless cards are present', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'GRATITUDE' }, (0, helpers_1.zeroPointColourlessCard)(), (0, helpers_1.zeroPointColourlessCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 0,
            finalA: 0,
            finalB: 0,
        });
    });
    it('scores 4 if all colours are present', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'GRATITUDE' }, (0, helpers_1.zeroPointRedCard)(), (0, helpers_1.zeroPointGreenCard)(), (0, helpers_1.zeroPointPurpleCard)(), (0, helpers_1.zeroPointBlueCard)(), (0, helpers_1.zeroPointColourlessCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            finalB: 4,
        });
    });
    it('supports multi-coloured cards', () => {
        // 2 from GRATITUDE which has 2 distinct colours
        const scores = new scorer_1.Scorer([{ 'name': 'GRATITUDE' }, { name: 'BULLHEADED' }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            finalB: 2,
        });
    });
});
