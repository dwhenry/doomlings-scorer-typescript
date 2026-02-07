import type { PlayerState, CardGroup } from '../types';
import type { GameScore } from '@scorer/scorer';
import PlayerCard from './PlayerCard';

interface PlayerSectionProps {
  players: PlayerState[];
  selectedPlayerId: number | null;
  onSelectPlayer: (id: number) => void;
  onRemoveCard: (playerId: number, cardName: string) => void;
  onHover: (cardName: string | null) => void;
  onDropCard: (playerId: number, cardName: string) => void;
  gameScore: GameScore | null;
}

function buildCardGroups(
  player: PlayerState,
  gameScore: GameScore | null,
  playerIndex: number
): CardGroup[] {
  const groups: Map<string, CardGroup> = new Map();

  player.cards.forEach((card, cardIndex) => {
    const existing = groups.get(card.name);
    let cardScore = { finalA: 0, finalB: 0, total: 0 };

    if (gameScore) {
      try {
        const ps = gameScore.getPlayerScore(playerIndex);
        const cs = ps.getCardScoreByIndex(cardIndex);
        cardScore = { finalA: cs.finalA, finalB: cs.finalB ?? 0, total: cs.total };
      } catch {
        // card may not have a score yet
      }
    }

    if (existing) {
      existing.count++;
      existing.perCardScores.push(cardScore);
      existing.totalScore =
        existing.totalScore !== null
          ? existing.totalScore + cardScore.total
          : cardScore.total;
    } else {
      groups.set(card.name, {
        name: card.name,
        count: 1,
        totalScore: gameScore ? cardScore.total : null,
        perCardScores: [cardScore],
      });
    }
  });

  return Array.from(groups.values());
}

export default function PlayerSection({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onRemoveCard,
  onHover,
  onDropCard,
  gameScore,
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
