import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { hasEffect } from './effect_cards';
import { filterCardByPack, filterCardsByType, playerCards } from './helpers';

addBasicCard({ score: 1 }, { name: 'BAD', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'BARK', type: ['green'], pack: 'Classic' });
addBasicCard({ score: 2 }, { name: 'BEAUTY', type: ['green'], pack: 'KSE' });
addBasicCard({ score: 1 }, { name: 'BIG EARS', type: ['purple'], pack: 'Classic' });
addBasicCard({ score: 0 }, { name: 'BINARY', type: ['colourless'], pack: 'Techlings' });
addBasicCard({ score: -1 }, {
  name: 'BIONIC ARM', type: ['red'], pack: 'Techlings',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    // TODO: work out when this is attached and set to 2 when it is
    const multiplier = inst.attachedCards.length > 0 ? 2 : 1;
    filterCardByPack(playerCards, 'Techlings').forEach((playerCard) => {
      playerCard.applyPoints('B', multiplier, inst, 'Bionic Arm is attached');
    });
  }
});
addBasicCard({ score: 1 }, { name: 'BLOOM', type: ['green', 'blue'], pack: 'multi-colour' });
addBasicCard({ score: 4 }, { name: 'BLUBBER', type: ['blue'], pack: 'Classic' });

addBasicCard({ score: 4 }, {
  name: 'BONE REINFORCEMENT', type: ['red'], pack: 'Techlings',
  calcBRunPhase: CALC_B_PHASES.PRE_CATASTROPHE,
  calcB: (inst: CardInstance,
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
    attachedTo.applyPoints('B', 0, inst, 'attached');
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
});
addBasicCard({ score: 2 }, { name: 'BONES', type: ['colourless'], pack: 'KSE' });
addBasicCard({ score: 2 }, { name: 'BONY PLATES', type: ['green'], pack: 'Dinolings' });

// TODO: Cards in hand is **not** played cards. This is buggy.
addBasicCard({ score: 0 }, {
  name: 'BOREDOM',
  type: ['colourless'],
  pack: 'Classic',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    playerCards.forEach((card) => {
      if (hasEffect(card.card.name)) {
        card.applyPoints('B', 1, inst, 'this card has no effect');
      }
    });
  }
});
addBasicCard({ score: 0 }, {
  name: 'BRANCHES', type: ['green'], pack: 'Classic',
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let points = 0;

    // point for each pair of green cards in each players hand
    allPlayerCards.forEach((playerCards, index) => {
      if (index !== currentPlayer) {
        points =
          points +
          Math.floor(filterCardsByType(playerCards, 'green').length / 2);
      }
    });

    inst.applyPoints(
      'B',
      points,
      inst,
      'point for each pair of green card in opponents hands'
    );

    // TODO: we need to queue this card for post-processing as card colours can change
  }
});
addBasicCard({ score: 2 }, { name: 'BRAVE', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 4 }, { name: 'BRUTE STRENGTH', type: ['red'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'BULLHEADED', type: ['red', 'green'], pack: 'multi-colour' });
