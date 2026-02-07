const effectLessCards: string[] = [
  'ACROBATIC',
  'ADORABLE',
  'ANTLERS',
  'APPEALING',
  'BARK',
  'BIG EARS',
  'BLOOM',
  'BLUBBER',
  'BONE REINFORCEMENT',
  'BULLHEADED',
  'CERATOPSIAN HORNS',
  'CONFUSION',
  'CURIOSITY',
  'DEEP ROOTS',
  'DESTINED',
  'DIAPHANOUS WINGS',
  'FANGS',
  'FEAR',
  'FINE MOTOR SKILLS',
  'FIRE SKIN',
  'FLATULENCE',
  'GILLS',
  'HAND-WING',
  'ICY',
  'LEAVES',
  'MIGRATORY',
  'MITOSIS',
  'NOCTURNAL',
  'QUICK',
  'SAUDADE',
  'SPINY',
  'STONE SKIN',
  'TALONS',
  'WOODY STEMS'
];

export function hasEffect(cardName: string): boolean {
  const index = effectLessCards.indexOf(cardName);
  return index === -1;
}

export function isEffectless(cardName: string): boolean {
  return effectLessCards.indexOf(cardName) !== -1;
}

const dominantCards: string[] = [
  'APEX PREDATOR',
  'CAMOUFLAGE',
  'CARNOSAUR JAW',
  'DENIAL',
  'ECHOLOCATION',
  'FAITH',
  'HEROIC',
  'HYPER-INTELLIGENCE',
  'IMMUNITY',
  'LEGENDARY',
  'MOTLEY',
  'OPTIMISTIC NIHILISM',
  'PACK BEHAVIOR',
  'RUGGEDIZED',
  'SENTIENCE',
  'SYMBIOSIS',
  'TINY',
  'VAMPIRISM',
  'VIRAL'
];

export function isDominant(cardName: string): boolean {
  return dominantCards.indexOf(cardName) !== -1;
}

const actionCards: string[] = [
  'ANCIENT',
  'AUTOMIMICRY',
  'BAD',
  'BEAUTY',
  'BINARY',
  'BONES',
  'BONY PLATES',
  'BOREDOM',
  'BRAVE',
  'CLEVER',
  'COLD BLOOD',
  'COSTLY SIGNALING',
  'DERMAL ARMOR',
  'DIRECTLY REGISTER',
  'DOTING',
  'EGG PREDATION',
  'ELECTROMAGNETIC',
  'ELONGATED NECK',
  'FLIGHT',
  'GELATINOUS',
  'GREY HAT',
  'HOT TEMPER',
  'IMPATIENCE',
  'INTROSPECTIVE',
  'INVENTIVE',
  'IRIDESCENT SCALES',
  'JUICY',
  'MECHA',
  'MEMORY',
  'MIGHTY',
  'NEURAL LINK',
  'NOSY',
  'ORCISH TUSKS',
  'PAINTED SHELL',
  'PERSUASIVE',
  'PHOTOSYNTHESIS',
  'PHREAKISH EYES',
  'POISONOUS',
  'PRIDE',
  'PROPAGATION',
  'PROTOFEATHERS',
  'PTEROSAUR WINGS',
  'PYCNOFIBERS',
  'RECKLESS',
  'SCUTES',
  'SELECTIVE MEMORY',
  'SELF-REPLICATING',
  'SELFISH',
  'SWEAT',
  'TELEKINETIC',
  'TENTACLES',
  'TERRITORIAL',
  'THAGOMIZER',
  'THE THIRD EYE',
  'TINY LITTLE MELONS',
  'TRUNK',
  'TUBE FEET',
  'VENOMOUS',
  'VORACIOUS'
];

export function hasAction(cardName: string): boolean {
  return actionCards.indexOf(cardName) !== -1;
}
