import { Player, Scorer } from '../src/scorer';
import { PlayerInput } from '../src/types';
import {zeroPointColourlessCard} from './helpers'

describe('AI TAKEOVER', () => {
  test('overrides colourless cards to score 2', () => {
    const scores = new Scorer([zeroPointColourlessCard(), zeroPointColourlessCard(), zeroPointColourlessCard(), zeroPointColourlessCard()]).addCatastrophes([{'name': 'AI TAKEOVER'}]).scores();
    scores.getPlayerScore(Player.One).getCardScores().forEach(card => {
      expect(card).toMatchObject({
        total: 2,
        finalB: 0
      });
    });
  });

  test('ignores colourless cards effects', () => {
    const scores = new Scorer([{'name': 'ALTRUISTIC', 'gene_pool_size': 4}]).addCatastrophes([{'name': 'AI TAKEOVER'}]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      finalB: 0
    });
  });
});

describe('Using BIOENGINEERED PLAGUE + other cards', () => {
  it("removes when only one card of discard type", () => {
    const scores = new Scorer(
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    )
    .addCatastrophes( [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}],)
    .scores();
    const playerScores = scores.getPlayerScores();

    // Cards are discarded 
    for (const playerScore of playerScores) {
      expect(playerScore.getCardScores().length).toBe(0)
    }
  })

  it("removes only one when multiple cards of discard type", () => {
    const players: PlayerInput[][] = 
      [[{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]]
    const scores = new Scorer(
      ...players
    )
    .addCatastrophes([{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'ACROBATIC']}])
    .scores();
    for (let i = 0; i < players.length; i++) {
      expect(scores.getPlayerScore(i).getCardScores().length).toBe(players[i].length - 1)
    }
  })

  it("error when no discard card is selected for player", () => {
    const scorer = new Scorer(
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    )
    .addCatastrophes(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC']}],
    );
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('no card selected to discard for Player 4'))
  })

  it("error when no discard card not found for player", () => {
    const scorer = new Scorer(
      [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}]
    )
    .addCatastrophes(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC', 'ACROBATIC', 'DANCE']}],);
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('could not find card to discard: DANCE for Player 4'))
  })

  it("works when < maximum number of players", () => {
    const scores = new Scorer(
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]
    )
    .addCatastrophes(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': ['ACROBATIC', 'ACROBATIC']}],)
    .scores();
    expect(scores.getPlayerScore(Player.One).getCardScores().length).toEqual(1);
    expect(scores.getPlayerScore(Player.Two).getCardScores().length).toEqual(1);
  })

  it("error when discard is not an array", () => {
    const scorer = new Scorer(
      [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}], [{'name': 'ACROBATIC'}, {'name': 'ACROBATIC'}]
    ).addCatastrophes(
      [{'name': 'BIOENGINEERED PLAGUE', 'discard': 1}],);
    const t = () => { scorer.scores() }
    expect(t).toThrow(new Error('discard is not an array'))
  })
})