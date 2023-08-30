import { Scorer } from '../src/scorer';

describe('Using a single ACROBATIC card', () => {
  test('gives the user a round A score of 2', () => {
    const scorer: Scorer = new Scorer('ACROBATIC', '', '', '');
    expect(scorer.scoreA()).toStrictEqual([2, 0, 0, 0]);
  });

  test('gives the user a round B score of 0', () => {
    const scorer: Scorer = new Scorer('ACROBATIC', '', '', '');
    expect(scorer.scoreB()).toStrictEqual([0, 0, 0, 0]);
  });

  test('gives the user a round C of 0', () => {
    const scorer: Scorer = new Scorer('ACROBATIC', '', '', '');
    expect(scorer.scoreC()).toStrictEqual([0, 0, 0, 0]);
  });

  test('gives the user a total score of 2', () => {
    const scorer: Scorer = new Scorer('ACROBATIC', '', '', '');
    expect(scorer.scores()).toStrictEqual([2, 0, 0, 0]);
  });
});