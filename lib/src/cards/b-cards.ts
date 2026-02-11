import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { hasEffect } from './effect_cards';
import { filterCardByPack, filterCardsByType, playerCards } from './helpers';

addBasicCard('BAD', 'red', 'Classic', 1);
addBasicCard('BARK', 'green', 'Classic', 2);
addBasicCard('BEAUTY', 'green', 'KSE', 2);
addBasicCard('BIG EARS', 'purple', 'Classic', 1);
addBasicCard('BINARY', 'colourless', 'Techlings', 0);

const bionic_arm: PlayerCard = {
  name: 'BIONIC ARM',
  type: ['red'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', -1, inst, 'face card value')
  },
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
};
addCard(bionic_arm);

addBasicCard('BLOOM', ['green', 'blue'], 'multi-colour', 1);
addBasicCard('BLUBBER', 'blue', 'Classic', 4);

const boneReinforcement: PlayerCard = {
  name: 'BONE REINFORCEMENT',
  type: ['red'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 4, inst, 'face card value')
  },
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
};
addCard(boneReinforcement);
addBasicCard('BONES', 'colourless', 'KSE', 2);
addBasicCard('BONY PLATES', 'green', 'Dinolings', 2);

// TODO: Cards in hand is **not** played cards. This is buggy.
const boredom: PlayerCard = {
  name: 'BOREDOM',
  type: ['colourless'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 0, inst, 'face card value')
  },
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
};
addCard(boredom);

const branches: PlayerCard = {
  name: 'BRANCHES',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 0, inst, 'face card value')
  },
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
};
addCard(branches);

addBasicCard('BRAVE', 'red', 'Classic', 2);
addBasicCard('BRUTE STRENGTH', 'red', 'Classic', 4);
addBasicCard('BULLHEADED', ['red', 'green'], 'multi-colour', 1);
