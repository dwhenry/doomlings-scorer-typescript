/**
 * Kickstarter duplicate cards (same gameplay as Classic, alternate art).
 * Image filenames: "NAME (kickstarter).png" in images/cards/.
 */
import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { filterCardsByType, playerCards } from './helpers';
import { hasEffect } from './effect_cards';

const KS_PACK = 'Classic (Kickstarter)' as const;

// --- Trait duplicates (same logic as Classic) ---

addBasicCard({ score: 1 }, { name: 'TERRITORIAL (kickstarter)', type: ['red'], pack: KS_PACK });
addBasicCard({ score: 1 }, { name: 'LATE (kickstarter)', type: ['colourless'], pack: KS_PACK });
addBasicCard({ score: -1 }, { name: 'SELF-AWARENESS (kickstarter)', type: ['colourless'], pack: KS_PACK });
addBasicCard({ score: 2 }, { name: 'SAUDADE (kickstarter)', type: ['colourless'], pack: KS_PACK });
addBasicCard({ score: 2 }, {
  name: 'CAMOUFLAGE (kickstarter)', type: ['red'], pack: KS_PACK,
  calcB: (
    inst: CardInstance,
    _allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field cards_in_hand');
    }
    inst.applyPoints(currentPlayer, 'B', inst.metadata.cards_in_hand, inst, 'point for each card in hand');
  },
  metadataRequired: [['cards_in_hand', 'number', 'player']]
});
addBasicCard({ score: 1 }, { name: 'TELEKINETIC (kickstarter)', type: ['purple'], pack: KS_PACK });
addBasicCard({ score: 2 }, { name: 'BRAVE (kickstarter)', type: ['red'], pack: KS_PACK });
addBasicCard({ score: 0 }, { name: 'TECTONIC SHIFT (kickstarter)', type: ['green'], pack: KS_PACK });
addBasicCard({ score: 0 }, {
  name: 'BOREDOM (kickstarter)',
  type: ['colourless'],
  pack: KS_PACK,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCardsList = allPlayerCards[currentPlayer];
    playerCardsList.forEach((card) => {
      if (hasEffect(card.card.name)) {
        card.applyPoints(currentPlayer, 'B', 1, inst, 'this card has no effect');
      }
    });
  }
});
addBasicCard({ score: 4 }, {
  name: 'FAITH (kickstarter)', type: ['colourless'], pack: KS_PACK,
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    filterCardsByType(
      allPlayerCards[currentPlayer],
      inst.metadata.fromColour!
    ).forEach((card) => {
      card.setOverride('type', [inst.metadata.toColour!]);
    });
  },
  metadataRequired: [
    ['fromColour', 'card_type', 'card'],
    ['toColour', 'card_type', 'card']
  ]
});
addBasicCard({ score: 0 }, { name: 'SELF-REPLICATING (kickstarter)', type: ['green'], pack: KS_PACK });
addBasicCard({ score: 1 }, { name: 'LEAVES (kickstarter)', type: ['green'], pack: KS_PACK });
addBasicCard({ score: 1 }, {
  name: 'FORTUNATE (kickstarter)', type: ['green'], pack: KS_PACK,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let greenSize = 0;
    const colours: { [key: string]: number } = {};
    playerCards(allPlayerCards, currentPlayer).forEach((c) => {
      c.type.forEach((type) => {
        if (type === 'green') {
          greenSize += 1;
        } else {
          colours[type] = (colours[type] ?? 0) + 1;
        }
      });
    });
    const maxSize = Math.max(0, ...Object.values(colours));
    if (maxSize < greenSize) {
      inst.applyPoints(currentPlayer, 'B', 2, inst, 'more green than other colours');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'less green than other colours');
    }
  }
});
addBasicCard({ score: 3 }, {
  name: 'PACK BEHAVIOR (kickstarter)',
  type: ['green'],
  pack: KS_PACK,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const colourCounts: { [key: string]: number } = {};
    const currentPlayerCards = playerCards(allPlayerCards, currentPlayer);
    const multiColourCount = currentPlayerCards.filter((c) => c.type.length > 1).length;
    currentPlayerCards.forEach((c) => {
      if (c.type.length === 1) {
        c.type.forEach((type) => {
          if (type !== 'colourless' && type !== 'catastrophe' && type !== 'none') {
            colourCounts[type] = (colourCounts[type] || 0) + 1;
          }
        });
      }
    });
    const totalCards = Object.values(colourCounts).reduce((sum, count) => sum + count, 0);
    const maxPairCount = Math.floor(totalCards / 2);
    const maxSingleColourCount = Math.max(0, ...Object.values(colourCounts));
    const pairCount = maxSingleColourCount > maxPairCount
      ? totalCards - maxSingleColourCount
      : maxPairCount;
    inst.applyPoints(currentPlayer, 'B', pairCount + multiColourCount, inst, 'point for each pair of colours');
  }
});
addBasicCard({ score: 1 }, { name: 'TENTACLES (kickstarter)', type: ['blue'], pack: KS_PACK });
addBasicCard({ score: 0 }, { name: 'REGENERATIVE TISSUE (kickstarter)', type: ['blue'], pack: KS_PACK });
addBasicCard({ score: 0 }, { name: 'AUTOMIMICRY (kickstarter)', type: ['blue'], pack: KS_PACK });
