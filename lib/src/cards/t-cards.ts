import { CardInstance, CALC_B_PHASES } from '../types';
import {
  addBasicCard,
  addCardThatPointsByColour,
} from '../cardContainer';
import { isEffectless, hasAction, isDominant } from './effect_cards';
import { filterCardsByType, forEachPlayerCards, playerCards } from './helpers';

addBasicCard({ score: 2 }, { name: 'TALONS', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'TEETH', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'TELEKINETIC', type: ['purple'] });
addBasicCard({ score: 1 }, { name: 'TENTACLES', type: ['blue'] });
addBasicCard({ score: 1 }, { name: 'TERRITORIAL', type: ['red'] });
addBasicCard({ score: 3 }, { name: 'TERROR BEAK', type: ['blue'] });
addCardThatPointsByColour(
  { score: 4, colour: 'purple', pointsPerCard: -1 },
  { name: 'TETRACHROMATIC', type: ['purple'] }
);
addBasicCard({ score: 1 }, { name: 'THAGOMIZER', type: ['green'] });

// --- Sign Cards (Meaning of Life) ---

// +4 if you have only 1 dominant trait. +8 if you have none.
addBasicCard({ score: 0 }, {
  name: 'THE BILBIES',
  type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const dominantCount = playerCards(allPlayerCards, currentPlayer).filter(
      (c: CardInstance) => isDominant(c.card.name)
    ).length;
    if (dominantCount === 0) {
      inst.applyPoints(currentPlayer, 'B', 8, inst, 'for having no dominant traits');
    } else if (dominantCount <= 1) {
      inst.applyPoints(currentPlayer, 'B', 4, inst, 'for having 1 dominant trait');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 2+ dominant traits');
    }
  }
});

addBasicCard({ score: 0 }, {
  name: 'THE CABOCHON',
  type: ['red'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having no red traits');
    } else if (redCount <= 2) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 1-2 red traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 3+ red traits');
    }
  }
});

// +3 if your Gene Pool is 3. +7 if your Gene Pool is 1 or 2.
addBasicCard({ score: 0 }, {
  name: 'THE COSMIC JINX',
  type: ['purple'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    _allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    const genePool = inst.metadata.gene_pool_size;
    if (genePool === 1 || genePool === 2) {
      inst.applyPoints(currentPlayer, 'B', 7, inst, 'for having gene pool between 1-2');
    } else if (genePool === 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having gene pool of 3');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having gene pool of 4+');
    }
  },
  metadataRequired: [['gene_pool_size', 'number', 'player']]
});

// +12 if you have the fewest points before Meaning of Life bonuses
addBasicCard({ score: 0 }, {
  name: 'THE DANCER',
  type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.PRE_MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const scores: number[] = []
    forEachPlayerCards(allPlayerCards, (playerCards) => {
      const currentScore = playerCards.reduce(
        (acc, card) => acc + card.finalA + (card.finalB || 0) + (card.finalC || 0),
        0
      );
      scores.push(currentScore);
    })

    if (scores[currentPlayer] === Math.min(...scores)) {
      inst.applyPoints(currentPlayer, 'B', 12, inst, 'for having the fewest points before Meaning of Life bonuses');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for not having the fewest points before Meaning of Life bonuses');
    }
  }
});

// +3 if you have only 1 or 2 blue traits. +6 if you have none.
addBasicCard({ score: 0 }, {
  name: 'THE FELLMONGER',
  type: ['red'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having no blue traits');
    } else if (blueCount <= 2) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 1-2 blue traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 3+ blue traits');
    }
  }
});

// +3 if you have 3-5 blue traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE JELLYFISH',
  type: ['purple'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ blue traits');
    } else if (blueCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 blue traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 3 blue traits');
    }
  }
});

// +3 if you have 3-5 effectless traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE LOGICIAN',
  type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const effectlessCount = playerCards(allPlayerCards, currentPlayer).filter(
      (c) => isEffectless(c.card.name)
    ).length;
    if (effectlessCount >= 6) {
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ effectless traits');
    } else if (effectlessCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 effectless traits');
    } else {
      inst.applyPoints(currentPlayer,
        'B',
        0,
        inst,
        'for having less than 3 effectless traits'
      );
    }
  }
});

// +3 if you have only 1 or 2 green traits. +6 if you have none.
addBasicCard({ score: 0 }, {
  name: 'THE LUMBERJACK',
  type: ['green'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having no green traits');
    } else if (greenCount <= 2) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 1-2 green traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 3+ green traits');
    }
  }
});

// +3 if you have only 1 or 2 colorless traits. +6 if you have none.
addBasicCard({ score: 0 }, {
  name: 'THE MAGICIAN',
  type: ['colourless'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having no colourless traits');
    } else if (colourlessCount <= 2) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 1-2 colourless traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 3+ colourless traits');
    }
  }
});

// +3 if you have 10-14 traits. +7 if you have 15 or more.
addBasicCard({ score: 0 }, {
  name: 'THE MAVEN',
  type: ['blue'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const traitCount = playerCards(allPlayerCards, currentPlayer).length;
    if (traitCount >= 15) {
      inst.applyPoints(currentPlayer, 'B', 7, inst, 'for having 15+ traits');
    } else if (traitCount >= 10) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 10-14 traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 10 traits');
    }
  }
});

// +3 if you have only 1 or 2 purple traits. +6 if you have none.
addBasicCard({ score: 0 }, {
  name: 'THE SOOTHSAYER',
  type: ['blue'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having no purple traits');
    } else if (purpleCount <= 2) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 1-2 purple traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having 3+ purple traits');
    }
  }
});

// +3 if you have 3-5 colorless traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE SPIRIT GARDENER',
  type: ['green'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ colourless traits');
    } else if (colourlessCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 colourless traits');
    } else {
      inst.applyPoints(currentPlayer,
        'B',
        0,
        inst,
        'for having less than 3 colourless traits'
      );
    }
  }
});

addBasicCard({ score: 0 }, {
  name: 'THE THIRD EYE',
  type: ['colourless'],
});

// +3 if you have 3-5 traits with actions. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE TIGRIS',
  type: ['red'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const actionCount = playerCards(allPlayerCards, currentPlayer).filter((c) =>
      hasAction(c.card.name)
    ).length;
    if (actionCount >= 6) {
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ action traits');
    } else if (actionCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 action traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 3 action traits');
    }
  }
});

// +7 if you have fewer traits than all opponents. +2 if tied for fewest.
addBasicCard({ score: 0 }, {
  name: 'THE VAGRANT',
  type: ['red'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer,
        'B',
        undefined,
        inst,
        'Error: not card count for other players'
      );
    } else if (myCount < minOther) {
      inst.applyPoints(currentPlayer,
        'B',
        7,
        inst,
        'for having fewer traits than all opponents'
      );
    } else if (myCount === minOther) {
      inst.applyPoints(currentPlayer, 'B', 2, inst, 'for having tied for fewest traits');
    } else {
      inst.applyPoints(currentPlayer,
        'B',
        0,
        inst,
        'for having more traits than all opponents'
      );
    }
  }
});

// +3 if you have 3-5 purple traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE VIXEN',
  type: ['blue'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ purple traits');
    } else if (purpleCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 purple traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 3 purple traits');
    }
  }
});

// +3 if you have 3-5 green traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE WARBLER',
  type: ['green'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ green traits');
    } else if (greenCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 green traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 3 green traits');
    }
  }
});

// +3 if you have 3-5 red traits. +6 if you have 6 or more.
addBasicCard({ score: 0 }, {
  name: 'THE WARRIOR',
  type: ['red'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
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
      inst.applyPoints(currentPlayer, 'B', 6, inst, 'for having 6+ red traits');
    } else if (redCount >= 3) {
      inst.applyPoints(currentPlayer, 'B', 3, inst, 'for having 3-5 red traits');
    } else {
      inst.applyPoints(currentPlayer, 'B', 0, inst, 'for having less than 3 red traits');
    }
  }
});

// +3 for each set of all 4 colors (red, green, blue, purple) in your trait pile
addBasicCard({ score: 0 }, {
  name: 'THE WEAVER',
  type: ['purple'],
  calcBRunPhase: CALC_B_PHASES.MEANING_OF_LIFE,
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const colourCounts: { [key: string]: number } = {
      red: 0,
      green: 0,
      blue: 0,
      purple: 0
    };
    playerCards(allPlayerCards, currentPlayer).forEach((c) => {
      c.type.forEach((type) => {
        if (type in colourCounts) {
          colourCounts[type]++;
        }
      });
    });
    // Number of complete sets = minimum count across all 4 colours
    const completeSets = Math.min(...Object.values(colourCounts));
    inst.applyPoints(currentPlayer,
      'B',
      completeSets * 3,
      inst,
      'for having ' + completeSets + ' complete sets of all 4 colours'
    );

    // TODO: should we be counting multi-colour cards in a different way
  }
});

// -1 for each trait in your trait pile (including this one)
addBasicCard({ score: 17 }, {
  name: 'TINY',
  type: ['blue'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const traitCount = playerCards(allPlayerCards, currentPlayer).length;
    inst.applyPoints(currentPlayer,
      'B',
      -traitCount,
      inst,
      'for having ' + traitCount + ' traits'
    );
  }
});

// +1 for each Dinoling in the discard pile
addBasicCard({ score: -1 }, {
  name: 'TINY ARMS',
  type: ['red'],
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    if (typeof inst.metadata.dinolings_in_discard !== 'number') {
      throw new Error('invalid data for metadata field dinolings_in_discard');
    }
    inst.applyPoints(currentPlayer, 'B', inst.metadata.dinolings_in_discard, inst, 'Dinolings in Discard');
  },
  metadataRequired: [['dinolings_in_discard', 'number', 'global']]
});

addBasicCard({ score: 1 }, { name: 'TINY LITTLE MELONS', type: ['green'] });
addBasicCard({ score: 1 }, {
  name: 'TRANSGENIC MODIFICATION',
  type: ['green'],
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
    attachedTo.setOverride('type', ['green']);
    attachedTo.applyPoints(currentPlayer, 'B', 0, inst, 'attached and set colour to green');
  },
  metadataRequired: [['attached_to', 'player_card', 'card']]
});
addBasicCard({ score: 1 }, {
  name: 'TRUNK',
  type: ['green'],
});
addBasicCard({ score: 2 }, {
  name: 'TUBE FEET',
  type: ['blue'],
});
