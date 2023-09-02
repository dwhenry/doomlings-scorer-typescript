import { Scorer } from '../src/scorer';
import { PlayerInput } from '../src/types';

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
  test('overrides the card score to 2', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ALTRUISTIC', 'gene_pool_size': 4}], [], [], [], [{'name': 'AI TAKEOVER'}]]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([2, 0, 0, 0]);
  });
});

describe('Using APEX PREDATOR card', () => {
  test('extra poinst when user has most cards', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'APEX PREDATOR'}], [], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([8, 0, 0, 0]);
  });

  test('standard poinst when user has matching number or less cards', () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([4, 8, 8, 24]);
  });
});

describe('Using BIOENGINEERED PLAGUE + other cards', () => {
  it("removes when only one card of discard type", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}]]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([0, 0, 0, 0]);
  })

  it("removes only one when multiple cards of discard type", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}]]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([2, 2, 2, 2]);
  })

  it("error when no discard card is selected for player", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC']}]]
    const scorer: Scorer = new Scorer(cards);
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('no card selected to discard for Player 4'))
  })

  it("error when no discard card not found for player", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'DANCE']}]]
    const scorer: Scorer = new Scorer(cards);
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('could not find card to discard: DANCE for Player 4'))
  })

  it("works when < maximum number of players", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [], [], [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC']}]]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([2, 2, 0, 0]);
  })
})
describe('Using BIONIC ARM', () => {
  it("when on a single card", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'BIONIC ARM'}], [], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([0, 0, 0, 0]);
  })

  it("when multiple cards", () => {
    const cards: Array<Array<PlayerInput>> = [[{'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}], [{'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}], [], [], []]
    const scorer: Scorer = new Scorer(cards);
    expect(scorer.scores()).toStrictEqual([6, 2, 0, 0]);
  })
})
