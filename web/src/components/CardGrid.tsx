import type { Card } from '../types';
import { useLongPressPreview } from '../hooks/useLongPressPreview';

interface CardGridProps {
  cards: Card[];
  onClickCard: (cardName: string) => void;
  onHover?: (cardName: string | null) => void;
  onLongPressPreview?: (cardName: string) => void;
}

function GridCard({
  card,
  onClickCard,
  onHover,
  onLongPressPreview
}: {
  card: Card;
  onClickCard: (cardName: string) => void;
  onHover?: (cardName: string | null) => void;
  onLongPressPreview?: (cardName: string) => void;
}) {
  const { touchProps, wrapClick } = useLongPressPreview(
    onLongPressPreview ? () => onLongPressPreview(card.name) : undefined
  );

  return (
    <div
      className="card pack-card pack-card--labeled"
      data-pack-card-name={card.name}
      {...touchProps}
      onClick={wrapClick(() => onClickCard(card.name))}
      onMouseEnter={onHover ? () => onHover(card.name) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      onContextMenu={(e) => {
        if (onLongPressPreview) e.preventDefault();
      }}
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
  );
}

export default function CardGrid({
  cards,
  onClickCard,
  onHover,
  onLongPressPreview
}: CardGridProps) {
  if (cards.length === 0) {
    return <div className="card-grid-empty">No cards found</div>;
  }

  return (
    <div className="cards-grid cards-grid--tabbed">
      {cards.map((card) => (
        <GridCard
          key={card.name}
          card={card}
          onClickCard={onClickCard}
          onHover={onHover}
          onLongPressPreview={onLongPressPreview}
        />
      ))}
    </div>
  );
}
