import { PlayerCard, CardInstance } from '../types';
import {
  addCard,
  addBasicCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { filterCardByPack, forEachPlayerCards, playerCards } from './helpers';

addBasicCard('ECHOLOCATION', 'blue', 'Classic', 4);
addBasicCard('EFFIGIAL', 'colourless', 'Mythlings', -3);
addCardThatPointsByColour('EGG CLUSTERS', 'blue', 'Classic', -1, 'blue', 1);
addBasicCard('EGG PREDATION', 'purple', 'Dinolings', 1);
const electromagnetic: PlayerCard = {
  name: 'ELECTROMAGNETIC',
  type: ['green'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', 1, inst, 'face card value')
  },
  calcB: (inst: CardInstance,
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
        attachedTo.applyPoints('B', 0, inst, 'attached');
      }
    })
  },
  metadataRequired: [['attached_to', 'any_player_card', 'card']]
};
addCard(electromagnetic);
addBasicCard('ELONGATED NECK', 'blue', 'Dinolings', 1);
addBasicCard('ELOQUENCE', 'colourless', 'Classic', 1);
const elven_ears: PlayerCard = {
  name: 'ELVEN EARS',
  type: ['green'],
  pack: 'Mythlings',
  calcA: (inst: CardInstance): void => {
    inst.applyPoints('A', -1, inst, 'face card value')
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    _currentPlayer: number
  ): void => {
    const mythlingCards = filterCardByPack(allPlayerCards.flat(), 'Mythlings');

    inst.applyPoints(
      'B',
      mythlingCards.length,
      inst,
      'for mythling cards for all players'
    );
  }
};
addCard(elven_ears);
addBasicCard('ENDURANCE', 'red', 'Classic', 1);
