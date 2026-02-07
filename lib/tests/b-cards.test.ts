import { Player, Scorer } from '../src/scorer';
import { zeroPointColourlessCard, zeroPointGreenCard } from './helpers';

describe('Using BIONIC ARM', () => {
  it("when on a single card", () => {
    const scores = new Scorer([{'name': 'BIONIC ARM'}]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: -1, finalB: 1});
  })

  it("when multiple techlings", () => {
    const scores = new Scorer(
      [{'name': 'BIONIC ARM'}, {'name': 'BINARY'}, {'name': 'BINARY'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: -1, finalB: 3, total: 2});
  })

  it("1 for each techling", () => {
    const scores = new Scorer(
      [{'name': 'BIONIC ARM'}, {'name': 'BINARY'}, {'name': 'BINARY'},  {'name': 'BINARY'},  {'name': 'BINARY'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: -1, finalB: 5, total: 4});
  })
})

describe('Using BOREDOM + other cards', () => {
  it("add points when cards have effects", () => {
    const scores = new Scorer(
      [{'name': 'BOREDOM'}, zeroPointColourlessCard()]
    ).scores();

    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: 0, finalB: 2, total: 2});
  })

  it("does not add points when cards have no effects", () => {
    const scores = new Scorer(
      [{'name': 'BOREDOM'}, {'name': 'ADORABLE'}]
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: 0, finalB: 1, total: 1});
  })
})

describe('Using BRANCHES + other cards', () => {
  it('point for pairs of green cards in opponents hands', () => {
    const scores = new Scorer(
      [{'name': 'BRANCHES'}],
      [zeroPointGreenCard(), zeroPointGreenCard()],
      [zeroPointGreenCard(), zeroPointGreenCard(), zeroPointGreenCard()],
    ).scores();

    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({finalA: 0, finalB: 2, total: 2});
  })

  it('no points for green cards in the owner\'s hands', () => {
    const scores = new Scorer(
      [{'name': 'BRANCHES'}, zeroPointGreenCard(), zeroPointGreenCard()],
    ).scores();

    expect(scores.getPlayerScore(Player.One).total).toBe(0)
  })
})
