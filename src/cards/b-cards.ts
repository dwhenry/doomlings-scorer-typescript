import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { hasEffect  } from './effect_cards';

addBasicCard('BAD', 'red', 'Classic', 1);
addBasicCard('BARK', 'green', 'Classic', 2);
addBasicCard('BEAUTY', 'green', 'Classic', 2);
addBasicCard('BIG EARS', 'green', 'Classic', 2);
addBasicCard('BINARY', 'colourless', 'Techlings', 0);

const bionic_arm: PlayerCard = {
  name: 'BIONIC ARM',
  type: 'red',
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const techlingCards = playerCards.filter(
      (inst) => inst.card.pack === 'Techlings'
    );

    // TODO: wokr out when this is attached and set to 2 when it is
    const multiplier = 1;

    inst.finalB = techlingCards.length * multiplier;
  }
};
addCard(bionic_arm);

addBasicCard('BLOOM', 'multi-colour', 'Classic', 1);
addBasicCard('BLUBBER', 'blue', 'Classic', 4);
addBasicCard('BONE REINFORCEMENT', 'red', 'Techlings', 4);
addBasicCard('BONES', 'colourless', 'Classic', 2);
addBasicCard('BONY PLATES', 'green', 'Dinolings', 2);

const boredom: PlayerCard = {
  name: 'BOREDOM',
  type: 'colourless',
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const effectCards = playerCards.filter(
      (inst) => {
        const val = hasEffect(inst.card.name)
        return val
      }
    );

    inst.finalB = effectCards.length;
  }
};
addCard(boredom);

const branches: PlayerCard = {
  name: 'BRANCHES',
  type: 'green',
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    let points = 0

    // point for each pair of green cards in each players hand
    allPlayerCards.forEach((playerCards, index) => {
      if(index !== currentPlayer) {
        points = points + Math.floor(playerCards.filter((inst) => inst.card.type == 'green').length / 2)
      }
    });

    inst.finalB = points;
  }
};
addCard(branches);

addBasicCard('BRAVE', 'red', 'Classic', 2);
addBasicCard('BRUTE STRENGTH', 'red', 'Classic', 4);
addBasicCard('BULLHEADED', 'multi-colour', 'Classic', 1);

