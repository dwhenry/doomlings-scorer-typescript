import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';


describe('Using DRAGON HEART card', () => {
  test('scores 1 if there is not all 4 colours present', () => {
    const scores = new Scorer([{'name': 'DRAGON HEART'}]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 1,
      finalA: 1, 
      finalB: 0
    })
  });

  test('scores 5 when all the colours are present', () => {
    const scores = new Scorer(
      [{'name': 'DRAGON HEART'}, zeroPointBlueCard(), zeroPointGreenCard(), zeroPointRedCard(), zeroPointPurpleCard()]
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 5,
      finalA: 1, 
      finalB: 4
    })
  });
});