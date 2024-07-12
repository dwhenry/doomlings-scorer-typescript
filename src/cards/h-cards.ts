import { addBasicCard, addCard } from "../cardContainer";
import { CardInstance, CardType, PlayerCard } from "../types";

addBasicCard('HAND-WING', ['red', 'purple'], 'multi-colour', 1);
const heat_vision: PlayerCard = {
  name: 'HEAT VISION',
  type: ['red'],
  pack: 'Classic',
  calcA: (inst: CardInstance): void => {
    inst.finalA = -1;
  },
  calcB: (
    inst: CardInstance,
    allPlayerCards: Array<Array<CardInstance>>,
    currentPlayer: number
  ): void => {
    const redCards = allPlayerCards[currentPlayer].filter(a => a.card.type.find(type => 'red'))
    inst.finalB = redCards.length
  }
};
addCard(heat_vision);

addBasicCard('HEROIC', 'green', 'Classic', 7);
addBasicCard('HIGH TIDES', 'blue', 'Classic', 0);
addBasicCard('HOT TEMPER', 'red', 'Classic', 2);
addBasicCard('HYPER-INTELLIGENCE', 'red', 'Classic', 4);
const hyperMyelination: PlayerCard = {
  name: 'HYPER-MYELINATION',
  type: ['purple'],
  pack: 'Techlings',
  calcA: (inst: CardInstance): void => {
    inst.finalA = 0;
  },
  calcB: (inst: CardInstance): void => {
    if (typeof inst.metadata.biggest_gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size');
    }
    inst.finalB = inst.metadata.biggest_gene_pool_size;
  },
  metadataRequired: ['biggest_gene_pool_size']
};
addCard(hyperMyelination);
