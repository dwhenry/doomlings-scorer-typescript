import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { filterCardsByType, playerCards } from './helpers';

addBasicCard({ score: 4 }, {
  name: 'FAITH', type: ['colourless'], pack: 'Classic',
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
addBasicCard({ score: 1 }, { name: 'FANGS', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'FEAR', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'FECUNDITY', type: ['green'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'FEY', type: ['green'], pack: 'Mythlings' });
addBasicCard({ score: 2 }, { name: 'FINE MOTOR SKILLS', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 3 }, { name: 'FIRE SKIN', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 3 }, { name: 'FLATULENCE', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'FLIGHT', type: ['blue'], pack: 'Classic' });
addBasicCard({ score: 1 }, {
  name: 'FORTUNATE', type: ['green'], pack: 'Classic',
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
  name: 'FREE WILL', type: ['colourless'], pack: 'multi-colour',
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
addBasicCard({ score: 0 }, { name: 'FRONDS', type: ['green'], pack: 'Dinolings' });
addBasicCard({ score: 4 }, { name: 'FULFILLED', type: ['colourless'], pack: 'KSE' });
