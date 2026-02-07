import { PlayerCard, CardInstance } from '../types';
import { addCard, addBasicCard } from '../cardContainer';
import { isEffectless, hasAction } from './effect_cards';

addBasicCard('TALONS', 'purple', 'Dinolings', 2);
addBasicCard('TEETH', 'purple', 'Classic', 1);
addBasicCard('TELEKINETIC', 'purple', 'Classic', 1);
addBasicCard('TENTACLES', 'blue', 'Classic', 1);
addBasicCard('TERRITORIAL', 'red', 'Classic', 1);
addBasicCard('TERROR BEAK', 'blue', 'Dinolings', 3);

// -1 for each colorless trait in your trait pile
const tetrachromatic: PlayerCard = {
  name: 'TETRACHROMATIC',
  type: ['purple'],
  pack: 'multi-colour',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 4;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const playerCards = allPlayerCards[currentPlayer];
    const colourlessCount = playerCards.filter((c) =>
      c.type.includes('colourless')
    ).length;
    inst.finalB = -colourlessCount;
  }
};
addCard(tetrachromatic);

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
    const playerCards = allPlayerCards[currentPlayer];
    const { isDominant } = require('./effect_cards');
    const dominantCount = playerCards.filter((c: CardInstance) =>
      isDominant(c.card.name)
    ).length;
    if (dominantCount === 0) {
      inst.finalB = 8;
    } else if (dominantCount <= 1) {
      inst.finalB = 4;
    } else {
      inst.finalB = 0;
    }
  }
};
addCard(theBilbies);

// +3 if you have only 1 or 2 red traits. +6 if you have none.
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
    const playerCards = allPlayerCards[currentPlayer];
    const redCount = playerCards.filter((c) => c.type.includes('red')).length;
    if (redCount === 0) {
      inst.finalB = 6;
    } else if (redCount <= 2) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
      inst.finalB = 7;
    } else if (genePool === 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
    }
  },
  metadataRequired: [['gene_pool_size', 'number', 'player']]
};
addCard(theCosmicJinx);

// +12 if you have the fewest points before Meaning of Life bonuses
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
    if (typeof inst.metadata.has_fewest_points !== 'number') {
      throw new Error('invalid data for metadata field has_fewest_points');
    }
    inst.finalB = inst.metadata.has_fewest_points === 1 ? 12 : 0;
  },
  metadataRequired: [['has_fewest_points', 'number', 'player']]
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
    const playerCards = allPlayerCards[currentPlayer];
    const blueCount = playerCards.filter((c) => c.type.includes('blue')).length;
    if (blueCount === 0) {
      inst.finalB = 6;
    } else if (blueCount <= 2) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const blueCount = playerCards.filter((c) => c.type.includes('blue')).length;
    if (blueCount >= 6) {
      inst.finalB = 6;
    } else if (blueCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const effectlessCount = playerCards.filter((c) =>
      isEffectless(c.card.name)
    ).length;
    if (effectlessCount >= 6) {
      inst.finalB = 6;
    } else if (effectlessCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const greenCount = playerCards.filter((c) =>
      c.type.includes('green')
    ).length;
    if (greenCount === 0) {
      inst.finalB = 6;
    } else if (greenCount <= 2) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const colourlessCount = playerCards.filter((c) =>
      c.type.includes('colourless')
    ).length;
    if (colourlessCount === 0) {
      inst.finalB = 6;
    } else if (colourlessCount <= 2) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const traitCount = allPlayerCards[currentPlayer].length;
    if (traitCount >= 15) {
      inst.finalB = 7;
    } else if (traitCount >= 10) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const purpleCount = playerCards.filter((c) =>
      c.type.includes('purple')
    ).length;
    if (purpleCount === 0) {
      inst.finalB = 6;
    } else if (purpleCount <= 2) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const colourlessCount = playerCards.filter((c) =>
      c.type.includes('colourless')
    ).length;
    if (colourlessCount >= 6) {
      inst.finalB = 6;
    } else if (colourlessCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const actionCount = playerCards.filter((c) =>
      hasAction(c.card.name)
    ).length;
    if (actionCount >= 6) {
      inst.finalB = 6;
    } else if (actionCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const myCount = allPlayerCards[currentPlayer].length;
    const otherCounts = allPlayerCards
      .filter((_, i) => i !== currentPlayer)
      .map((pc) => pc.length);
    const minOther = Math.min(...otherCounts);

    if (myCount < minOther) {
      inst.finalB = 7;
    } else if (myCount === minOther) {
      inst.finalB = 2;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const purpleCount = playerCards.filter((c) =>
      c.type.includes('purple')
    ).length;
    if (purpleCount >= 6) {
      inst.finalB = 6;
    } else if (purpleCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const greenCount = playerCards.filter((c) =>
      c.type.includes('green')
    ).length;
    if (greenCount >= 6) {
      inst.finalB = 6;
    } else if (greenCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    const playerCards = allPlayerCards[currentPlayer];
    const redCount = playerCards.filter((c) => c.type.includes('red')).length;
    if (redCount >= 6) {
      inst.finalB = 6;
    } else if (redCount >= 3) {
      inst.finalB = 3;
    } else {
      inst.finalB = 0;
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
    inst.finalB = completeSets * 3;
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
    const traitCount = allPlayerCards[currentPlayer].length;
    inst.finalB = -traitCount;
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
    inst.finalB = inst.metadata.dinolings_in_discard;
  },
  metadataRequired: [['dinolings_in_discard', 'number', 'global']]
};
addCard(tinyArms);

addBasicCard('TINY LITTLE MELONS', 'green', 'Classic', 1);
addBasicCard('TRANSGENIC MODIFICATION', 'green', 'Techlings', 1);
addBasicCard('TRUNK', 'green', 'Classic', 1);
addBasicCard('TUBE FEET', 'blue', 'KSE', 2);
