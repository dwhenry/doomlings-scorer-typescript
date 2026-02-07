import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('GMO', () => {
  it('scores -1 if no other traits', () => {
    const scores = new Scorer(
      [{'name': 'GMO', 'attached_trait': 'red'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: -1,
      finalA: -1,
      finalB: 0,
    });
  })

  it('scores only for scores which match the trait under test', () => {
    const scores = new Scorer(
      [{'name': 'GMO', 'attached_trait': 'red'}, zeroPointRedCard(), zeroPointGreenCard(), zeroPointPurpleCard(), zeroPointBlueCard(), zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
    total: 0,
    finalA: -1,
    finalB: 1,
  });
  })

  it('scores only for each card matching the trait', () => {
    const scores = new Scorer(
      [{'name': 'GMO', 'attached_trait': 'red'}, zeroPointRedCard(), zeroPointRedCard(), zeroPointRedCard(), zeroPointBlueCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 2,
      finalA: -1,
      finalB: 3,
    });
  })
})


describe('Gratitude', () => {
  it('scores 0 if only colourless cards are present', () => {
    const scores = new Scorer(
      [{'name': 'GRATITUDE'}, zeroPointColourlessCard(), zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 0,
      finalA: 0,
      finalB: 0,
    });
  })

  it('scores 4 if all colours are present', () => {
    const scores = new Scorer(
      [{'name': 'GRATITUDE'}, zeroPointRedCard(), zeroPointGreenCard(), zeroPointPurpleCard(), zeroPointBlueCard(), zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalB: 4,
    });
  })

  it('supports multi-coloured cards', () => {
    // 2 from GRATITUDE which has 2 distinct colours
    const scores = new Scorer(
      [{'name': 'GRATITUDE'}, {name: 'BULLHEADED'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalB: 2,
    });
  })
})