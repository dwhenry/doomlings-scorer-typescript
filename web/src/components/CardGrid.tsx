import type { Card } from '../types';

interface CardGridProps {
  cards: Card[];
  selectedPlayerId: number | null;
  onClickCard: (cardName: string) => void;
  onHover: (cardName: string | null) => void;
  onDragStart: (e: React.DragEvent, cardName: string) => void;
}

export default function CardGrid({
  cards,
  selectedPlayerId,
  onClickCard,
  onHover,
  onDragStart,
}: CardGridProps) {
  if (cards.length === 0) {
    return <div className="card-grid-empty">No cards found</div>;
  }

  return (
    <div className="cards-grid cards-grid--tabbed">
      {cards.map((card) => (
        <div
          key={card.name}
          className="card pack-card pack-card--labeled"
          draggable={selectedPlayerId === null ? true : undefined}
          onDragStart={
            selectedPlayerId === null
              ? (e) => onDragStart(e, card.name)
              : undefined
          }
          onClick={() => onClickCard(card.name)}
          onMouseEnter={() => onHover(card.name)}
          onMouseLeave={() => onHover(null)}
        >
          <img
            src={`/cards/${encodeURIComponent(card.name)}.png`}
            alt={card.name}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="pack-card-name">{card.name}</span>
        </div>
      ))}
    </div>
  );
}
