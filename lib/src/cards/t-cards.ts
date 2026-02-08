import { PlayerCard, CardInstance } from '../types';
import {
  addCard,
  addBasicCard,
  addCardThatPointsByColour
} from '../cardContainer';
import { isEffectless, hasAction, isDominant } from './effect_cards';
import { filterCardsByType, forEachPlayerCards, playerCards } from './helpers';

addBasicCard('TALONS', 'purple', 'Dinolings', 2);
addBasicCard('TEETH', 'purple', 'Classic', 1);
addBasicCard('TELEKINETIC', 'purple', 'Classic', 1);
addBasicCard('TENTACLES', 'blue', 'Classic', 1);
addBasicCard('TERRITORIAL', 'red', 'Classic', 1);
addBasicCard('TERROR BEAK', 'blue', 'Dinolings', 3);
addCardThatPointsByColour(
  'TETRACHROMATIC',
  'purple',
  'multi-colour',
  4,
  'colourless',
  -1
);
addBasicCard('THAGOMIZER', 'green', 'Dinolings', 1);

// --- Sign Cards (Meaning of Life) ---

// +4 if you have only 1 dominant trait. +8 if you have none.
const theBilbies: PlayerCard = {
  name: 'THE BILBIES',
  type: ['colourless'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const dominantCount = playerCards(allPlayerCards, currentPlayer).filter(
      (c: CardInstance) => isDominant(c.card.name)
    ).length;
    if (dominantCount === 0) {
      inst.applyPoints('B', 8, inst, 'for having no dominant traits');
    } else if (dominantCount <= 1) {
      inst.applyPoints('B', 4, inst, 'for having 1 dominant trait');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 2+ dominant traits');
    }
  }
};
addCard(theBilbies);

const theCabochon: PlayerCard = {
  name: 'THE CABOCHON',
  type: ['red'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const redCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'red'
    ).length;
    if (redCount === 0) {
      inst.applyPoints('B', 6, inst, 'for having no red traits');
    } else if (redCount <= 2) {
      inst.applyPoints('B', 3, inst, 'for having 1-2 red traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 3+ red traits');
    }
  }
};
addCard(theCabochon);

// +3 if your Gene Pool is 3. +7 if your Gene Pool is 1 or 2.
const theCosmicJinx: PlayerCard = {
  name: 'THE COSMIC JINX',
  type: ['purple'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    const genePool = inst.metadata.gene_pool_size;
    if (genePool === 1 || genePool === 2) {
      inst.applyPoints('B', 7, inst, 'for having gene pool between 1-2');
    } else if (genePool === 3) {
      inst.applyPoints('B', 3, inst, 'for having gene pool of 3');
    } else {
      inst.applyPoints('B', 0, inst, 'for having gene pool of 4+');
    }
  },
  metadataRequired: [['gene_pool_size', 'number', 'player']]
};
addCard(theCosmicJinx);

// +12 if you have the fewest points before Meaning of Life bonuses
// TODO: fix this card as
const theDancer: PlayerCard = {
  name: 'THE DANCER',
  type: ['colourless'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.bonus_points_as_not_implemented !== 'number') {
      throw new Error('invalid data for metadata field has_fewest_points');
    }
    inst.applyPoints('B', inst.metadata.bonus_points_as_not_implemented, inst, 'Manual Bonus Points as Not Implemented');

    // TODO: we want to add this as a scoring stage??
  },
  metadataRequired: [['bonus_points_as_not_implemented', 'number', 'player']]
};
addCard(theDancer);

// +3 if you have only 1 or 2 blue traits. +6 if you have none.
const theFellmonger: PlayerCard = {
  name: 'THE FELLMONGER',
  type: ['red'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const blueCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'blue'
    ).length;
    if (blueCount === 0) {
      inst.applyPoints('B', 6, inst, 'for having no blue traits');
    } else if (blueCount <= 2) {
      inst.applyPoints('B', 3, inst, 'for having 1-2 blue traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 3+ blue traits');
    }
  }
};
addCard(theFellmonger);

// +3 if you have 3-5 blue traits. +6 if you have 6 or more.
const theJellyfish: PlayerCard = {
  name: 'THE JELLYFISH',
  type: ['purple'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const blueCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'blue'
    ).length;
    if (blueCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ blue traits');
    } else if (blueCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 blue traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 3 blue traits');
    }
  }
};
addCard(theJellyfish);

// +3 if you have 3-5 effectless traits. +6 if you have 6 or more.
const theLogician: PlayerCard = {
  name: 'THE LOGICIAN',
  type: ['colourless'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const effectlessCount = playerCards(allPlayerCards, currentPlayer).filter(
      (c) => isEffectless(c.card.name)
    ).length;
    if (effectlessCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ effectless traits');
    } else if (effectlessCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 effectless traits');
    } else {
      inst.applyPoints(
        'B',
        0,
        inst,
        'for having less than 3 effectless traits'
      );
    }
  }
};
addCard(theLogician);

// +3 if you have only 1 or 2 green traits. +6 if you have none.
const theLumberjack: PlayerCard = {
  name: 'THE LUMBERJACK',
  type: ['green'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const greenCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'green'
    ).length;
    if (greenCount === 0) {
      inst.applyPoints('B', 6, inst, 'for having no green traits');
    } else if (greenCount <= 2) {
      inst.applyPoints('B', 3, inst, 'for having 1-2 green traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 3+ green traits');
    }
  }
};
addCard(theLumberjack);

// +3 if you have only 1 or 2 colorless traits. +6 if you have none.
const theMagician: PlayerCard = {
  name: 'THE MAGICIAN',
  type: ['colourless'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const colourlessCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'colourless'
    ).length;
    if (colourlessCount === 0) {
      inst.applyPoints('B', 6, inst, 'for having no colourless traits');
    } else if (colourlessCount <= 2) {
      inst.applyPoints('B', 3, inst, 'for having 1-2 colourless traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 3+ colourless traits');
    }
  }
};
addCard(theMagician);

// +3 if you have 10-14 traits. +7 if you have 15 or more.
const theMaven: PlayerCard = {
  name: 'THE MAVEN',
  type: ['blue'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const traitCount = playerCards(allPlayerCards, currentPlayer).length;
    if (traitCount >= 15) {
      inst.applyPoints('B', 7, inst, 'for having 15+ traits');
    } else if (traitCount >= 10) {
      inst.applyPoints('B', 3, inst, 'for having 10-14 traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 10 traits');
    }
  }
};
addCard(theMaven);

// +3 if you have only 1 or 2 purple traits. +6 if you have none.
const theSoothsayer: PlayerCard = {
  name: 'THE SOOTHSAYER',
  type: ['blue'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const purpleCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'purple'
    ).length;
    if (purpleCount === 0) {
      inst.applyPoints('B', 6, inst, 'for having no purple traits');
    } else if (purpleCount <= 2) {
      inst.applyPoints('B', 3, inst, 'for having 1-2 purple traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having 3+ purple traits');
    }
  }
};
addCard(theSoothsayer);

// +3 if you have 3-5 colorless traits. +6 if you have 6 or more.
const theSpiritGardener: PlayerCard = {
  name: 'THE SPIRIT GARDENER',
  type: ['green'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const colourlessCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'colourless'
    ).length;
    if (colourlessCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ colourless traits');
    } else if (colourlessCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 colourless traits');
    } else {
      inst.applyPoints(
        'B',
        0,
        inst,
        'for having less than 3 colourless traits'
      );
    }
  }
};
addCard(theSpiritGardener);

addBasicCard('THE THIRD EYE', 'colourless', 'Classic', 0);

// +3 if you have 3-5 traits with actions. +6 if you have 6 or more.
const theTigris: PlayerCard = {
  name: 'THE TIGRIS',
  type: ['red'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const actionCount = playerCards(allPlayerCards, currentPlayer).filter((c) =>
      hasAction(c.card.name)
    ).length;
    if (actionCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ action traits');
    } else if (actionCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 action traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 3 action traits');
    }
  }
};
addCard(theTigris);

// +7 if you have fewer traits than all opponents. +2 if tied for fewest.
const theVagrant: PlayerCard = {
  name: 'THE VAGRANT',
  type: ['red'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const myCount = playerCards(allPlayerCards, currentPlayer).length;
    let minOther: number | undefined = undefined;

    forEachPlayerCards(allPlayerCards, (playerCards, i) => {
      if (i !== currentPlayer) {
        const otherCount = playerCards.length;
        if (minOther === undefined || otherCount < minOther) {
          minOther = otherCount;
        }
      }
    });

    if (minOther === undefined) {
      inst.applyPoints(
        'B',
        undefined,
        inst,
        'Error: not card count for other players'
      );
    } else if (myCount < minOther) {
      inst.applyPoints(
        'B',
        7,
        inst,
        'for having fewer traits than all opponents'
      );
    } else if (myCount === minOther) {
      inst.applyPoints('B', 2, inst, 'for having tied for fewest traits');
    } else {
      inst.applyPoints(
        'B',
        0,
        inst,
        'for having more traits than all opponents'
      );
    }
  }
};
addCard(theVagrant);

// +3 if you have 3-5 purple traits. +6 if you have 6 or more.
const theVixen: PlayerCard = {
  name: 'THE VIXEN',
  type: ['blue'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const purpleCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'purple'
    ).length;
    if (purpleCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ purple traits');
    } else if (purpleCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 purple traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 3 purple traits');
    }
  }
};
addCard(theVixen);

// +3 if you have 3-5 green traits. +6 if you have 6 or more.
const theWarbler: PlayerCard = {
  name: 'THE WARBLER',
  type: ['green'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const greenCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'green'
    ).length;
    if (greenCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ green traits');
    } else if (greenCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 green traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 3 green traits');
    }
  }
};
addCard(theWarbler);

// +3 if you have 3-5 red traits. +6 if you have 6 or more.
const theWarrior: PlayerCard = {
  name: 'THE WARRIOR',
  type: ['red'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const redCount = filterCardsByType(
      allPlayerCards[currentPlayer],
      'red'
    ).length;
    if (redCount >= 6) {
      inst.applyPoints('B', 6, inst, 'for having 6+ red traits');
    } else if (redCount >= 3) {
      inst.applyPoints('B', 3, inst, 'for having 3-5 red traits');
    } else {
      inst.applyPoints('B', 0, inst, 'for having less than 3 red traits');
    }
  }
};
addCard(theWarrior);

// +3 for each set of all 4 colors (red, green, blue, purple) in your trait pile
const theWeaver: PlayerCard = {
  name: 'THE WEAVER',
  type: ['purple'],
  pack: 'Meaning of Life',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const colourCounts: { [key: string]: number } = {
      red: 0,
      green: 0,
      blue: 0,
      purple: 0
    };
    playerCards.forEach((c) => {
      c.type.forEach((type) => {
        if (type in colourCounts) {
          colourCounts[type]++;
        }
      });
    });
    // Number of complete sets = minimum count across all 4 colours
    const completeSets = Math.min(...Object.values(colourCounts));
    inst.applyPoints(
      'B',
      completeSets * 3,
      inst,
      'for having ' + completeSets + ' complete sets of all 4 colours'
    );

    // TODO: should we be counting multi-colour cards in a different way
  }
};
addCard(theWeaver);

// -1 for each trait in your trait pile (including this one)
const tiny: PlayerCard = {
  name: 'TINY',
  type: ['blue'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 17;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const traitCount = playerCards(allPlayerCards, currentPlayer).length;
    inst.applyPoints(
      'B',
      -traitCount,
      inst,
      'for having ' + traitCount + ' traits'
    );
  }
};
addCard(tiny);

// +1 for each Dinoling in the discard pile
const tinyArms: PlayerCard = {
  name: 'TINY ARMS',
  type: ['red'],
  pack: 'Dinolings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.dinolings_in_discard !== 'number') {
      throw new Error('invalid data for metadata field dinolings_in_discard');
    }
    inst.applyPoints('B', inst.metadata.dinolings_in_discard, inst, 'Dinolings in Discard');
  },
  metadataRequired: [['dinolings_in_discard', 'number', 'global']]
};
addCard(tinyArms);

addBasicCard('TINY LITTLE MELONS', 'green', 'Classic', 1);
addBasicCard('TRANSGENIC MODIFICATION', 'green', 'Techlings', 1);
addBasicCard('TRUNK', 'green', 'Classic', 1);
addBasicCard('TUBE FEET', 'blue', 'KSE', 2);
