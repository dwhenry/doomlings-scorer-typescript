import { useState, useMemo, useCallback } from 'react';
import type { Card, CardEntry, CardType } from '../types';
import { TRAIT_CARD_TYPES } from '@scorer/types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useHeaderBottom } from '../hooks/useHeaderBottom';
import ColorTabs, { type TabId } from './ColorTabs';
import SearchBar from './SearchBar';
import CardGrid from './CardGrid';
import BottomDrawer from './BottomDrawer';
import { getCatastropheMetadataFields } from 'src/utils/cardMetadata';

interface PackDisplayProps {
  cards: Map<string, Card>;
  playerCount: number;
  selectedReleaseCollections: string[];
  /** All release|collection keys for a card (used when card has multiple releases) */
  getReleaseCollectionKeys: (card: Card) => string[];
  selectedPlayerId: number | null;
  mobileAddingForPlayer: number | null;
  onClickCard: (cardName: string) => void;
  onHover: (cardName: string | null) => void;
  selectedCatastrophes: CardEntry[];
  onClickCatastrophe: (cardName: string) => void;
  onDeselectCatastrophe: (cardName: string) => void;
}

export default function PackDisplay({
  cards,
  playerCount,
  selectedReleaseCollections,
  getReleaseCollectionKeys,
  selectedPlayerId,
  mobileAddingForPlayer,
  onClickCard,
  onHover,
  selectedCatastrophes,
  onClickCatastrophe,
  onDeselectCatastrophe
}: PackDisplayProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const headerBottom = useHeaderBottom();
  const [activeTab, setActiveTab] = useState<TabId>('purple');
  const [searchQuery, setSearchQuery] = useState('');

  // Group cards by color and catastrophes
  const { colorGroups, catastropheCards } = useMemo(() => {
    const groups = new Map<CardType, Card[]>();
    const catastrophes: Card[] = [];

    for (const card of cards.values()) {
      if (card.type.includes('catastrophe')) {
        catastrophes.push(card);
        continue;
      }
      if (card.type.includes('none')) continue;

      const colors = (TRAIT_CARD_TYPES as readonly string[]).filter((t) =>
        card.type.includes(t as CardType)
      ) as CardType[];

      for (const color of colors) {
        const group = groups.get(color) || [];
        group.push(card);
        groups.set(color, group);
      }
    }

    return { colorGroups: groups, catastropheCards: catastrophes };
  }, [cards]);

  function isVisible(card: Card): boolean {
    if (selectedReleaseCollections.length === 0) return true;
    return getReleaseCollectionKeys(card).some((key) =>
      selectedReleaseCollections.includes(key)
    );
  }

  const isSearching = searchQuery.length > 0;

  // Get filtered cards for current tab (or all tabs when searching)
  const filteredCards = useMemo(() => {
    if (!isSearching && activeTab === 'catastrophe') return [];

    const query = searchQuery.toLowerCase();

    if (isSearching) {
      // Search across all color groups
      const allColorCards = new Map<string, Card>();
      for (const group of colorGroups.values()) {
        for (const card of group) {
          if (!allColorCards.has(card.name)) {
            allColorCards.set(card.name, card);
          }
        }
      }
      return Array.from(allColorCards.values())
        .filter((card) => card.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const group = colorGroups.get(activeTab as CardType) || [];
    return group.filter(isVisible).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTab, colorGroups, selectedReleaseCollections, searchQuery, isSearching]);

  const filteredCatastrophes = useMemo(() => {
    if (isSearching) {
      const query = searchQuery.toLowerCase();
      return [...catastropheCards]
        .filter(isVisible)
        .filter((card) => card.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    if (activeTab !== 'catastrophe') return [];
    return [...catastropheCards]
      .filter(
        (card) =>
          selectedCatastrophes.find((c) => c.name === card.name) ||
          isVisible(card)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTab, catastropheCards, selectedReleaseCollections, searchQuery, isSearching]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardName: string) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardName', cardName);
    },
    []
  );

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSearchQuery('');
  }, []);

  const tabbedContent = (
    <>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {!isSearching && (
        <ColorTabs activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {isSearching ? (
        <>
          <CardGrid
            cards={filteredCards}
            selectedPlayerId={selectedPlayerId}
            onClickCard={onClickCard}
            onHover={onHover}
            onDragStart={handleDragStart}
          />
          {filteredCatastrophes.length > 0 && (
            <CatastropheInline
              playerCount={playerCount}
              catastropheCards={filteredCatastrophes}
              selectedCatastrophes={selectedCatastrophes}
              clickCard={onClickCatastrophe}
              onDeselect={onDeselectCatastrophe}
              onHover={onHover}
            />
          )}
        </>
      ) : activeTab === 'catastrophe' ? (
        <CatastropheInline
          playerCount={playerCount}
          catastropheCards={filteredCatastrophes}
          selectedCatastrophes={selectedCatastrophes}
          clickCard={onClickCatastrophe}
          onDeselect={onDeselectCatastrophe}
          onHover={onHover}
        />
      ) : (
        <CardGrid
          cards={filteredCards}
          selectedPlayerId={selectedPlayerId}
          onClickCard={onClickCard}
          onHover={onHover}
          onDragStart={handleDragStart}
        />
      )}
    </>
  );

  if (!isDesktop) {
    // Only render drawer on mobile when actively adding cards for a player
    if (mobileAddingForPlayer === null) return null;

    return (
      <BottomDrawer topOffset={headerBottom}>{tabbedContent}</BottomDrawer>
    );
  }

  return (
    <section
      className={`pack-display${selectedPlayerId !== null ? ' player-selected' : ''}`}
    >
      <h2>Card Pack</h2>

      {selectedPlayerId !== null && (
        <div className="player-selection-hint">
          Click on cards below to add them to Player {selectedPlayerId + 1}
        </div>
      )}

      {tabbedContent}
    </section>
  );
}

// Inline catastrophe section within PackDisplay (matches Rails layout)
function CatastropheInline({
  catastropheCards,
  selectedCatastrophes,
  playerCount,
  clickCard,
  onDeselect,
  onHover
}: {
  catastropheCards: Card[];
  selectedCatastrophes: CardEntry[];
  playerCount: number;
  clickCard: (name: string) => void;
  onDeselect: (name: string) => void;
  onHover: (name: string | null) => void;
}) {
  return (
    <div className="catastrophe-tab-content">
      <div className="catastrophe-cards">
        {catastropheCards.map((card) => {
          const isSelected = selectedCatastrophes.find(
            (c) => c.name === card.name
          );
          const requiredMetadata =
            isSelected &&
            card.metadataRequired &&
            card.metadataRequired.filter(
              ([_, __, scope]) => scope !== 'internal'
            );

          const missingMetadata =
            isSelected &&
            requiredMetadata &&
            requiredMetadata.some(([key, type]) => {
              const value = isSelected[key] as
                | string
                | number
                | string[]
                | undefined;
              if (value === undefined) return true;
              if (type === 'number' || type === 'catastrophe')
                return isNaN(Number(value));
              if (type === 'card_per_person') {
                return (
                  (value as string[]).length !== playerCount &&
                  (value as string[]).some((v) => v === '')
                );
              }
              return value === '';
            });

          return (
            <div
              key={card.name}
              className={`card catastrophe-card${isSelected ? ' selected' : ''}${missingMetadata ? ' metadata-missing' : ''}`}
              onClick={() => clickCard(card.name)}
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
              {selectedCatastrophes.find((c) => c.name === card.name) && (
                <div className="card-count">
                  {selectedCatastrophes.indexOf(
                    selectedCatastrophes.find((c) => c.name === card.name)!
                  ) + 1}
                </div>
              )}
              <span className="pack-card-name">{card.name}</span>
              {isSelected && (
                <button
                  className="remove-card remove-card--visible"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeselect(card.name);
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
