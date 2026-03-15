import { CatastropheCardInput, CardInstance, CardType, PLAYER_CARD_NAME } from '../types';
import { addCard } from '../cardContainer';
import { filterCardsByType, forEachPlayerCards, getPlayerCard } from './helpers';
import { isDominant } from './effect_cards';

// --- Helpers ---

/** Returns only non-discarded, non-player-card trait cards from a player's hand */
function activeCards(playerCards: CardInstance[]): CardInstance[] {
  return playerCards.filter((c) => !c.discarded && c.card.name !== PLAYER_CARD_NAME);
}

/** Soft-delete a card: marks it as discarded (scorer zeros its score) */
function softDiscard(card: CardInstance, inst: CardInstance, currentPlayer: number): void {
  card.applyPoints(currentPlayer, 'C', 0, inst, `discarded by catastrophe: ${inst.card.name}`);
  card.discarded = inst;
  card.attachedCards.forEach((c) => {
    c.applyPoints(currentPlayer, 'C', 0, inst, `discarded by catastrophe: ${inst.card.name}`);
    c.discarded = inst;
  });
}

/**
 * Deterministically pick one card from a list of candidates.
 * Given the same set of candidate names (regardless of order), always returns the same card.
 * Uses a simple string hash so the selection looks random but is fully reproducible.
 */
function deterministicPick(candidates: CardInstance[]): CardInstance {
  if (candidates.length === 1) return candidates[0];
  const key = candidates
    .map((c) => c.card.name)
    .sort()
    .join('|');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return candidates[Math.abs(hash) % candidates.length];
}

/**
 * Auto-select a card of a given colour for discard.
 * If previousName is provided and still valid, reuse it.
 * Returns the card to discard, or undefined if none available.
 */
function selectCardByColour(
  playerCards: CardInstance[],
  colour: CardType,
  previousName?: string
): CardInstance | undefined {
  // we also exclude any marked as cannot_discard here
  const candidates = filterCardsByType(playerCards, colour).filter((c) => !c.metadata.cannot_discard);
  if (candidates.length === 0) return undefined;

  // Reuse previous selection if still valid
  if (previousName) {
    const prev = candidates.find((c) => c.card.name === previousName);
    if (prev) return prev;
  }

  // Deterministically pick from candidates
  return deterministicPick(candidates);
}

/**
 * Run discard logic for a colour-specific catastrophe.
 * Auto-selects a card of the target colour per player and soft-deletes it.
 * Stores the discard decision as internal metadata on the catastrophe instance.
 */
function colourDiscard(
  inst: CardInstance,
  allPlayerCards: Array<Array<CardInstance>>,
  colour: CardType
): void {
  const previousDiscard =
    inst.metadata.discard instanceof Array
      ? (inst.metadata.discard as string[])
      : [];

  const discardNames: string[] = allPlayerCards.map((playerCards, position) => {
    const previousName = previousDiscard[position] as string | undefined;
    const target = selectCardByColour(playerCards, colour, previousName);
    if (target) {
      softDiscard(target, inst, position);
      return target.card.name;
    }
    return '';
  });

  inst.generatedMetadata.discard = discardNames;
}

// --- Catastrophe Cards ---

// All colorless traits are now worth 2 points
const aiTakeover: CatastropheCardInput = {
  name: 'AI TAKEOVER',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      filterCardsByType(playerCards, 'colourless').forEach((c) => {
        c.applyPoints(currentPlayer, 'A', 2, inst, 'overwrite card face value to 2');
        if (!isDominant(c.card.name)) {
          c.applyPoints(currentPlayer, 'A', 0, inst, 'effect is removed as non-dominant trait');
          c.skipCalcB = true;
        }
      });
    })
  }
};
addCard(aiTakeover);

// Remove a card from each player's hand (from the colour with highest count)
const bioPlague: CatastropheCardInput = {
  name: 'BIOENGINEERED PLAGUE',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = []
    forEachPlayerCards(allPlayerCards,
      (playerCards, position) => {
        if (playerCards.length === 0) return;

        // get the colour counts first to ensure removing a otehr cards in the same group
        // are not autoselected for discard
        const colourCounts: { [key: string]: number } = {};
        playerCards.forEach((c) => {
          c.type.forEach((t) => {
            if (['colourless', 'purple', 'red', 'green', 'blue'].includes(t)) {
              colourCounts[t] = (colourCounts[t] || 0) + 1;
            }
          });
        });

        let maxColour: string[] = [];
        let maxCount = 0;
        Object.entries(colourCounts).forEach(([colour, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxColour = [colour];
          } else if (count === maxCount) {
            maxColour.push(colour);
          }
        });

        // Check if previous selection is still valid
        const previousName = previousDiscard[position] as string | undefined;
        if (previousName) {
          const prev = playerCards.find((c) => c.card.name === previousName);
          // if the colour of the previous selection is in the max colour list, use it,
          // other we need a new card to discard
          if (prev && !!maxColour.find((c) => prev.type.includes(c))) {
            softDiscard(prev, inst, position);
            discardNames[position] = prev.card.name;
            return;
          }
        }

        if (maxColour.length > 0) {
          const targets = playerCards.filter(
            (card) => !!maxColour.find((colour) => card.type.includes(colour) || !card.metadata.cannot_discard)
          );
          if (targets.length > 0) {
            const target = deterministicPick(targets);
            softDiscard(target, inst, position);
            discardNames[position] = target.card.name;
          }
        }
      }
    );

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(bioPlague);

// World's End: Draw a card. Add its face value to your final score.
const deusExMachina: CatastropheCardInput = {
  name: 'DEUS EX MACHINA',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    if (!(inst.metadata.drawn_face_values instanceof Array)) {
      throw new Error('invalid data for metadata field drawn_face_values');
    }
    if (inst.metadata.drawn_face_values.filter(v => v === '').length != allPlayerCards.length) {
      throw new Error('invalid data for metadata field drawn_face_values');
    }
    inst.metadata.drawn_face_values.forEach((faceValue, currentPlayer) => {
      // TODO: add number[] as a valid type - we currently only support number or string[]
      const parsedValue = parseInt(faceValue);
      if (typeof parsedValue !== 'number') {
        throw new Error(
          `no drawn face value specified for Player ${currentPlayer + 1}`
        );
      }
      getPlayerCard(allPlayerCards, currentPlayer)?.applyPoints(currentPlayer, 'C', Math.min(parsedValue, 5), inst, 'for drawing a trait with face value of ' + faceValue + ' (max 5)');
    })

    // TODO: would be nice if this allow selection by card name
  },
  metadataRequired: [['drawn_face_values', 'card_per_person', 'card']]
};
addCard(deusExMachina);

// World's End: Discard your highest face value trait from your trait pile
const eyesOpenFromBehindTheStars: CatastropheCardInput = {
  name: 'EYES OPEN FROM BEHIND THE STARS',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = []
    forEachPlayerCards(allPlayerCards, (playerCards, position) => {
      if (playerCards.length === 0) return;

      // Auto-compute: find highest face value card(s), then pick deterministically among ties
      const maxValue = Math.max(...playerCards.map((c) => c.finalA));

      // Check if previous selection is still valid
      const previousName = previousDiscard[position] as string | undefined;
      if (previousName) {
        const prev = playerCards.find((c) => c.card.name === previousName);
        if (prev && prev.finalA === maxValue) {
          softDiscard(prev, inst, position);
          discardNames[position] = prev.card.name;
          return;
        }
      }

      const tied = playerCards.filter((c) => c.finalA === maxValue);
      const target = deterministicPick(tied);
      softDiscard(target, inst, position);
      discardNames[position] = target.card.name;
    })

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(eyesOpenFromBehindTheStars);

// World's End: Discard 1 blue trait from your trait pile at random
const glacialMeltdown: CatastropheCardInput = {
  name: 'GLACIAL MELTDOWN',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'blue');
  },
  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(glacialMeltdown);

// World's End: -5 points to the player(s) with the most traits in their trait pile
const greyGoo: CatastropheCardInput = {
  name: 'GREY GOO',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    let maxTraits = 0;
    const selectedPlayerIndices: number[] = [];

    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      if (playerCards.length > maxTraits) {
        maxTraits = playerCards.length;
        selectedPlayerIndices.length = 0;
        selectedPlayerIndices.push(currentPlayer);
      } else if (playerCards.length === maxTraits) {
        selectedPlayerIndices.push(currentPlayer);
      }
    });

    selectedPlayerIndices.forEach((currentPlayer) => {
      const playerCard = getPlayerCard(allPlayerCards, currentPlayer);
      if (playerCard) {
        playerCard.applyPoints(currentPlayer, 'C', -5, inst, 'for having the most traits');
      }
    });
  }
};
addCard(greyGoo);

// World's End: -1 for every red trait in your trait pile
const iceAge: CatastropheCardInput = {
  name: 'ICE AGE',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      playerCards.forEach((card) => {
        if (card.type.includes('red')) {
          card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a red trait');
        }
      });
    });
  }
};
addCard(iceAge);

// World's End: -1 for each trait with face value of 3 or more
const impactEvent: CatastropheCardInput = {
  name: 'IMPACT EVENT',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      playerCards.forEach((c) => {
        if (c.finalA >= 3) {
          c.applyPoints(currentPlayer,
            'C',
            -1,
            inst,
            'for being a trait with face value of 3 or more'
          );
        }
      });
    });
  }
};
addCard(impactEvent);

// World's End: Discard 1 green trait from your trait pile at random
const massExtinction: CatastropheCardInput = {
  name: 'MASS EXTINCTION',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'green');
  },
  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(massExtinction);

// World's End: Discard 1 red trait from your trait pile at random
const megaTsunami: CatastropheCardInput = {
  name: 'MEGA TSUNAMI',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'red');
  },

  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(megaTsunami);

// World's End: Discard 1 colorless trait from your trait pile
const nuclearWinter: CatastropheCardInput = {
  name: 'NUCLEAR WINTER',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'colourless');
  },
  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(nuclearWinter);

// World's End: +4 points to the player(s) with the fewest traits in their trait pile
const overpopulation: CatastropheCardInput = {
  name: 'OVERPOPULATION',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    let minTraits = Infinity;
    const selectedPlayerIndices: number[] = [];

    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      if (playerCards.length < minTraits) {
        minTraits = playerCards.length;
        selectedPlayerIndices.length = 0;
        selectedPlayerIndices.push(currentPlayer);
      } else if (playerCards.length === minTraits) {
        selectedPlayerIndices.push(currentPlayer);
      }
    });

    selectedPlayerIndices.forEach((currentPlayer) => {
      const playerCard = getPlayerCard(allPlayerCards, currentPlayer);
      if (playerCard) {
        playerCard.applyPoints(currentPlayer, 'C', 4, inst, 'for having the fewest traits');
      }
    });
  }
};
addCard(overpopulation);

// World's End: Discard 1 purple trait from your trait pile at random
const pulseEvent: CatastropheCardInput = {
  name: 'PULSE EVENT',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'purple');
  },
  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(pulseEvent);

// World's End: -1 for every green trait in your trait pile
const retrovirus: CatastropheCardInput = {
  name: 'RETROVIRUS',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      filterCardsByType(playerCards, 'green').forEach((card) => {
        card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a green trait');
      });
    });
  }
};
addCard(retrovirus);

// World's End: -1 for every purple trait in your trait pile
const solarFlare: CatastropheCardInput = {
  name: 'SOLAR FLARE',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      filterCardsByType(playerCards, 'purple').forEach((card) => {
        card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a purple trait');
      });
    });
  }
};
addCard(solarFlare);

// World's End: -1 for every blue trait in your trait pile
const superVolcano: CatastropheCardInput = {
  name: 'SUPER VOLCANO',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      filterCardsByType(playerCards, 'blue').forEach((card) => {
        card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a blue trait');
      });
    });
  }
};
addCard(superVolcano);

// World's End: -2 to your score for each card over 7 in your trait pile
const theBigOne: CatastropheCardInput = {
  name: 'THE BIG ONE',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      getPlayerCard(allPlayerCards, currentPlayer)?.
      applyPoints(currentPlayer, 'C', -2 * (playerCards.length - 7), inst, 'for having more than 7 traits in your pile');
    });
  }
};
addCard(theBigOne);

// World's End: Discard 1 trait from your trait pile with face value of 3 or more
const theFourHorsemen: CatastropheCardInput = {
  name: 'THE FOUR HORSEMEN',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = []
    forEachPlayerCards(allPlayerCards, (playerCards, position) => {
        const candidates = playerCards.filter((c) => c.finalA >= 3);
        if (candidates.length === 0) return '';

        // Check if previous selection is still valid
        const previousName = previousDiscard[position] as string | undefined;
        if (previousName) {
          const prev = candidates.find((c) => c.card.name === previousName);
          if (prev) {
            softDiscard(prev, inst, position);
            discardNames[position] = prev.card.name;
            return
          }
        }

        // Deterministically pick from candidates with face value >= 3
        const target = deterministicPick(candidates);
        softDiscard(target, inst, position);
        discardNames[position] = target.card.name;
      }
    );

    inst.generatedMetadata.discard = discardNames;
  },
  // TODO: allow card to discard to be selected
  metadataRequired: [['discard', 'card_per_person', 'card']]
};
addCard(theFourHorsemen);

// --- Kickstarter duplicate catastrophes (same as Classic, alternate art) ---

const aiTakeoverKs: CatastropheCardInput = {
  name: 'AI TAKEOVER (kickstarter)',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      filterCardsByType(playerCards, 'colourless').forEach((c) => {
        c.applyPoints(currentPlayer, 'A', 2, inst, 'overwrite card face value to 2');
        c.applyPoints(currentPlayer, 'A', 0, inst, 'effect is removed as non-dominant trait');
        c.skipCalcB = true;
      });
    })

  }
};
addCard(aiTakeoverKs);

const deusExMachinaKs: CatastropheCardInput = {
  name: 'DEUS EX MACHINA (kickstarter)',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
   if (!(inst.metadata.drawn_face_values instanceof Array)) {
      throw new Error('invalid data for metadata field drawn_face_values');
    }
    if (inst.metadata.drawn_face_values.filter(v => v === '').length != allPlayerCards.length) {
      throw new Error('invalid data for metadata field drawn_face_values');
    }
    inst.metadata.drawn_face_values.forEach((faceValue, currentPlayer) => {
      // TODO: add number[] as a valid type - we currently only support number or string[]
      const parsedValue = parseInt(faceValue);
      if (typeof parsedValue !== 'number') {
        throw new Error(
          `no drawn face value specified for Player ${currentPlayer + 1}`
        );
      }
      getPlayerCard(allPlayerCards, currentPlayer)?.applyPoints(currentPlayer, 'C', parsedValue, 5, inst, 'for drawing a trait with face value of ' + faceValue);
    })

    // TODO: would be nice if this allow selection by card name
  },
  metadataRequired: [['drawn_face_values', 'card_per_person', 'card']]
};
addCard(deusExMachinaKs);

const glacialMeltdownKs: CatastropheCardInput = {
  name: 'GLACIAL MELTDOWN (kickstarter)',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'blue');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(glacialMeltdownKs);

const megaTsunamiKs: CatastropheCardInput = {
  name: 'MEGA TSUNAMI (kickstarter)',
  type: ['catastrophe'],
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'red');
  },

  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(megaTsunamiKs);

const nuclearWinterKs: CatastropheCardInput = {
  ...nuclearWinter,
  name: 'NUCLEAR WINTER (kickstarter)',
};
addCard(nuclearWinterKs);
