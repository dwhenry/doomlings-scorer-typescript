import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { playerCards } from './helpers';

addBasicCard({ score: 2 }, {
  name: 'CAMOUFLAGE', type: ['red'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field cards_in_hand');
    }
    inst.applyPoints(currentPlayer, 'B', inst.metadata.cards_in_hand, inst, 'point for each card in hand');
  },
  metadataRequired: [['cards_in_hand', 'number', 'player']]
});
addBasicCard({ score: 9 }, { name: 'CARNOSAUR JAW', type: ['red'] });
addBasicCard({ score: 4 }, { name: 'CERATOPSIAN HORNS', type: ['green'] });
addBasicCard({ score: 0 }, { name: 'CHROMATOPHORES', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'CLEVER', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'COLD BLOOD', type: ['blue'] });
addBasicCard({ score: -2 }, { name: 'CONFUSION', type: ['colourless'] });
addBasicCard({ score: -2 }, { name: 'COSTLY SIGNALING', type: ['blue'] });
addBasicCard({ score: 4 }, {
  name: 'CRANIAL CREST', type: ['colourless'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const types = playerCards(allPlayerCards, currentPlayer)
      .flatMap((inst) => inst.type)
    // we minus one as we have at least one colourless that doesn't count
    inst.applyPoints(currentPlayer, 'B', -([...new Set(types)].length - 1), inst, 'point for each colour trait that we have');
  }
});
addBasicCard({ score: 1 }, { name: 'CURIOSITY', type: ['blue', 'red'] });
addBasicCard({ score: 1 }, {
  name: 'CYBERNETIC', type: ['blue'],
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const attachedTo = playerCards(allPlayerCards, currentPlayer)
      .find((cardInst) => cardInst.card.name === inst.metadata.attached_to)
    if (!attachedTo) {
      inst.generatedMetadata.attached_to = '';
      return
    }

    attachedTo.attachedCards.push(inst);
    attachedTo.setOverride('type', ['blue']);
    attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached and colour set to blue');
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});