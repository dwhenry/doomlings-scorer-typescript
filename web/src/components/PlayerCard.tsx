import type { PlayerState, CardGroup } from '../types';

interface PlayerCardProps {
  player: PlayerState;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onRemoveCard: (playerId: number, cardIndex: number) => void;
  onOpenModal: (playerId: number, cardIndex: number, cardName: string) => void;
  onHover: (cardName: string | null) => void;
  cardGroups: CardGroup[];
  totalScore: number;
  onDrop: (playerId: number, cardName: string) => void;
  showAddButton?: boolean;
  onStartAdding?: (playerId: number) => void;
}

export default function PlayerCard({
  player,
  isSelected,
  onSelect,
  onRemoveCard,
  onOpenModal,
  onHover,
  cardGroups,
  totalScore,
  onDrop,
  showAddButton,
  onStartAdding,
}: PlayerCardProps) {
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  }

  function handleDragLeave(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
    const cardName = e.dataTransfer.getData('cardName');
    if (cardName) {
      onDrop(player.id, cardName);
    }
  }

  return (
    <div
      className={`player${isSelected ? ' selected' : ''}`}
      data-player-id={player.id}
      onClick={() => onSelect(player.id)}
    >
      <div className="player-header">
        <h3>{player.name}</h3>
        <div className="player-score">
          <span className="total-score">{totalScore}</span> points
        </div>
      </div>
      <div
        className="player-hand"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {cardGroups.length === 0 ? (
          <div className="drop-zone">Drop cards here or click to select player</div>
        ) : (
          cardGroups.map((group) => (
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
          ))
        )}
      </div>
      {showAddButton && onStartAdding && (
        <button
          className="add-cards-btn"
          onClick={(e) => {
            e.stopPropagation();
            onStartAdding(player.id);
          }}
        >
          + Add cards
        </button>
      )}
    </div>
  );
}
