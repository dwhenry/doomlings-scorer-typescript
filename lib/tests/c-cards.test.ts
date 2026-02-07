import { Player, Scorer } from '../src/scorer';
import { zeroPointBlueCard, zeroPointColourlessCard } from './helpers';

describe('Using CAMOUFLAGE + other cards', () => {
  it('addition points for each card in hand', () => {
    const scores = new Scorer(
      [{'name': 'CAMOUFLAGE', 'cards_in_hand': 5}],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 7,
      finalA: 2, 
      finalB: 5, 
    })
  })
})

describe('Using CRANIAL CREST + other cards', () => {
  it('base score when only colourless cards', () => {
    const scores = new Scorer(
      [{'name': 'CRANIAL CREST'}, zeroPointColourlessCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 4,
      finalA: 4, 
    })
  })

  it('scores -1 for each colourless card', () => {
    const scores = new Scorer(
      [{'name': 'CRANIAL CREST'}, zeroPointBlueCard()],
    ).scores();
    expect(scores.getPlayerScore(Player.One).getCardScoreByIndex(0)).toMatchObject({
      total: 3,
      finalA: 4, 
      finalB: -1
    })
  })
})
