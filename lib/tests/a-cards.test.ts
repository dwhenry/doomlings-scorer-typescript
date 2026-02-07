import { Player, Scorer } from '../src/scorer';

describe('Using ACROBATIC card', () => {
  let acrobaticCard = {'name': 'ACROBATIC'}
  test('single card gives the user a total score of 2', () => {
    const scores = new Scorer([acrobaticCard]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({total: 2});
  });

  test('each card is worth 2 base points', () => {
    const scores = new Scorer(
      [acrobaticCard, acrobaticCard, acrobaticCard], 
      [acrobaticCard, acrobaticCard], 
      [acrobaticCard]
    ).scores();
    expect(scores.getPlayerScore(Player.One)).toMatchObject({total: 6});
    expect(scores.getPlayerScore(Player.Two)).toMatchObject({total: 4});
    expect(scores.getPlayerScore(Player.Three)).toMatchObject({total: 2});

    // Every Acrobatic card is worth 2
    for (const player of [Player.One, Player.Two, Player.Three]) {
      scores.getPlayerScore(player).getCardScores().forEach(c => expect(c).toMatchObject({total: 2, finalA: 2, finalB: 0}))
    }
  });
});

describe('Using ALTRUISTIC card', () => {
  const altruisticWithGenePool4 = {'name': 'ALTRUISTIC', 'gene_pool_size': 4}
  test('single card gives the user a total score of based on metadata', () => {
    const scores = new Scorer([altruisticWithGenePool4]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({total: 4, finalA: 0});
  });

  test('multiple cards give the user a total score of based on metadata', () => {
    const scores = new Scorer(
      [altruisticWithGenePool4, altruisticWithGenePool4],
      [{'name': 'ALTRUISTIC', 'gene_pool_size': 6}]
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({total: 4});
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(1)).toMatchObject({total: 4});
    expect(scores.getPlayerScore(Player.Two).getCardScoreByIndex(0)).toMatchObject({total: 6});
  });

  test('missing metadata throws a missing metadata error', () => {
    const t = () => { new Scorer([{'name': 'ALTRUISTIC', 'missing': 4}]).scores() }
    expect(t).toThrow(new Error('missing metadata field gene_pool_size'));
  });

  test('invalid metadata throws an invalid data error', () => {
    const scores = new Scorer([{'name': 'ALTRUISTIC', 'gene_pool_size': 'apples'}]);
    const t = () => { scores.scores() }
    expect(t).toThrow(Error);
    expect(t).toThrow(new Error('invalid data for metadata field gene_pool_size'));
  });
});

describe('Using APEX PREDATOR card', () => {
  const apexPredator = {'name': 'APEX PREDATOR'};
  
  test('+4 when user has most cards', () => {
    const scores = new Scorer([apexPredator]).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({total: 8, finalB: 4, finalA: 4});
  });

  test('only scores 4 points when user has equal or less card total', () => {
    const scores = new Scorer(
      [apexPredator], [apexPredator, apexPredator], [apexPredator, apexPredator], [apexPredator, apexPredator, apexPredator]
    ).scores();

    // Only the last player's cards should score more than 4
    for (const player of [Player.One, Player.Two, Player.Three]) {
      const cards = scores.getPlayerScore(player).getCardScores();

      cards.forEach(c => {
        expect(c).toMatchObject({total: 4, finalB: 0, finalA: 4})
      })
    }

    // Player Four has the most cards
    const playerFour = scores.getPlayerScore(Player.Four)
    playerFour.getCardScores().forEach(card => {
      expect(card).toMatchObject({total: 8, finalB: 4, finalA: 4});
    })
    expect(scores.getPlayerScore(Player.Four).total).toBe(24)
  });
});
