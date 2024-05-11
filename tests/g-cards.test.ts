import { Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('GMO', () => {
  it('scores -1 if no other traits', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GMO', 'attached_trait': 'red'}],
    );
    expect(scorer.scores()).toStrictEqual([-1]);
  })

  it('scores only for scores which match the trait under test', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GMO', 'attached_trait': 'red'}, zeroPointRedCard(), zeroPointGreenCard(), zeroPointPurpleCard(), zeroPointBlueCard(), zeroPointColourlessCard()],
    );
    // -1 from GMO
    // +1 for 1 red for GMO
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('scores only for each card matching the trait', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GMO', 'attached_trait': 'red'}, zeroPointRedCard(), zeroPointRedCard(), zeroPointRedCard(), zeroPointBlueCard()],
    );
    expect(scorer.scores()).toStrictEqual([2]);
  })
})


describe('Gratitude', () => {
  it('scores 0 if only colourless cards are present', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GRATITUDE'}, zeroPointColourlessCard(), zeroPointColourlessCard()],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('scores 4 if all colours are present', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GRATITUDE'}, zeroPointRedCard(), zeroPointGreenCard(), zeroPointPurpleCard(), zeroPointBlueCard(), zeroPointColourlessCard()],
    );
    expect(scorer.scores()).toStrictEqual([4]);
  })

  it('supports multi-coloured cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'GRATITUDE'}, {name: 'BULLHEADED'}],
    );
    // 1 from BULLHEADED
    // 2 from GRATITUDE which has 2 distinct colours
    expect(scorer.scores()).toStrictEqual([3]);
  })
})