import { CatastopheCard, CardInstance } from '../types';
import { addCard } from '../cardContainer';

// All colorless traits are now worth 2 points
const aiTakeover: CatastopheCard = {
  name: 'AI TAKEOVER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const colourlessCards: Array<CardInstance> = allPlayerCards.reduce(
      (allCards, playerCards) => {
        const clessCards: Array<CardInstance> = playerCards.filter(
          (inst: CardInstance) => inst.type.includes('colourless')
        );
        return [...clessCards, ...allCards];
      },
      []
    );

    colourlessCards.forEach((inst: CardInstance) => {
      inst.finalA = 2;
      inst.finalB = 0;
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
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];

        if (cardName === undefined) {
          throw new Error(
            `no card selected to discard for Player ${position + 1}`
          );
        }
        let removed: boolean = false;
        playerCards.forEach((inst: CardInstance, index: number) => {
          if (!removed && inst.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });

        if (!removed) {
          throw new Error(
            `could not find card to discard: ${cardName} for Player ${position + 1
            }`
          );
        }
      } else {
        throw new Error('discard is not an array');
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
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
      if (playerCards.length > 0) {
        playerCards[0].finalA += faceValue as number;
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
    allPlayerCards.forEach((playerCards) => {
      if (playerCards.length === 0) return;
      // Find the card with highest face value
      let highestIndex = 0;
      let highestValue = playerCards[0].finalA;
      playerCards.forEach((card, index) => {
        if (card.finalA > highestValue) {
          highestValue = card.finalA;
          highestIndex = index;
        }
      });
      playerCards.splice(highestIndex, 1);
    });
  }
};
addCard(eyesOpenFromBehindTheStars);

// World's End: Discard 1 blue trait from your trait pile at random
const glacialMeltdown: CatastopheCard = {
  name: 'GLACIAL MELTDOWN',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return; // Player may not have a blue trait
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(glacialMeltdown);

// World's End: -5 points to the player(s) with the most traits in their trait pile
const greyGoo: CatastopheCard = {
  name: 'GREY GOO',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const maxTraits = Math.max(...allPlayerCards.map(pc => pc.length));
    allPlayerCards.forEach((playerCards) => {
      if (playerCards.length === maxTraits && playerCards.length > 0) {
        playerCards[0].finalA -= 5;
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
      playerCards.forEach((card) => {
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
      const highValueCount = playerCards.filter(c => c.finalA >= 3).length;
      if (playerCards.length > 0) {
        playerCards[0].finalA -= highValueCount;
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
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return;
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(massExtinction);

// World's End: Discard 1 red trait from your trait pile at random
const megaTsunami: CatastopheCard = {
  name: 'MEGA TSUNAMI',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return;
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(megaTsunami);

// World's End: Discard 1 colorless trait from your trait pile
const nuclearWinter: CatastopheCard = {
  name: 'NUCLEAR WINTER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return;
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(nuclearWinter);

// World's End: +4 points to the player(s) with the fewest traits in their trait pile
const overpopulation: CatastopheCard = {
  name: 'OVERPOPULATION',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const minTraits = Math.min(...allPlayerCards.map(pc => pc.length));
    allPlayerCards.forEach((playerCards) => {
      if (playerCards.length === minTraits && playerCards.length > 0) {
        playerCards[0].finalA += 4;
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
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return;
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(pulseEvent);

// World's End: -1 for every green trait in your trait pile
const retrovirus: CatastopheCard = {
  name: 'RETROVIRUS',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    allPlayerCards.forEach((playerCards) => {
      playerCards.forEach((card) => {
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
      playerCards.forEach((card) => {
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
      playerCards.forEach((card) => {
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
      const excessCards = Math.max(0, playerCards.length - 7);
      if (excessCards > 0 && playerCards.length > 0) {
        playerCards[0].finalA -= excessCards * 2;
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
    allPlayerCards.forEach((playerCards, position) => {
      if (inst.metadata.discard instanceof Array) {
        const cardName: string = inst.metadata.discard[position];
        if (cardName === undefined) return;
        let removed = false;
        playerCards.forEach((card, index) => {
          if (!removed && card.card.name === cardName) {
            removed = true;
            playerCards.splice(index, 1);
          }
        });
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person', 'global']]
};
addCard(theFourHorsemen);
