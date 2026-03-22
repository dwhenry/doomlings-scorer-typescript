interface CardZoomProps {
  cardName: string | null;
}

export default function CardZoom({ cardName }: CardZoomProps) {
  return (
    <aside
      className={`card-zoom-dock${cardName ? ' card-zoom-dock--has-card' : ''}`}
      aria-label="Card preview"
    >
      {cardName ? (
        <>
          <img
            className="card-zoom-dock__img"
            src={`/cards/${encodeURIComponent(cardName)}.png`}
            alt={cardName}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="card-zoom-dock__name">{cardName}</div>
        </>
      ) : (
        <p className="card-zoom-dock__placeholder">
          Hover a card for a larger preview
        </p>
      )}
    </aside>
  );
}
