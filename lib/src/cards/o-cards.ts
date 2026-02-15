import { addBasicCard, addCardThatPointsByColour } from '../cardContainer';

addBasicCard({ score: 4 }, { name: 'OPTIMISTIC NIHILISM', type: ['colourless'], pack: 'Classic' });
addBasicCard({ score: 1 }, { name: 'ORCISH TUSKS', type: ['green'], pack: 'Mythlings' });
addCardThatPointsByColour(
  { score: -1, colour: 'green', pointsPerCard: 1 },
  { name: 'OVERGROWTH', type: ['green'], pack: 'Classic' }
);
