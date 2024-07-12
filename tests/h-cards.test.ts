import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard, zeroPointGreenCard, zeroPointPurpleCard, zeroPointRedCard } from './helpers';

describe('HEAT VISION', () => {
  it('scores 0 if no other red cards', () => {
    const scores = new Scorer(
      [{'name': 'HEAT VISION'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1,
      finalB: 1
    })
  })

  it('scores 1 for each other red card', () => {
    const scores = new Scorer(
      [{'name': 'HEAT VISION'}, zeroPointRedCard(), zeroPointRedCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1,
      finalB: 3
    })
  })
})

describe('HYPER-MYELINATION', () => {
  test('single card gives the user a total score of based on metadata', () => {
    const scores = new Scorer([{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 4
    })
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const scores = new Scorer(
      [{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}, {'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}],
      [{'name': 'HYPER-MYELINATION', 'biggest_gene_pool_size': 4}]
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 4
    })
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalA: 0,
      finalB: 4
    })
    expect(scores.getPlayerScore(Player.Two).getCardScoreByIndex(0)).toMatchObject({
      finalA: 0,
      finalB: 4
    })
  });

  test('missing metadata raises a missing metadata error', () => {
    const t = () => { new Scorer([], [{'name': 'HYPER-MYELINATION', 'missing': 4}]) }
    expect(t).toThrow(new Error('missing metadata field biggest_gene_pool_size'));
  });
})