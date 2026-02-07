"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scorer_1 = require("../src/scorer");
const helpers_1 = require("./helpers");
describe('Using CAMOUFLAGE + other cards', () => {
    it('addition points for each card in hand', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'CAMOUFLAGE', 'cards_in_hand': 5 }]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 7,
            finalA: 2,
            finalB: 5,
        });
    });
});
describe('Using CRANIAL CREST + other cards', () => {
    it('base score when only colourless cards', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'CRANIAL CREST' }, (0, helpers_1.zeroPointColourlessCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 4,
            finalA: 4,
        });
    });
    it('scores -1 for each colourless card', () => {
        const scores = new scorer_1.Scorer([{ 'name': 'CRANIAL CREST' }, (0, helpers_1.zeroPointBlueCard)()]).scores();
        expect(scores.getPlayerScore(scorer_1.Player.One).getCardScoreByIndex(0)).toMatchObject({
            total: 3,
            finalA: 4,
            finalB: -1
        });
    });
});
