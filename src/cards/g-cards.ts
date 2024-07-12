import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, CardType, PlayerCard } from "../types";

addBasicCard('GALACTIC DRIFT', 'colourless', 'Classic', 0);
addBasicCard('GELATINOUS', 'red', 'Mythlings', 1);
addBasicCard('GILLS', 'blue', 'Classic', 1);
addBasicCard('GLACIAL DRIFT', 'blue', 'Classic', 0);

const gmo: PlayerCard = {
  name: 'GMO',
  type: ['colourless'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const chosenTraits = inst.metadata['attached_trait']! as CardType[];
    const playerCardsMatchingTrait = allPlayerCards[currentPlayer].filter(a => a.card.type.find(type => chosenTraits.includes(type)))
    inst.finalB = playerCardsMatchingTrait.length
  },
  // TODO: Change me to use a better mechanism
  metadataRequired: ['attached_trait', 'trait']
};
addCard(gmo);


const gratitude: PlayerCard = {
  name: 'GRATITUDE',
  type: ['colourless'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const currentPlayerCards = allPlayerCards[currentPlayer];
    const uniquePlayerTraits = new Set(currentPlayerCards.map(a => a.card.type).flat().filter(c => c !== 'colourless' && c !== 'catastrophe'))
    inst.finalB = uniquePlayerTraits.size
  }
};
addCard(gratitude);

addBasicCard('GREY HAT', 'colourless', 'Techlings', -1);
