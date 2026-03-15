import { CatastropheCard, CardInstance, CardType } from '../types';
import { addCard } from '../cardContainer';
import { filterCardsByType, forEachPlayerCards } from './helpers';

// --- Helpers ---

/** Returns only non-discarded cards from a player's hand */
function activeCards(playerCards: CardInstance[]): CardInstance[] {
  return playerCards.filter((c) => !c.discarded);
}

/** Soft-delete a card: marks it as discarded (scorer zeros its score) */
function softDiscard(card: CardInstance, inst: CardInstance): void {
  card.discarded = inst;
  card.attachedCards.forEach((c) => {
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
      softDiscard(target, inst);
      return target.card.name;
    }
    return '';
  });

  inst.generatedMetadata.discard = discardNames;
}

// --- Catastrophe Cards ---

// All colorless traits are now worth 2 points
const aiTakeover: CatastropheCard = {
  name: 'AI TAKEOVER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const colourlessCardsByPlayer: Array<CardInstance[]> = allPlayerCards.map(
      (playerCards) => activeCards(playerCards).filter(
        (c: CardInstance) => c.type.includes('colourless')
      )
    )


    colourlessCardsByPlayer.forEach((colourlessCards, currentPlayer) => {
      colourlessCards.forEach((c: CardInstance) => {
        c.applyPoints(currentPlayer, 'A', 2, inst, 'overwrite card face value to 2');
        c.skipCalcB = true;
      });
    })
  }
};
addCard(aiTakeover);

// Remove a card from each player's hand (from the colour with highest count)
const bioPlague: CatastropheCard = {
  name: 'BIOENGINEERED PLAGUE',
  type: ['catastrophe'],
  pack: 'Techlings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = allPlayerCards.map(
      (playerCards, position) => {
        const active = activeCards(playerCards);
        if (active.length === 0) return '';

        // get the colour counts first to ensure removing a otehr cards in the same group
        // are not autoselected for discard
        const colourCounts = new Map<string, number>();
        active.forEach((c) => {
          c.type.forEach((t) => {
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
          const prev = active.find((c) => c.card.name === previousName);
          // if the colour of the previous selection is in the max colour list, use it,
          // other we need a new card to discard
          if (prev && !!maxColour.find((c) => prev.type.includes(c))) {
            softDiscard(prev, inst);
            return prev.card.name;
          }
        }

        if (maxColour.length > 0) {
          const targets = active.filter(
            (card) => !!maxColour.find((colour) => card.type.includes(colour) || !card.metadata.cannot_discard)
          );
          if (targets.length > 0) {
            const target = deterministicPick(targets);
            softDiscard(target, inst);
            return target.card.name;
          }
        }

        return '';
      }
    );

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(bioPlague);

// World's End: Draw a card. Add its face value to your final score.
const deusExMachina: CatastropheCard = {
  name: 'DEUS EX MACHINA',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, currentPlayer) => {
      const active = activeCards(playerCards);
      if ((inst.metadata.drawn_face_values instanceof Array)) {
        const faceValue = inst.metadata.drawn_face_values![currentPlayer];
        // TODO: add number[] as a valid type - we currently only support number or string[]
        const parsedValue = parseInt(faceValue);
        if (typeof parsedValue !== 'number') {
          throw new Error(
            `no drawn face value specified for Player ${currentPlayer + 1}`
          );
        }
        if (active.length > 0) {
          active[0].applyPoints(currentPlayer,
            'C',
            parsedValue as number,
            inst,
            'for drawing a trait with face value of ' + faceValue
          );
        }
      }
    });

    // TODO: would be nice if this allow selection by card name
  },
  metadataRequired: [['drawn_face_values', 'card_per_person', 'card']]
};
addCard(deusExMachina);

// World's End: Discard your highest face value trait from your trait pile
const eyesOpenFromBehindTheStars: CatastropheCard = {
  name: 'EYES OPEN FROM BEHIND THE STARS',
  type: ['catastrophe'],
  pack: 'Mythlings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = allPlayerCards.map(
      (playerCards, position) => {
        const active = activeCards(playerCards);
        if (active.length === 0) return '';

        // Auto-compute: find highest face value card(s), then pick deterministically among ties
        const maxValue = Math.max(...active.map((c) => c.finalA));

        // Check if previous selection is still valid
        const previousName = previousDiscard[position] as string | undefined;
        if (previousName) {
          const prev = active.find((c) => c.card.name === previousName);
          if (prev && prev.finalA === maxValue) {
            softDiscard(prev, inst);
            return prev.card.name;
          }
        }

        const tied = active.filter((c) => c.finalA === maxValue);
        const target = deterministicPick(tied);
        softDiscard(target, inst);
        return target.card.name;
      }
    );

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(eyesOpenFromBehindTheStars);

// World's End: Discard 1 blue trait from your trait pile at random
const glacialMeltdown: CatastropheCard = {
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
const greyGoo: CatastropheCard = {
  name: 'GREY GOO',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    let maxTraits = 0;
    let selectedCards: { inst: CardInstance, currentPlayer: number }[] = [];

    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      if (playerCards.length > maxTraits) {
        maxTraits = playerCards.length;
        selectedCards = [{ inst: playerCards[0], currentPlayer }];
      } else if (playerCards.length === maxTraits) {
        selectedCards.push({ inst: playerCards[0], currentPlayer });
      }
    });

    selectedCards.forEach(({ inst, currentPlayer }) => {
      inst.applyPoints(currentPlayer, 'C', -5, inst, 'for having the most traits');
    });
  }
};
addCard(greyGoo);

// World's End: -1 for every red trait in your trait pile
const iceAge: CatastropheCard = {
  name: 'ICE AGE',
  type: ['catastrophe'],
  pack: 'Classic',
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
const impactEvent: CatastropheCard = {
  name: 'IMPACT EVENT',
  type: ['catastrophe'],
  pack: 'Dinolings',
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
const massExtinction: CatastropheCard = {
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
const megaTsunami: CatastropheCard = {
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
const nuclearWinter: CatastropheCard = {
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
const overpopulation: CatastropheCard = {
  name: 'OVERPOPULATION',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    let minTraits = 0;
    let selectedCards: { inst: CardInstance, currentPlayer: number }[] = [];

    forEachPlayerCards(allPlayerCards, (playerCards, currentPlayer) => {
      if (playerCards.length < minTraits) {
        minTraits = playerCards.length;
        selectedCards = [{ inst: playerCards[0], currentPlayer }];
      } else if (playerCards.length === minTraits) {
        selectedCards.push({ inst: playerCards[0], currentPlayer });
      }
    });

    selectedCards.forEach(({ inst, currentPlayer }) => {
      inst.applyPoints(currentPlayer, 'C', 4, inst, 'for having the fewest traits');
    });
  }
};
addCard(overpopulation);

// World's End: Discard 1 purple trait from your trait pile at random
const pulseEvent: CatastropheCard = {
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
const retrovirus: CatastropheCard = {
  name: 'RETROVIRUS',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, currentPlayer) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('green')) {
          card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a green trait');
        }
      });
    });
  }
};
addCard(retrovirus);

// World's End: -1 for every purple trait in your trait pile
const solarFlare: CatastropheCard = {
  name: 'SOLAR FLARE',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, currentPlayer) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('purple')) {
          card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a purple trait');
        }
      });
    });
  }
};
addCard(solarFlare);

// World's End: -1 for every blue trait in your trait pile
const superVolcano: CatastropheCard = {
  name: 'SUPER VOLCANO',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, currentPlayer) => {
      activeCards(playerCards).forEach((card) => {
        if (card.type.includes('blue')) {
          card.applyPoints(currentPlayer, 'C', -1, inst, 'for being a blue trait');
        }
      });
    });
  }
};
addCard(superVolcano);

// World's End: -2 to your score for each card over 7 in your trait pile
const theBigOne: CatastropheCard = {
  name: 'THE BIG ONE',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, currentPlayer) => {
      const active = activeCards(playerCards);
      active
        .sort((a, b) => a.finalA - b.finalA)
        .splice(7, active.length - 7)
        .forEach((card) => {
          card.applyPoints(currentPlayer,
            'C',
            -2,
            inst,
            'for having more than 7 traits in your pile'
          );
        });
    });
  }
};
addCard(theBigOne);

// World's End: Discard 1 trait from your trait pile with face value of 3 or more
const theFourHorsemen: CatastropheCard = {
  name: 'THE FOUR HORSEMEN',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const previousDiscard =
      inst.metadata.discard instanceof Array
        ? (inst.metadata.discard as string[])
        : [];

    const discardNames: string[] = allPlayerCards.map(
      (playerCards, position) => {
        const active = activeCards(playerCards);
        const candidates = active.filter((c) => c.finalA >= 3);
        if (candidates.length === 0) return '';

        // Check if previous selection is still valid
        const previousName = previousDiscard[position] as string | undefined;
        if (previousName) {
          const prev = candidates.find((c) => c.card.name === previousName);
          if (prev) {
            softDiscard(prev, inst);
            return prev.card.name;
          }
        }

        // Deterministically pick from candidates with face value >= 3
        const target = deterministicPick(candidates);
        softDiscard(target, inst);
        return target.card.name;
      }
    );

    inst.generatedMetadata.discard = discardNames;
  },
  metadataRequired: [['discard', 'card_per_person', 'internal']]
};
addCard(theFourHorsemen);

// --- Kickstarter duplicate catastrophes (same as Classic, alternate art) ---

const KS_PACK = 'Classic (Kickstarter)' as const;

const aiTakeoverKs: CatastropheCard = {
  ...aiTakeover,
  name: 'AI TAKEOVER (kickstarter)',
  pack: KS_PACK
};
addCard(aiTakeoverKs);

const deusExMachinaKs: CatastropheCard = {
  ...deusExMachina,
  name: 'DEUS EX MACHINA (kickstarter)',
  pack: KS_PACK
};
addCard(deusExMachinaKs);

const glacialMeltdownKs: CatastropheCard = {
  ...glacialMeltdown,
  name: 'GLACIAL MELTDOWN (kickstarter)',
  pack: KS_PACK
};
addCard(glacialMeltdownKs);

const megaTsunamiKs: CatastropheCard = {
  ...megaTsunami,
  name: 'MEGA TSUNAMI (kickstarter)',
  pack: KS_PACK
};
addCard(megaTsunamiKs);

const nuclearWinterKs: CatastropheCard = {
  ...nuclearWinter,
  name: 'NUCLEAR WINTER (kickstarter)',
  pack: KS_PACK
};
addCard(nuclearWinterKs);
