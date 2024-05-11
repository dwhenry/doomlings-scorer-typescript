import { Scorer } from '../src/scorer';

describe('Using CAMOUFLAGE + other cards', () => {
  it('addition points for each card in hand', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'CAMOUFLAGE', 'cards_in_hand': 5}],
    );
    expect(scorer.scores()).toStrictEqual([7]);
  })
})

describe('Using CRANIAL CREST + other cards', () => {
  it('base cost when only colourless cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'CRANIAL CREST'}, {'name': 'BINARY'}],
    );
    expect(scorer.scores()).toStrictEqual([4]);
  })

  it('Adjust when other colours', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'CRANIAL CREST'}, {'name': 'CHROMATOPHORES'}],
    );
    expect(scorer.scores()).toStrictEqual([3]);
  })
})
