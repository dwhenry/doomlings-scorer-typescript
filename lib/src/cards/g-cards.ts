import { addBasicCard, addCard } from '../cardContainer';
import { CardInstance, CardType, PlayerCard } from '../types';
import { playerCards } from './helpers';

addBasicCard('GELATINOUS', 'red', 'Mythlings', 1);
addBasicCard('GILLS', 'blue', 'Classic', 1);

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
    const playerCardsMatchingTrait = playerCards(allPlayerCards, currentPlayer).filter((a) =>
      a.card.type.find((type) => chosenTraits.includes(type))
    );
    inst.finalB = playerCardsMatchingTrait.length;
  },
  // TODO: Change me to use a better mechanism !!!! - allow selection of existing card by name
  metadataRequired: [['attached_trait', 'trait', 'card']]

  // TODO: rescore any cards that rely on attached cards
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
    const uniquePlayerTraits = new Set(
      playerCards(allPlayerCards, currentPlayer)
        .flatMap((a) => a.card.type)
        .filter((c) => c !== 'colourless' && c !== 'catastrophe')
    );
    inst.applyPoints('B', uniquePlayerTraits.size, inst, 'number of unique player traits');
  }
};
addCard(gratitude);

addBasicCard('GREY HAT', 'colourless', 'Techlings', -1);
