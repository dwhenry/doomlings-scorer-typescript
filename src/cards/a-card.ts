import { Card, CardInstance, addCard } from "../cardContainer"

const acrobatic: Card = {
  name: 'ACROBATIC',
  type: 'multi-colour',
  calcA: (inst: CardInstance): void => { inst.finalA = 2 },
};

addCard(acrobatic)

const adorable: Card = {
  name: 'ADORABLE',
  type: 'purple',
  calcA: (inst: CardInstance): void => { inst.finalA = 4 },
};

addCard(adorable)

const altruistic: Card = {
  name: 'ALTRUISTIC',
  type: 'colourless',
  calcA: (inst: CardInstance): void => {
    if(typeof inst.metadata.gene_pool_size !== 'number') {
      throw new Error('invalid data for metadata field gene_pool_size')
    }
    inst.finalA = inst.metadata.gene_pool_size
  },
  metadataRequired: [
    ['gene_pool_size', 'number']
  ]
};

addCard(altruistic)
