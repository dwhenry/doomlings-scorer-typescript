interface MetadataModalHeaderProps {
  cardName: string;
}

export function MetadataModalHeader({ cardName }: MetadataModalHeaderProps) {
  return (
    <div className="modal-header">
      <img
        src={`/cards/${encodeURIComponent(cardName)}.small.png`}
        alt={cardName}
        className="modal-card-image"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <h3>{cardName}</h3>
    </div>
  );
}
