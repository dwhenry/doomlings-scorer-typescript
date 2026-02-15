import { CardInstance, PointsLog } from "./types"

export const groupByCardByFromCard = (logs: Array<PointsLog & {
  affectedPlayer: number,
  affectedCard: CardInstance,
}>) => {
  const response: {
    inst: CardInstance,
    logs: Array<PointsLog & { affectedPlayer: number; affectedCard: CardInstance }>
  }[] = []

  logs.forEach((log) => {
    const fromCard = log.fromCard
    const existing = response.find((r) => r.inst === fromCard)
    if (existing) {
      existing.logs.push(log)
    } else {
      response.push({ inst: fromCard, logs: [log] })
    }
  })

  return response
}