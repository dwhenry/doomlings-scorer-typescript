import { Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('KIDNEY', () => {
  it('scores 1 by itself', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'KIDNEY'}],
    );
    expect(scorer.scores()).toStrictEqual([1]);
  })

  it('other cards don;t add points', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'KIDNEY'}, zeroPointRedCard(), ],
    );
    expect(scorer.scores()).toStrictEqual([1]);
  })

  it('more points for each kidney', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'KIDNEY'}, {'name': 'KIDNEY'}, {'name': 'KIDNEY'}],
    );
    expect(scorer.scores()).toStrictEqual([9]);
  })
})

