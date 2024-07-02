import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard } from './helpers';

describe('Using EGG CLUSTERS + other cards', () => {
  it('single card', () => {
    const scores = new Scorer(
      [{'name': 'EGG CLUSTERS'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 0,
      finalA: -1, 
      finalB: 1
    })
  })

  it('+1 point for each blue card', () => {
    const scores = new Scorer(
      [{'name': 'EGG CLUSTERS'}, zeroPointBlueCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1, 
      finalB: 2
    })
  })

  it('no points for other colour cards', () => {
    const scores = new Scorer(
      [{'name': 'EGG CLUSTERS'}, zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 0,
      finalA: -1, 
      finalB: 1
    })
  })

  it('multiple egg clusters grow together', () => {
    const scores = new Scorer(
      [{'name': 'EGG CLUSTERS'}, {'name': 'EGG CLUSTERS'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1, 
      finalB: 2
    })
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalA: -1, 
      finalB: 2
    })
  })
})

describe('ELVEN EARS', () => {
  it('single card', () => {
    const scores = new Scorer(
      [{'name': 'ELVEN EARS'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 0,
      finalA: -1,
      finalB: 1
    });
  })

  it('1 point for each mythling card (including itself)', () => {
    const scores = new Scorer(
      // -1 points from Elven Ears
      // 1 point for each mythling
      // 2 points from Ancient
      [{'name': 'ELVEN EARS'}, {'name': 'ANCIENT'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1,
      finalB: 2
    });
  })

  it('no points for other pack cards', () => {
    const scores = new Scorer(
      [{'name': 'ELVEN EARS'}, zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1,
      finalB: 1
    });
  })

  it('multiple elven ears grow together', () => {
    const scores = new Scorer(
      [{'name': 'ELVEN EARS'}, {'name': 'ELVEN EARS'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalA: -1,
      finalB: 2
    });
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({
      finalA: -1,
      finalB: 2
    });
  })

  it('mythlings in other players trait piles', () => {
    const scores = new Scorer(
      [{'name': 'ELVEN EARS'}],
      [{'name': 'ANCIENT'}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 1,
      finalA: -1,
      finalB: 2
    });
  })
})