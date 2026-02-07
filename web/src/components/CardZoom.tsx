interface CardZoomProps {
  cardName: string | null;
}

export default function CardZoom({ cardName }: CardZoomProps) {
  if (!cardName) return null;

  return (
    <div className="card-zoom active">
      <img
        src={`/cards/${encodeURIComponent(cardName)}.png`}
        alt={cardName}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="card-zoom-name">{cardName}</div>
    </div>
  );
}
