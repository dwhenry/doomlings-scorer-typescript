import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('IMMUNITY', () => {
  it('base scores 4', () => {
    const scores = new Scorer(
      [{'name': 'IMMUNITY'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 4,
      finalB: 0,
      total: 4
    })
  })

  it('scores +2 for each trait with negative base value, but only negative traits', () => {
    const scores = new Scorer(
      [
        {'name': 'IMMUNITY'},
        {'name': 'ELVEN EARS'}, 
        zeroPointRedCard(), zeroPointGreenCard(), zeroPointPurpleCard(), zeroPointBlueCard(), zeroPointColourlessCard()
      ],
      ).scores();
      
    // Eleven Ears has a base of -1,
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalA: -1,
    })
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalB: 2,
    })
  })
})