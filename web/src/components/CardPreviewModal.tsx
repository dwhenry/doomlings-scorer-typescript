import { useEffect } from 'react';

interface CardPreviewModalProps {
  cardName: string;
  onClose: () => void;
}

/**
 * Full-screen card preview for narrow / touch layouts.
 * Close: X button, backdrop tap, or Escape.
 */
export default function CardPreviewModal({
  cardName,
  onClose
}: CardPreviewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="card-preview-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${cardName}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="card-preview-modal-close"
        aria-label="Close preview"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        &times;
      </button>
      <div
        className="card-preview-modal-body"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="card-preview-modal-img"
          src={`/cards/${encodeURIComponent(cardName)}.png`}
          alt={cardName}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <p className="card-preview-modal-caption">{cardName}</p>
        <p className="card-preview-modal-hint">
          Long-press a card in the pack to preview. Tap outside or use the
          close button to dismiss.
        </p>
      </div>
    </div>
  );
}
