import { Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('HEAT VISION', () => {
  it('scores 0 if no other red cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'HEAT VISION'}],
    );
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it('scores 1 for each other red card', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'HEAT VISION'}, zeroPointRedCard(), zeroPointRedCard()],
    );
    expect(scorer.scores()).toStrictEqual([2]);
  })
})

describe('HYPER-MYELINATION', () => {
  test('single card gives the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}]);
    expect(scorer.scores()).toStrictEqual([4]);
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}, {'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}], [{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}]
    );
    expect(scorer.scores()).toStrictEqual([8, 4]);
  });

  test('missing metadata raises a missing metadata error', () => {
    const t = () => { new Scorer([], [{'name': 'HYPER-MYELINATION', 'missing': 4}]) }
    expect(t).toThrow(new Error('missing metadata field biggest_gene_pool_size'));
  });
})