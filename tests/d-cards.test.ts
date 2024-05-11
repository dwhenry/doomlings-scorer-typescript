import { Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('Using DELICIOUS card', () => {
  test('scores 0 if there is not a different colourless card', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'DELICIOUS'}]);
    expect(scorer.scores()).toStrictEqual([0]);
  });

  test('scores 0 when there is a different colourless card it sc', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'DELICIOUS'}, zeroPointColourlessCard()]
    );
    expect(scorer.scores()).toStrictEqual([4]);
  });
});

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