import type { PlayerState, CardGroup, Card } from '../types';
import type { GameScore } from '@scorer/scorer';
import { getCardMetadataFields, isMetadataComplete, hasCardScopedMetadata } from '../utils/cardMetadata';
import { useMediaQuery } from '../hooks/useMediaQuery';
import PlayerCard from './PlayerCard';

interface PlayerSectionProps {
  players: PlayerState[];
  selectedPlayerId: number | null;
  mobileAddingForPlayer: number | null;
  onSelectPlayer: (id: number) => void;
  onStartAdding: (playerId: number) => void;
  onStopAdding: () => void;
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
  mobileAddingForPlayer,
  onSelectPlayer,
  onStartAdding,
  onStopAdding,
  onRemoveCard,
  onOpenModal,
  onHover,
  onDropCard,
  gameScore,
  cardsMap,
}: PlayerSectionProps) {
  const isMobile = !useMediaQuery('(min-width: 768px)');

  // Mobile focused view: only show the player we're adding cards for
  if (isMobile && mobileAddingForPlayer !== null) {
    const playerIndex = players.findIndex((p) => p.id === mobileAddingForPlayer);
    const player = players[playerIndex];
    if (!player) return null;
    const cardGroups = buildCardGroups(player, gameScore, playerIndex);
    const totalScore = gameScore ? gameScore.getPlayerScore(playerIndex).total : 0;

    return (
      <section className="players-section players-section--focused">
        <div className="focused-player-header">
          <button className="focused-player-done" onClick={onStopAdding}>
            Done
          </button>
          <span className="focused-player-name">{player.name}</span>
          <span className="focused-player-score">{totalScore} pts</span>
        </div>
        <div className="focused-player-hand">
          {cardGroups.map((group) => (
            <div
              key={`${group.name}-${group.cardIndices[0]}`}
              className={`card player-card${group.metadataMissing ? ' metadata-missing' : ''}`}
              onMouseEnter={() => onHover(group.name)}
              onMouseLeave={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (group.hasMetadata) {
                  onOpenModal(player.id, group.cardIndices[0], group.name);
                }
              }}
            >
              <img
                src={`/cards/${encodeURIComponent(group.name)}.png`}
                alt={group.name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {group.count > 1 && <div className="card-count">{group.count}</div>}
              {group.totalScore !== null ? (
                <div className="card-score">{group.totalScore} pts</div>
              ) : group.metadataMissing ? (
                <div className="card-score card-score--missing">-</div>
              ) : null}
              <button
                className="remove-card remove-card--visible"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(player.id, group.cardIndices[0]);
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }

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
            onSelect={isMobile ? onStartAdding : onSelectPlayer}
            onRemoveCard={onRemoveCard}
            onOpenModal={onOpenModal}
            onHover={onHover}
            cardGroups={cardGroups}
            totalScore={totalScore}
            onDrop={onDropCard}
            showAddButton={isMobile}
            onStartAdding={onStartAdding}
          />
        );
      })}
    </section>
  );
}
