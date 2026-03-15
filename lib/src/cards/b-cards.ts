import { CALC_B_PHASES, CardInstance } from '../types';
import { addBasicCard } from '../cardContainer';
import { hasEffect, isDominant } from './effect_cards';
import { filterCardsByCollection, filterCardsByType, forEachPlayerCards, playerCards } from './helpers';

addBasicCard({ score: 1 }, { name: 'BAD', type: ['red'] });
addBasicCard({ score: 2 }, { name: 'BARK', type: ['green'] });
addBasicCard({ score: 2 }, { name: 'BEAUTY', type: ['green'] });
addBasicCard({ score: 1 }, { name: 'BIG EARS', type: ['purple'] });
addBasicCard({ score: 0 }, { name: 'BINARY', type: ['colourless'] });
addBasicCard({ score: -1 }, {
  name: 'BIONIC ARM', type: ['red'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const multiplier = inst.attachedCards.length > 0 ? 2 : 1;
    const message = inst.attachedCards.length > 0 ? 'attached' : 'not attached';
    filterCardsByCollection(allPlayerCards[currentPlayer], 'Techlings').forEach((playerCard) => {
      playerCard.applyPoints(currentPlayer, 'B', multiplier, inst, `Bionic Arm is ${message}`);
    });
  }
});
addBasicCard({ score: 1 }, { name: 'BLOOM', type: ['green', 'blue'] });
addBasicCard({ score: 4 }, { name: 'BLUBBER', type: ['blue'] });

addBasicCard({ score: 4 }, {
  name: 'BONE REINFORCEMENT', type: ['red'],
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
    attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached');
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
});
addBasicCard({ score: 2 }, { name: 'BONES', type: ['colourless'] });
addBasicCard({ score: 2 }, { name: 'BONY PLATES', type: ['green'] });

// TODO: Cards in hand is **not** played cards. This is buggy.
addBasicCard({ score: 0 }, {
  name: 'BOREDOM',
  type: ['colourless'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.effect_less_cards_in_hand !== 'number') {
      throw new Error('invalid data for metadata field effect_less_cards_in_hand');
    }

    inst.applyPoints(currentPlayer, 'B', inst.metadata.effect_less_cards_in_hand, inst, 'point for each effect less card in hand');
  },
  metadataRequired: [['effect_less_cards_in_hand', 'number', 'player']]
});
addBasicCard({ score: 0 }, {
  name: 'BRANCHES', type: ['green'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let points = 0;

    // point for each pair of green cards in each players hand
    forEachPlayerCards(allPlayerCards, (playerCards, index) => {
      if (index !== currentPlayer) {
        points += Math.floor(filterCardsByType(playerCards, 'green').length / 2);
      }
    })

    inst.applyPoints(currentPlayer,
      'B',
      points,
      inst,
      'point for each pair of green card in opponents hands'
    );

    // TODO: we need to queue this card for post-processing as card colours can change
  }
});
addBasicCard({ score: 1 }, { name: 'BRAVE', type: ['red'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (isDominant(cardInst.card.name)) {
        cardInst.applyPoints(currentPlayer, 'B', 2, inst, 'for being a dominant trait');
      }
    })
  }
 });
addBasicCard({ score: 4 }, { name: 'BRUTE STRENGTH', type: ['red'] });
addBasicCard({ score: 1 }, { name: 'BULLHEADED', type: ['red', 'green'] });
