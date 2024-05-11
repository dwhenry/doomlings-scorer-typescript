import { Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';


describe('Using DRAGON HEART card', () => {
  test('scores 1 if there is not all 4 colours present', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'DRAGON HEART'}]);
    expect(scorer.scores()).toStrictEqual([1]);
  });

  test('scores 5 when all the colours are present', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'DRAGON HEART'}, zeroPointBlueCard(), zeroPointGreenCard(), zeroPointRedCard(), zeroPointPurpleCard()]
    );
    // Confusion expected value is a fixed value of -2
    expect(scorer.scores()).toStrictEqual([5]);
  });
});