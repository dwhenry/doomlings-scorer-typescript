import { addBasicCard } from '../cardContainer';
import { CALC_B_PHASES, CardInstance } from '../types';
import { playerCards } from './helpers';

addBasicCard({ score: 1 }, { name: 'GELATINOUS', type: ['red'], pack: 'Mythlings' });
addBasicCard({ score: 1 }, { name: 'GILLS', type: ['blue'], pack: 'Classic' });

// TODO: this need to run both pre and post catastrophe.....
addBasicCard({ score: -1 }, {
  name: 'GMO', type: ['colourless'], pack: 'Techlings',
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const chosenCardName = inst.metadata['attached_to'] as string;

    const attachedTo = playerCards(allPlayerCards, currentPlayer)
      .find((c) => chosenCardName === c.card.name);

    if (!attachedTo) {
      inst.applyPoints('B', undefined, inst, `chosen card ${chosenCardName} not found`);
      inst.generatedMetadata.attached_card_name = '';
      return;
    }

    attachedTo.attachedCards.push(inst);
    attachedTo.applyPoints('B', 0, inst, 'attached');

    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (!!cardInst.card.type.find((type) => attachedTo?.card.type.includes(type))) {
        cardInst.applyPoints('B', 1, inst, `for being a same trait as ${attachedTo?.card.name}`);
      }
    })
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});

addBasicCard({ score: 0 }, {
  name: 'GRATITUDE', type: ['colourless'], pack: 'Classic',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const uniquePlayerTraits = new Set(
      playerCards(allPlayerCards, currentPlayer)
        .flatMap((a) => a.card.type)
        .filter((c) => c !== 'colourless' && c !== 'catastrophe')
    );
    inst.applyPoints(
      'B',
      uniquePlayerTraits.size,
      inst,
      'number of unique player traits'
    );
  }
});

addBasicCard({ score: -1 }, { name: 'GREY HAT', type: ['colourless'], pack: 'Techlings' });
