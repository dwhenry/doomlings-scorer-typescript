import { Card, CardInstance, addCard } from "../cardContainer"

const aiTakeover: Card = {
  name: 'AI TAKEOVER',
  colour: 'catastophe',
  pointsA: 0,
  pointsC: (playerCards: Array<CardInstance>, oponentCards: Array<Array<CardInstance>>) => {
    let colourlessCards = playerCards
      .filter((inst: CardInstance) => inst.card.colour == "colourless")

    let pointsAAjust = colourlessCards
      .reduce((sum, inst: CardInstance) => sum + 2 - inst.card.pointsA, 0);

    let traitEffectsPoints = playerCards
      .reduce((sum, inst: CardInstance) => sum + inst.traitPoints, 0)

    return pointsAAjust - traitEffectsPoints;
  }
};

addCard(aiTakeover)