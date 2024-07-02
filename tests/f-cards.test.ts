import { Scorer } from '../src/scorer';
import { zeroPointColourlessCard, zeroPointGreenCard, zeroPointRedCard } from './helpers';

describe('Using FAITH + other cards', () => {
  it('faith card just has base points', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FAITH', fromColour: 'colourless', toColour: 'blue'}],
    );
    expect(scorer.scores()).toStrictEqual([4]);
  })

  it('faith card can change colours to effect total', () => {
    // 4 for Faith
    // -1 for EGG CLUSTER
    // 3 for blue cards
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FAITH', fromColour: 'colourless', toColour: 'blue'}, {'name': 'EGG CLUSTERS'}, zeroPointColourlessCard()],
    );
    expect(scorer.scores()).toStrictEqual([6]);
  })

  it('faith card can change colours to effect total', () => {
    // 4 for Faith
    // -1 for EGG CLUSTER
    // 0 for blue cards
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FAITH', fromColour: 'blue', toColour: 'red'}, {'name': 'EGG CLUSTERS'}],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })
})

describe('Using FORTUNATE + other cards', () => {
  it('FORTUNATE when only card', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FORTUNATE'}],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })

  it('when matching number of colour cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FORTUNATE'}, zeroPointRedCard()],
    );
    expect(scorer.scores()).toStrictEqual([1]);
  })

  it('when more green cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FORTUNATE'}, zeroPointGreenCard(), zeroPointRedCard()],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })

  it('when less green', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FORTUNATE'}, zeroPointRedCard(), zeroPointRedCard()],
    );
    expect(scorer.scores()).toStrictEqual([1]);
  })
})
describe('Using FREE WILL + other cards', () => {
  it('FREE WILL card just has base points', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FREE WILL', colour: 'blue'}],
    );
    expect(scorer.scores()).toStrictEqual([2]);
  })

  it('faith card can change colours to effect total', () => {
    // 2 for Faith
    // -1 for EGG CLUSTER
    // 2 for blue cards
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'FREE WILL', colour: 'blue'}, {'name': 'EGG CLUSTERS'}],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })
})
