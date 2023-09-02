import { Scorer } from '../src/scorer';
import { PlayerInput } from '../src/types';

describe('Using ACROBATIC card', () => {
  test('singel card gives the user a total score of 2', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'ACROBATIC'}]);
    expect(scorer.scores()).toStrictEqual([2]);
  });

  test('mutliple cards give the user score of 2 * count', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    );
    expect(scorer.scores()).toStrictEqual([6, 4, 2]);
  });
});

describe('Using ALTRUISTIC card', () => {
  test('single card gives the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'ALTRUISTIC', 'gene_pool_size': 4}]);
    expect(scorer.scores()).toStrictEqual([4]);
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'ALTRUISTIC', 'gene_pool_size': 4}, {'name': 'ALTRUISTIC', 'gene_pool_size': 4}], [{'name': 'ALTRUISTIC', 'gene_pool_size': 6}]
    );
    expect(scorer.scores()).toStrictEqual([8, 6]);
  });

  test('missing metadata raises a missing metadata error', () => {
    const t = () => { new Scorer([], [{'name': 'ALTRUISTIC', 'missing': 4}]) }
    expect(t).toThrow(new Error('missing metadata field gene_pool_size'));
  });

  test('invalid metadata raise an invalid data error', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'ALTRUISTIC', 'gene_pool_size': 'apples'}]);
    const t = () => { scorer.scores() }
    expect(t).toThrow(Error);
    expect(t).toThrow(new Error('invalid data for metadata field gene_pool_size'));
  });
});

describe('Using ALTRUISTIC and AI TAKEOVER cards', () => {
  test('overrides the card score to 2', () => {
    const scorer: Scorer = new Scorer([{'name': 'AI TAKEOVER'}], [{'name': 'ALTRUISTIC', 'gene_pool_size': 4}]);
    expect(scorer.scores()).toStrictEqual([2]);
  });
});

describe('Using APEX PREDATOR card', () => {
  test('extra poinst when user has most cards', () => {
    const scorer: Scorer = new Scorer([], [{'name': 'APEX PREDATOR'}]);
    expect(scorer.scores()).toStrictEqual([8]);
  });

  test('standard poinst when user has matching number or less cards', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}], [{'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}, {'name': 'APEX PREDATOR'}]
    );
    expect(scorer.scores()).toStrictEqual([4, 8, 8, 24]);
  });
});

describe('Using BIOENGINEERED PLAGUE + other cards', () => {
  it("removes when only one card of discard type", () => {
    const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}],
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    );
    expect(scorer.scores()).toStrictEqual([0, 0, 0, 0]);
  })

  it("removes only one when multiple cards of discard type", () => {
    const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}],
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]
    );
    expect(scorer.scores()).toStrictEqual([2, 2, 2, 2]);
  })

  it("error when no discard card is selected for player", () => {
    const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC']}],
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    );
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('no card selected to discard for Player 4'))
  })

  it("error when no discard card not found for player", () => {
    const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'DANCE']}],
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    );
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('could not find card to discard: DANCE for Player 4'))
  })

  it("works when < maximum number of players", () => {
        const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC']}],
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]
    );
    expect(scorer.scores()).toStrictEqual([2, 2]);
  })
})
describe('Using BIONIC ARM', () => {
  it("when on a single card", () => {
    const scorer: Scorer = new Scorer([], [{'name': 'BIONIC ARM'}]);
    expect(scorer.scores()).toStrictEqual([0]);
  })

  it("when multiple cards", () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}], [{'name': 'BIONIC ARM'}, {'name': 'BIONIC ARM'}]
    );
    expect(scorer.scores()).toStrictEqual([6, 2]);
  })
})
