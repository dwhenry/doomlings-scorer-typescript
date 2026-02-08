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
    const chosenCardName = inst.metadata['attached_card_name'] as string;

    const chosenCard = playerCards(allPlayerCards, currentPlayer)
      .find((c) => chosenCardName === c.card.name);

    if (!chosenCard) {
      inst.applyPoints('B', undefined, inst, `chosen card ${chosenCardName} not found`);
      inst.generatedMetadata.attached_card_name = '';
      return;
    }

    playerCards(allPlayerCards, currentPlayer).forEach((cardInst) => {
      if (!!cardInst.card.type.find((type) => chosenCard?.card.type.includes(type))) {
        cardInst.applyPoints('B', 1, inst, `for being a same trait as ${chosenCard?.card.name}`);
      }
    })
  },
  // TODO: Change me to use a better mechanism !!!! - allow selection of existing card by name
  metadataRequired: [['attached_card_name', 'player_card', 'card']]

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
    inst.applyPoints(
      'B',
      uniquePlayerTraits.size,
      inst,
      'number of unique player traits'
    );
  }
};
addCard(gratitude);

addBasicCard('GREY HAT', 'colourless', 'Techlings', -1);
