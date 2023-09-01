import { Scorer } from '../src/scorer';

describe('Using ACROBATIC card', () => {
  test('singel card gives the user a total score of 2', () => {
    const scorer: Scorer = new Scorer('ACROBATIC', '', '', '');
    expect(scorer.scores()).toStrictEqual([2, 0, 0, 0]);
  });

  test('mutliple cards give the user score of 2 * count', () => {
    const scorer: Scorer = new Scorer('ACROBATIC,ACROBATIC,ACROBATIC', 'ACROBATIC,ACROBATIC', 'ACROBATIC', '');
    expect(scorer.scores()).toStrictEqual([6, 4, 2, 0]);
  });
});

describe('Using ALRUISTIC card', () => {
  test('single card gives the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer('ALTRUISTIC+gene_pool_size=4', '', '', '');
    expect(scorer.scores()).toStrictEqual([4, 0, 0, 0]);
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer('ALTRUISTIC+gene_pool_size=4,ALTRUISTIC+gene_pool_size=4', 'ALTRUISTIC+gene_pool_size=6', '', '');
    expect(scorer.scores()).toStrictEqual([8, 6, 0, 0]);
  });

  test('missing metadata raises a missing metadata error', () => {
    const t = () => { new Scorer('ALTRUISTIC+missing=4', '', '', '') }
    expect(t).toThrow(new Error('missing metadata field gene_pool_size'));
  });

  test('invalid metadata raise an invalid data error', () => {
    const scorer: Scorer = new Scorer('ALTRUISTIC+gene_pool_size=apples', '', '', '');
    const t = () => { scorer.scores() }
    expect(t).toThrow(Error);
    expect(t).toThrow(new Error('invalid data for metadata field gene_pool_size'));
  });
});

describe('Using ALRUISTIC and AI TAKEOVER cards', () => {

})
