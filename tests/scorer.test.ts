import { Scorer } from '../src/scorer';
import { PlayerInput } from '../src/cardContainer';

describe('Using ACROBATIC card', () => {
  test('singel card gives the user a total score of 2', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([2, 0, 0, 0]);
  });

  test('mutliple cards give the user score of 2 * count', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([6, 4, 2, 0]);
  });
});

describe('Using ALTRUISTIC card', () => {
  test('single card gives the user a total score of based on metadata', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ALTRUISTIC', 'gene_pool_size': 4}], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([4, 0, 0, 0]);
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ALTRUISTIC', 'gene_pool_size': 4}, {'name': 'ALTRUISTIC', 'gene_pool_size': 4}], [{'name': 'ALTRUISTIC', 'gene_pool_size': 6}], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([8, 6, 0, 0]);
  });

  test('missing metadata raises a missing metadata error', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ALTRUISTIC', 'missing': 4}], [], [], []]
    const t = () => { new Scorer(cards) }
    expect(t).toThrow(new Error('missing metadata field gene_pool_size'));
  });

  test('invalid metadata raise an invalid data error', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ALTRUISTIC', 'gene_pool_size': 'apples'}], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    const t = () => { scorer.scores() }
    expect(t).toThrow(Error);
    expect(t).toThrow(new Error('invalid data for metadata field gene_pool_size'));
  });
});

describe('Using ALTRUISTIC and AI TAKEOVER cards', () => {

})
