import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('KIDNEY', () => {
  it('scores 1 by itself', () => {
    const scores = new Scorer(
      [{'name': 'KIDNEY'}],
    ).scores()
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 1,
    })
  })

  it('other cards don;t add points', () => {
    const scores = new Scorer(
      [{'name': 'KIDNEY'}, zeroPointRedCard(), ],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 1,
    })
  })

  it('more points for each kidney', () => {
    const scores = new Scorer(
      [{'name': 'KIDNEY'}, {'name': 'KIDNEY'}, {'name': 'KIDNEY'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 3,
    })
  })
})

