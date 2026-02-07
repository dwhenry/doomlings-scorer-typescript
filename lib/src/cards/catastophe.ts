import { CatastopheCard, CardInstance, CardType } from '../types';
import { addCard } from '../cardContainer';

// --- Helpers ---

/** Returns only non-discarded cards from a player's hand */
function activeCards(playerCards: CardInstance[]): CardInstance[] {
  return playerCards.filter(c => !c.discarded);
}

/** Soft-delete a card: marks it as discarded (scorer zeros its score) */
function softDiscard(card: CardInstance): void {
  card.discarded = true;
}

/**
 * Deterministically pick one card from a list of candidates.
 * Given the same set of candidate names (regardless of order), always returns the same card.
 * Uses a simple string hash so the selection looks random but is fully reproducible.
 */
function deterministicPick(candidates: CardInstance[]): CardInstance {
  if (candidates.length === 1) return candidates[0];
  const key = candidates.map(c => c.card.name).sort().join('|');
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
  const candidates = activeCards(playerCards).filter(c => c.type.includes(colour));
  if (candidates.length === 0) return undefined;

  // Reuse previous selection if still valid
  if (previousName) {
    const prev = candidates.find(c => c.card.name === previousName);
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
  const previousDiscard = inst.metadata.discard instanceof Array
    ? inst.metadata.discard as string[]
    : [];

  const discardNames: string[] = allPlayerCards.map((playerCards, position) => {
    const previousName = previousDiscard[position] as string | undefined;
    const target = selectCardByColour(playerCards, colour, previousName);
    if (target) {
      softDiscard(target);
      return target.card.name;
    }
    return '';
  });

  inst.generatedMetadata.discard = discardNames;
}

// --- Catastrophe Cards ---

// All colorless traits are now worth 2 points
const aiTakeover: CatastopheCard = {
  name: 'AI TAKEOVER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const colourlessCards: Array<CardInstance> = allPlayerCards.reduce(
      (allCards, playerCards) => {
        const clessCards: Array<CardInstance> = activeCards(playerCards).filter(
          (c: CardInstance) => c.type.includes('colourless')
        );
        return [...clessCards, ...allCards];
      },
      [] as CardInstance[]
    );

    colourlessCards.forEach((c: CardInstance) => {
      c.finalA = 2;
      c.finalB = 0;
      c.skipCalcB = true;
    });
  }
};
addCard(aiTakeover);

// Remove a card from each player's hand (from the colour with highest count)
const bioPlague: CatastopheCard = {
  name: 'BIOENGINEERED PLAGUE',
  type: ['catastrophe'],
  pack: 'Techlings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard = inst.metadata.discard instanceof Array
      ? inst.metadata.discard as string[]
      : [];

    const discardNames: string[] = allPlayerCards.map((playerCards, position) => {
      const active = activeCards(playerCards);
      if (active.length === 0) return '';

      // get the colour counts first to ensure removing a otehr cards in the same group
      // are not autoselected for discard
      const colourCounts = new Map<string, number>();
      active.forEach(c => {
        c.type.forEach(t => {
          if (['colourless', 'purple', 'red', 'green', 'blue'].includes(t)) {
            colourCounts.set(t, (colourCounts.get(t) || 0) + 1);
          }
        });
      });

      let maxColour: string[] = [];
      let maxCount = 0;
      colourCounts.forEach((count, colour) => {
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
        const prev = active.find(c => c.card.name === previousName);
        // if the colour of the previous selection is in the max colour list, use it,
        // other we need a new card to discard
        if (prev && !!maxColour.find(c => prev.type.includes(c))) {
          softDiscard(prev);
          return prev.card.name;
        }
      }


      if (maxColour.length > 0) {
        const targets = active.filter(
          card => !!(maxColour.find(colour => card.type.includes(colour))));
        if (targets.length > 0) {
          const target = deterministicPick(targets);
          softDiscard(target);
          return target.card.name;
        }
      }

      return '';
    });

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(bioPlague);

// World's End: Draw a card. Add its face value to your final score.
const deusExMachina: CatastopheCard = {
  name: 'DEUS EX MACHINA',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, position) => {
      if (!(inst.metadata.drawn_face_values instanceof Array)) {
        throw new Error('invalid data for metadata field drawn_face_values');
      }
      const faceValue = inst.metadata.drawn_face_values![position];
      if (typeof faceValue !== 'number') {
        throw new Error(
          `no drawn face value specified for Player ${position + 1}`
        );
      }
      const active = activeCards(playerCards);
      if (active.length > 0) {
        active[0].finalA += faceValue as number;
      }
    });
  },
  metadataRequired: [['drawn_face_values', 'card_per_person', 'global']]
};
addCard(deusExMachina);

// World's End: Discard your highest face value trait from your trait pile
const eyesOpenFromBehindTheStars: CatastopheCard = {
  name: 'EYES OPEN FROM BEHIND THE STARS',
  type: ['catastrophe'],
  pack: 'Mythlings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard = inst.metadata.discard instanceof Array
      ? inst.metadata.discard as string[]
      : [];

    const discardNames: string[] = allPlayerCards.map((playerCards, position) => {
      const active = activeCards(playerCards);
      if (active.length === 0) return '';

      // Check if previous selection is still valid
      const previousName = previousDiscard[position] as string | undefined;
      if (previousName) {
        const prev = active.find(c => c.card.name === previousName);
        if (prev) {
          softDiscard(prev);
          return prev.card.name;
        }
      }

      // Auto-compute: find highest face value card(s), then pick deterministically among ties
      const maxValue = Math.max(...active.map(c => c.finalA));
      const tied = active.filter(c => c.finalA === maxValue);
      const target = deterministicPick(tied);
      softDiscard(target);
      return target.card.name;
    });

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(eyesOpenFromBehindTheStars);

// World's End: Discard 1 blue trait from your trait pile at random
const glacialMeltdown: CatastopheCard = {
  name: 'GLACIAL MELTDOWN',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'blue');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(glacialMeltdown);

// World's End: -5 points to the player(s) with the most traits in their trait pile
const greyGoo: CatastopheCard = {
  name: 'GREY GOO',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const maxTraits = Math.max(...allPlayerCards.map(pc => activeCards(pc).length));
    allPlayerCards.forEach((playerCards) => {
      const active = activeCards(playerCards);
      if (active.length === maxTraits && active.length > 0) {
        active[0].finalA -= 5;
      }
    });
  }
};
addCard(greyGoo);

// World's End: -1 for every red trait in your trait pile
const iceAge: CatastopheCard = {
  name: 'ICE AGE',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('red')) {
          card.finalA -= 1;
        }
      });
    });
  }
};
addCard(iceAge);

// World's End: -1 for each trait with face value of 3 or more
const impactEvent: CatastopheCard = {
  name: 'IMPACT EVENT',
  type: ['catastrophe'],
  pack: 'Dinolings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      const active = activeCards(playerCards);
      const highValueCount = active.filter(c => c.finalA >= 3).length;
      if (active.length > 0) {
        active[0].finalA -= highValueCount;
      }
    });
  }
};
addCard(impactEvent);

// World's End: Discard 1 green trait from your trait pile at random
const massExtinction: CatastopheCard = {
  name: 'MASS EXTINCTION',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'green');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(massExtinction);

// World's End: Discard 1 red trait from your trait pile at random
const megaTsunami: CatastopheCard = {
  name: 'MEGA TSUNAMI',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'red');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(megaTsunami);

// World's End: Discard 1 colorless trait from your trait pile
const nuclearWinter: CatastopheCard = {
  name: 'NUCLEAR WINTER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'colourless');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(nuclearWinter);

// World's End: +4 points to the player(s) with the fewest traits in their trait pile
const overpopulation: CatastopheCard = {
  name: 'OVERPOPULATION',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const minTraits = Math.min(...allPlayerCards.map(pc => activeCards(pc).length));
    allPlayerCards.forEach((playerCards) => {
      const active = activeCards(playerCards);
      if (active.length === minTraits && active.length > 0) {
        active[0].finalA += 4;
      }
    });
  }
};
addCard(overpopulation);

// World's End: Discard 1 purple trait from your trait pile at random
const pulseEvent: CatastopheCard = {
  name: 'PULSE EVENT',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    colourDiscard(inst, allPlayerCards, 'purple');
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(pulseEvent);

// World's End: -1 for every green trait in your trait pile
const retrovirus: CatastopheCard = {
  name: 'RETROVIRUS',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('green')) {
          card.finalA -= 1;
        }
      });
    });
  }
};
addCard(retrovirus);

// World's End: -1 for every purple trait in your trait pile
const solarFlare: CatastopheCard = {
  name: 'SOLAR FLARE',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('purple')) {
          card.finalA -= 1;
        }
      });
    });
  }
};
addCard(solarFlare);

// World's End: -1 for every blue trait in your trait pile
const superVolcano: CatastopheCard = {
  name: 'SUPER VOLCANO',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('blue')) {
          card.finalA -= 1;
        }
      });
    });
  }
};
addCard(superVolcano);

// World's End: -2 to your score for each card over 7 in your trait pile
const theBigOne: CatastopheCard = {
  name: 'THE BIG ONE',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      const active = activeCards(playerCards);
      const excessCards = Math.max(0, active.length - 7);
      if (excessCards > 0 && active.length > 0) {
        active[0].finalA -= excessCards * 2;
      }
    });
  }
};
addCard(theBigOne);

// World's End: Discard 1 trait from your trait pile with face value of 3 or more
const theFourHorsemen: CatastopheCard = {
  name: 'THE FOUR HORSEMEN',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard = inst.metadata.discard instanceof Array
      ? inst.metadata.discard as string[]
      : [];

    const discardNames: string[] = allPlayerCards.map((playerCards, position) => {
      const active = activeCards(playerCards);
      const candidates = active.filter(c => c.finalA >= 3);
      if (candidates.length === 0) return '';

      // Check if previous selection is still valid
      const previousName = previousDiscard[position] as string | undefined;
      if (previousName) {
        const prev = candidates.find(c => c.card.name === previousName);
        if (prev) {
          softDiscard(prev);
          return prev.card.name;
        }
      }

      // Deterministically pick from candidates with face value >= 3
      const target = deterministicPick(candidates);
      softDiscard(target);
      return target.card.name;
    });

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(theFourHorsemen);
