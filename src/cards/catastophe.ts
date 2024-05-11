import { CatastopheCard, CardInstance } from '../types';
import { addCard } from '../cardContainer';

const aiTakeover: CatastopheCard = {
  name: 'AI TAKEOVER',
  type: ['catastrophe'],
  pack: 'Classic',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
    const colourlessCards: Array<CardInstance> = allPlayerCards.reduce(
      (allCards, playerCards) => {
        const clessCards: Array<CardInstance> = playerCards.filter(
          (inst: CardInstance) => inst.card.type.includes('colourless')
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

const bio_plague: CatastopheCard = {
  name: 'BIOENGINEERED PLAGUE',
  type: ['catastrophe'],
  pack: 'Techlings',
  calcC: (inst: CardInstance, allPlayerCards: Array<Array<CardInstance>>) => {
  // remove a card (set score to 0) from each players hand
    // TODO: the card must come from the colour with the highest count - this logic is not implemented
    allPlayerCards.forEach((playerCards, position) => {
      if(inst.metadata.discard instanceof Array) {
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
            `could not find card to discard: ${cardName} for Player ${
              position + 1
            }`
          );
        }
      } else {
        throw new Error('discard is not an array')
      }
    });
  },
  metadataRequired: [['discard', 'card_per_person']]
};
addCard(bio_plague);

// TODO
// addBasicCard('EYES OPEN FROM BEHIND THE STARS', 'purple', 'Mythlings', );

// TODO
// addBasicCard('DENIAL', 'colourless', 'Classic', 4);

// TODO
// addBasicCard('DEUS EX MACHINA', 'green', 'Classic', );

// TODO
// addBasicCard('GLACIAL MELTDOWN', 'blue', 'Classic', );

// TODO 
// addBasicCard('GREY GOO', 'colourless', 'Classic', );