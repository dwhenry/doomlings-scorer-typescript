
const effectLessCards: string[] =  [
  "ACROBATIC", "ADORABLE", "ANTLERS", "APPEALING", "BARK", "BIG EARS", "BLOOM", "BLUBBER",
  "BONE REINFORCEMENT", "BULLHEADED", "CERATOPSIAN HORNS", "CONFUSION", "CURIOSITY", "DEEP ROOTS",
  "DESTINED", "DIAPHANOUS WINGS", "FANGS", "FEAR", "FINE MOTOR SKILLS", "FIRE SKIN", "FLATULENCE",
  "GILLS", "HAND-WING", "ICY", "LEAVES", "MIGRATORY", "MITOSIS", "NOCTURNAL", "QUICK", "SAUDADE",
  "SPINY", "STONE SKIN", "TALONS", "WOODY STEMS"
]

export function hasEffect(cardName: string): boolean {
  const index = effectLessCards.indexOf(cardName)
  return index === -1
}