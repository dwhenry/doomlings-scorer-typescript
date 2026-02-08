import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { filterCardsByType, playerCards } from './helpers';

const faith: PlayerCard = {
  name: 'FAITH',
  type: ['colourless'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 4;
  },
  modify: (
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
    ['fromColour', 'CardType', 'card'],
    ['toColour', 'CardType', 'card']
  ]
};
addCard(faith);
addBasicCard('FANGS', 'red', 'Classic', 1);
addBasicCard('FEAR', 'colourless', 'Classic', 1);
addBasicCard('FECUNDITY', 'green', 'Classic', 1);
addBasicCard('FEY', 'green', 'Mythlings', 1);
addBasicCard('FINE MOTOR SKILLS', 'purple', 'Classic', 2);
addBasicCard('FIRE SKIN', 'red', 'Classic', 3);
addBasicCard('FLATULENCE', 'colourless', 'Classic', 3);
addBasicCard('FLIGHT', 'blue', 'Classic', 2);
const fortunate: PlayerCard = {
  name: 'FORTUNATE',
  type: ['green'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 1;
  },
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
      inst.applyPoints('B', 2, inst, 'more green than other colours');
    } else {
      inst.applyPoints('B', 0, inst, 'less green than other colours');
    }
  }
};
addCard(fortunate);
const free_will: PlayerCard = {
  name: 'FREE WILL',
  type: ['colourless'],
  pack: 'multi-colour',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 2;
  },
  modify: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    inst.setOverride('type', [inst.metadata.colour!]);

    // TODO: so this need to re-score any cards that rely on card colour
  },
  metadataRequired: [['colour', 'CardType', 'card']]
};
addCard(free_will);
addBasicCard('FRONDS', 'green', 'Dinolings', 0);
addBasicCard('FULFILLED', 'colourless', 'KSE', 4);
