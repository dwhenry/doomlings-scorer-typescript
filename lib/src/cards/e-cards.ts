import { CALC_B_PHASES, CardInstance } from '../types';
import {
  addBasicCard,
  addCardThatPointsByColour,
} from '../cardContainer';
import { filterCardsByCollection, forEachPlayerCards } from './helpers';

addBasicCard({ score: 4 }, { name: 'ECHOLOCATION', type: ['blue'] });
addBasicCard({ score: -3 }, { name: 'EFFIGIAL', type: ['colourless'] });
addCardThatPointsByColour(
  { score: -1, colour: 'blue', pointsPerCard: 1 },
  { name: 'EGG CLUSTERS', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'EGG PREDATION', type: ['purple'] });
addBasicCard({ score: 1 }, {
  name: 'ELECTROMAGNETIC', type: ['green'],
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {

    const [playerIndex, cardName] = inst.metadata.attached_to as [string, string];

    forEachPlayerCards(allPlayerCards, (playerCards, i) => {
      if (i.toString() === playerIndex) {
        const attachedTo = playerCards.find((cardInst) => cardInst.card.name === cardName);
        if (!attachedTo) {
          inst.generatedMetadata.attached_to = [];
          return
        }

        attachedTo.attachedCards.push(inst);
        attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached');
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
});
addBasicCard({ score: 1 }, { name: 'ELONGATED NECK', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'ELOQUENCE', type: ['colourless'] });
addBasicCard({ score: -1 }, {
  name: 'ELVEN EARS', type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const mythlingCards = filterCardsByCollection(allPlayerCards.flat(), 'Mythlings');

    inst.applyPoints(currentPlayer,
      'B',
      mythlingCards.length,
      inst,
      'for mythling cards for all players'
    );
  }
});
addBasicCard({ score: 1 }, { name: 'ENDURANCE', type: ['red'] });
