import { Player, Scorer } from '../src/scorer';
import { zeroPointColourlessCard, zeroPointGreenCard, zeroPointRedCard } from './helpers';

describe('Using FAITH + other cards', () => {
  it('faith card just has base points', () => {
    const scores = new Scorer(
      [{'name': 'FAITH', fromColour: 'colourless', toColour: 'blue'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 4,
      finalA: 4,
      finalB: 0
    });
  })

  it('faith card can change colours to effect total', () => {
    // 4 for Faith
    // -1 for EGG CLUSTER
    // 3 for blue cards
    const scores = new Scorer(
      [{'name': 'FAITH', fromColour: 'colourless', toColour: 'blue'}, {'name': 'EGG CLUSTERS'}, zeroPointColourlessCard()],
    ).scores();
    // Faith should score the same
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 4,
      finalA: 4,
      finalB: 0
    });
    // Egg Clusters should score for 3 blue cards (Faith and Egg Clusters)
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalB: 3
    });
  })

  it('faith card can change colours to effect total', () => {
    // 4 for Faith
    // -1 for EGG CLUSTER
    // 0 for blue cards
    const scores = new Scorer(
      [{'name': 'FAITH', fromColour: 'blue', toColour: 'red'}, {'name': 'EGG CLUSTERS'}],
    ).scores();

    // Faith should score the same
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 4,
      finalA: 4,
      finalB: 0
    });

    // Egg Clusters should score less
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalB: 0
    });
  })
})

describe('FORTUNATE', () => {
  it('FORTUNATE when only card', () => {
    const scores = new Scorer(
      [{'name': 'FORTUNATE'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 3,
      finalA: 1,
      finalB: 2,
    });
  })

  it('when matching number of colour cards', () => {
    const scores = new Scorer(
      [{'name': 'FORTUNATE'}, zeroPointRedCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 1,
      finalA: 1,
      finalB: 0,
    });
  })

  it('when more green cards', () => {
    const scores = new Scorer(
      [{'name': 'FORTUNATE'}, zeroPointGreenCard(), zeroPointRedCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 3,
      finalA: 1,
      finalB: 2,
    });
  })

  it('when less green', () => {
    const scores = new Scorer(
      [{'name': 'FORTUNATE'}, zeroPointRedCard(), zeroPointRedCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 1,
      finalA: 1,
      finalB: 0,
    });
  })
})

describe('Using FREE WILL', () => {
  it('FREE WILL card just has base points', () => {
    const scores = new Scorer(
      [{'name': 'FREE WILL', colour: 'blue'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 2,
      finalA: 2,
      finalB: 0,
    });
  })

  it('FREE WILL can change colours to effect total', () => {
    // 2 for Faith
    // -1 for EGG CLUSTER
    // 2 for blue cards
    const scores = new Scorer(
      [{'name': 'FREE WILL', colour: 'blue'}, {'name': 'EGG CLUSTERS'}],
    ).scores();

    // FREE WILL should score the same
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 2,
      finalA: 2,
      finalB: 0
    });

    // Egg Clusters should score less
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalB: 2
    });
  })
})
