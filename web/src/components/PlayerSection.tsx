import type { PlayerState, CardGroup, Card } from '../types';
import type { GameScore } from '@scorer/scorer';
import { getCardMetadataFields, isMetadataComplete, hasCardScopedMetadata } from '../utils/cardMetadata';
import PlayerCard from './PlayerCard';

interface PlayerSectionProps {
  players: PlayerState[];
  selectedPlayerId: number | null;
  onSelectPlayer: (id: number) => void;
  onRemoveCard: (playerId: number, cardIndex: number) => void;
  onOpenModal: (playerId: number, cardIndex: number, cardName: string) => void;
  onHover: (cardName: string | null) => void;
  onDropCard: (playerId: number, cardName: string) => void;
  gameScore: GameScore | null;
  cardsMap: Map<string, Card>;
}

function buildCardGroups(
  player: PlayerState,
  gameScore: GameScore | null,
  playerIndex: number
): CardGroup[] {
  const groups: Map<string, CardGroup> = new Map();
  const individualCards: CardGroup[] = [];

  player.cards.forEach((card, cardIndex) => {
    const fields = getCardMetadataFields(card.name);
    const hasMetadata = fields.length > 0;
    const metadataMissing = hasMetadata && !isMetadataComplete(card, fields);
    const isCardScoped = hasCardScopedMetadata(fields);

    let cardScore: { finalA: number; finalB: number | undefined; total: number | undefined } = { finalA: 0, finalB: 0, total: 0 };
    if (gameScore) {
      try {
        const ps = gameScore.getPlayerScore(playerIndex);
        const cs = ps.getCardScoreByIndex(cardIndex);
        cardScore = { finalA: cs.finalA, finalB: cs.finalB, total: cs.total };
      } catch {
        // card may not have a score yet
      }
    }

    // Card-scoped metadata cards are never grouped
    if (isCardScoped) {
      individualCards.push({
        name: card.name,
        count: 1,
        totalScore: gameScore && cardScore.total !== undefined ? cardScore.total : null,
        perCardScores: [cardScore],
        hasMetadata,
        metadataMissing,
        cardIndices: [cardIndex],
      });
      return;
    }

    const existing = groups.get(card.name);
    if (existing) {
      existing.count++;
      existing.perCardScores.push(cardScore);
      existing.cardIndices.push(cardIndex);
      if (cardScore.total !== undefined && existing.totalScore !== null) {
        existing.totalScore = existing.totalScore + cardScore.total;
      } else {
        existing.totalScore = null;
      }
      // If any instance is missing metadata, mark the group
      if (metadataMissing) existing.metadataMissing = true;
    } else {
      groups.set(card.name, {
        name: card.name,
        count: 1,
        totalScore: gameScore && cardScore.total !== undefined ? cardScore.total : null,
        perCardScores: [cardScore],
        hasMetadata,
        metadataMissing,
        cardIndices: [cardIndex],
      });
    }
  });

  return [...Array.from(groups.values()), ...individualCards];
}

export default function PlayerSection({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onRemoveCard,
  onOpenModal,
  onHover,
  onDropCard,
  gameScore,
  cardsMap,
}: PlayerSectionProps) {
  return (
    <section className="players-section">
      {players.map((player, index) => {
        const cardGroups = buildCardGroups(player, gameScore, index);
        const totalScore = gameScore
          ? gameScore.getPlayerScore(index).total
          : 0;

        return (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={selectedPlayerId === player.id}
            onSelect={onSelectPlayer}
            onRemoveCard={onRemoveCard}
            onOpenModal={onOpenModal}
            onHover={onHover}
            cardGroups={cardGroups}
            totalScore={totalScore}
            onDrop={onDropCard}
          />
        );
      })}
    </section>
  );
}
