import { Scorer } from '../src/scorer';

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

  it("error when discard is not an array", () => {
    const scorer: Scorer = new Scorer(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': 1}],
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]
    );
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('discard is not an array'))
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

describe('Using BOREDOM + other cards', () => {
  it("add points when cards have effects", () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'BOREDOM'}, {'name': 'BAD'}]
    );
    expect(scorer.scores()).toStrictEqual([3]);

  })

  it("does not add points when cards have no effects", () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'BOREDOM'}, {'name': 'ADORABLE'}]
    );
    expect(scorer.scores()).toStrictEqual([5]);
  })
})

describe('Using BRANCHES + other cards', () => {
  it('point for pairs of green cards in opponents hands', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'BRANCHES'}],
      [{'name': 'BONY PLATES'}, {'name': 'BONY PLATES'}],
      [{'name': 'BONY PLATES'}, {'name': 'BONY PLATES'}, {'name': 'BONY PLATES'}],
    );
    expect(scorer.scores()).toStrictEqual([2, 4, 6]);
  })

  it('no points for green cards in players hands', () => {
    const scorer: Scorer = new Scorer(
      [],
      [{'name': 'BRANCHES'}, {'name': 'BONY PLATES'}, {'name': 'BONY PLATES'}],
    );
    expect(scorer.scores()).toStrictEqual([4]);
  })
})
