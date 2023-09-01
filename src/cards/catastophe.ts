import { Card, CardInstance, addCard } from "../cardContainer"

const aiTakeover: Card = {
  name: 'AI TAKEOVER',
  type: 'catastrophe',
  pointsA: 0,
  calcC: (playersCards: Array<Array<CardInstance>>) => {
    let colourlessCards: Array<CardInstance> = playersCards
      .reduce((allCards, playerCards) => {
        const clessCards: Array<CardInstance> = playerCards.filter((inst: CardInstance) => inst.card.type == "colourless")
        return [...clessCards, ...allCards]
      }, [])

    colourlessCards.forEach((inst: CardInstance) => {
      inst.finalA = 2
      inst.finalB = 0
    })
  }
};

addCard(aiTakeover)