import type { Card, CardType } from '../types';
import { TRAIT_CARD_TYPES } from '@scorer/types';

interface PackDisplayProps {
  cards: Map<string, Card>;
  selectedPacks: string[];
  selectedPlayerId: number | null;
  onClickCard: (cardName: string) => void;
  onHover: (cardName: string | null) => void;
  selectedCatastrophes: string[];
  onToggleCatastrophe: (cardName: string) => void;
}

export default function PackDisplay({
  cards,
  selectedPacks,
  selectedPlayerId,
  onClickCard,
  onHover,
  selectedCatastrophes,
  onToggleCatastrophe,
}: PackDisplayProps) {
  // Group cards by their first trait color
  const colorGroups = new Map<CardType, Card[]>();
  const catastropheCards: Card[] = [];

  for (const card of cards.values()) {
    if (card.type.includes('catastrophe')) {
      catastropheCards.push(card);
      continue;
    }
    if (card.type.includes('none')) continue;

    // Use first trait type for grouping
    const color = (TRAIT_CARD_TYPES as readonly string[]).find((t) =>
      card.type.includes(t as CardType)
    ) as CardType | undefined;

    if (color) {
      const group = colorGroups.get(color) || [];
      group.push(card);
      colorGroups.set(color, group);
    }
  }

  function handleDragStart(e: React.DragEvent, cardName: string) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('cardName', cardName);
  }

  function isVisible(card: Card): boolean {
    if (selectedPacks.length === 0) return true;
    return selectedPacks.includes(card.pack);
  }

  return (
    <section className={`pack-display${selectedPlayerId !== null ? ' player-selected' : ''}`}>
      <CatastropheInline
        catastropheCards={catastropheCards}
        selectedCatastrophes={selectedCatastrophes}
        onToggle={onToggleCatastrophe}
        onHover={onHover}
      />

      <h2>Card Pack</h2>

      {selectedPlayerId !== null && (
        <div className="player-selection-hint">
          Click on cards below to add them to Player {selectedPlayerId + 1}
        </div>
      )}

      {(TRAIT_CARD_TYPES as readonly CardType[]).map((color) => {
        const group = colorGroups.get(color);
        if (!group) return null;

        const visibleCards = group
          .filter(isVisible)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (visibleCards.length === 0) return null;

        return (
          <div key={color} className="color-group">
            <h3 className={`color-header ${color}`}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </h3>
            <div className="cards-grid">
              {visibleCards.map((card) => (
                <div
                  key={card.name}
                  className="card pack-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.name)}
                  onClick={() => onClickCard(card.name)}
                  onMouseEnter={() => onHover(card.name)}
                  onMouseLeave={() => onHover(null)}
                >
                  <img
                    src={`/cards/${encodeURIComponent(card.name)}.small.png`}
                    alt={card.name}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// Inline catastrophe section within PackDisplay (matches Rails layout)
function CatastropheInline({
  catastropheCards,
  selectedCatastrophes,
  onToggle,
  onHover,
}: {
  catastropheCards: Card[];
  selectedCatastrophes: string[];
  onToggle: (name: string) => void;
  onHover: (name: string | null) => void;
}) {
  const sorted = [...catastropheCards].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="catastrophe-section">
      <h2>Catastrophe Cards</h2>
      <div className="catastrophe-cards">
        {sorted.map((card) => (
          <div
            key={card.name}
            className={`card catastrophe-card${selectedCatastrophes.includes(card.name) ? ' selected' : ''}`}
            onClick={() => onToggle(card.name)}
            onMouseEnter={() => onHover(card.name)}
            onMouseLeave={() => onHover(null)}
          >
            <img
              src={`/cards/${encodeURIComponent(card.name)}.small.png`}
              alt={card.name}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
