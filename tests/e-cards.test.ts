import { Scorer } from '../src/scorer';

describe('Using EGG CLUSTERS + other cards', () => {
  it('just the egg cards cancels itself out', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'EGG CLUSTERS'}],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('point for each blue card', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'EGG CLUSTERS'}, {'name': 'CHROMATOPHORES'}],
    );
    expect(scorer.scores()).toStrictEqual([1]);
  })

  it('no points for other colour cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'EGG CLUSTERS'}, {'name': 'BINARY'}],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('multiple egg clusters grow together', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'EGG CLUSTERS'}, {'name': 'EGG CLUSTERS'}],
    );
    expect(scorer.scores()).toStrictEqual([2]);
  })
})

describe('Using ELVEN EARS + other cards', () => {
  it('just the elven eard cards cancels itself out', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ELVEN EARS'}],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('point for each mythling card', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ELVEN EARS'}, {'name': 'ANCIENT'}],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })

  it('no points for other pack cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ELVEN EARS'}, {'name': 'BINARY'}],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('multiple elven ears grow together', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ELVEN EARS'}, {'name': 'ELVEN EARS'}],
    );
    expect(scorer.scores()).toStrictEqual([2]);
  })

  it('mythling in other players hand', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ELVEN EARS'}],
      [{'name': 'ANCIENT'}],
    );
    expect(scorer.scores()).toStrictEqual([1, 2]);
  })
})