import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { filterCardsByType, playerCards } from './helpers';

addBasicCard({ score: 4 }, {
  name: 'FAITH', type: ['colourless'],
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

    // TODO: so this need to re-score any cards that rely on card colour
  },
  metadataRequired: [
    ['fromColour', 'card_type', 'card'],
    ['toColour', 'card_type', 'card']
  ]
});
addBasicCard({ score: 1 }, { name: 'FANGS', type: ['red'] });
addBasicCard({ score: 1 }, { name: 'FEAR', type: ['colourless'] });
addBasicCard({ score: 1 }, { name: 'FECUNDITY', type: ['green'] });
addBasicCard({ score: 1 }, { name: 'FEY', type: ['green'] });
addBasicCard({ score: 2 }, { name: 'FINE MOTOR SKILLS', type: ['purple'] });
addBasicCard({ score: 3 }, { name: 'FIRE SKIN', type: ['red'] });
addBasicCard({ score: 3 }, { name: 'FLATULENCE', type: ['colourless'] });
addBasicCard({ score: 2 }, { name: 'FLIGHT', type: ['blue'] });
addBasicCard({ score: 1 }, {
  name: 'FORTUNATE', type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let greenSize = 0;
    let colours: { [key: string]: number } = {};
    playerCards(allPlayerCards, currentPlayer).forEach((inst) => {
      inst.type.forEach((type) => {
        if (type == 'green') {
          greenSize += 1;
        } else {
          colours[type] = colours[type] ?? 0;
          colours[type] += 1;
        }
      });
    });
    let maxSize = Math.max(...Object.values(colours));
    // only when more green than others
    if (maxSize < greenSize) {
      inst.applyPoints(currentPlayer, 'B', 2, inst, 'more green than other colours');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'less green than other colours');
    }
  }
});
addBasicCard({ score: 2 }, {
  name: 'FREE WILL', type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    inst.setOverride('type', [inst.metadata.chosen_colour!] as string[]);

  },
  metadataRequired: [['chosen_colour', 'card_type', 'card']]
});
addBasicCard({ score: 0 }, { name: 'FRONDS', type: ['green'] });
addBasicCard({ score: 4 }, { name: 'FULFILLED', type: ['colourless'] });
