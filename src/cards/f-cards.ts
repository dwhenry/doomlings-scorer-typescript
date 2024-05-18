import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';

const faith: PlayerCard = {
  name: 'FAITH',
  type: 'colourless',
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 4;
  },
  modify: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    playerCards.forEach(
      (card) => {
        if(card.type === inst.metadata.fromColour) {
          card.setOverride('type', inst.metadata.toColour!)
        }
      }
    );
  },
  metadataRequired: [['fromColour', 'CardType'], ['toColour', 'CardType']]
};
addCard(faith)
addBasicCard('FANGS', 'red', 'Classic', 1);
addBasicCard('FEAR', 'colourless', 'Classic', 1);
addBasicCard('FECUNDITY', 'green', 'Classic', 1);
addBasicCard('FEY', 'green', 'Mythlings', 1);
addBasicCard('FINE MOTOR SKILLS', 'purple', 'Classic', 2);
addBasicCard('FIRE SKIN', 'red', 'Classic', 3);
addBasicCard('FLATULENCE', 'colourless', 'Classic', 3);
addBasicCard('FLIGHT', 'blue', 'Classic', 2);
addBasicCard('FLOURISH', 'green', 'Classic', 0);
const fortunate: PlayerCard = {
  name: 'FORTUNATE',
  type: 'green',
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    let greenSize = 0
    let colours: { [key: string]: number } = {}
    playerCards.forEach(
      (inst) => {
        inst.type.forEach(type => {
          if(type =='green') {
            greenSize += 1
          } else  {
            colours[type] = colours[type] ?? 0
            colours[type] += 1
          }
        })
      }
    );
    let maxSize = Math.max(...Object.values(colours))
    // only when more green than others
    inst.finalB = maxSize < greenSize ? 2 : 0
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
    inst.setOverride('type', inst.metadata.colour!)
  },
  metadataRequired: [['colour', 'CardType']]
};
addCard(free_will);
addBasicCard('FRONDS', 'green', 'Dinolings', 0);
addBasicCard('FULFILLED', 'colourless', 'Classic', 4);
