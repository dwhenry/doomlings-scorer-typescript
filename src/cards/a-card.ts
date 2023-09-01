import { Card, CardInstance, addCard } from "../cardContainer"

const acrobatic: Card = {
  name: 'ACROBATIC',
  type: 'multi-colour',
  pointsA: 2,
};

addCard(acrobatic)

const adorable: Card = {
  name: 'ADORABLE',
  type: 'purple',
  pointsA: 4,
};

addCard(adorable)

const altruistic: Card = {
  name: 'ALTRUISTIC',
  type: 'colourless',
  pointsA: (inst: CardInstance): number => {
    const regexp = new RegExp('^\\d+$')
    if(regexp.test(inst.metadata['gene_pool_size'])) {
      return +inst.metadata['gene_pool_size']
    } else {
      throw new Error(`invalid data for metadata field gene_pool_size`)
    }
  },
  metadataRequired: [
    ['gene_pool_size', 'number']
  ]
};

addCard(altruistic)
