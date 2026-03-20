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
    if(!inst.metadata.fromColour || !inst.metadata.toColour) {
      throw new Error('invalid data for metadata fields fromColour or toColour');
    }
    filterCardsByType(
      allPlayerCards[currentPlayer],
      inst.metadata.fromColour
    ).forEach((card) => {
      card.applyPoints(currentPlayer, 'B', 0, inst, `converted to colour: ${inst.metadata.toColour}`);
      card.setOverride('type', [inst.metadata.toColour!]);
    });
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
addBasicCard({ score: 0 }, {
  name: 'FORTUNATE', type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field card_in_hand');
    }
    inst.applyPoints(currentPlayer, 'B', inst.metadata.cards_in_hand, inst, 'point for each card in hand');
  },
  metadataRequired: [['cards_in_hand', 'number', 'player']]

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
