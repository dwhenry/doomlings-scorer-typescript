import { useState, useMemo, useCallback, type Dispatch } from 'react';
import type { Card, CardEntry, CardType } from '../types';
import { TRAIT_CARD_TYPES } from '@scorer/types';
import type { Action, AppState } from '../appReducer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLongPressPreview } from '../hooks/useLongPressPreview';
import ColorTabs, { type TabId } from './ColorTabs';
import SearchBar from './SearchBar';
import CardGrid from './CardGrid';
import {
  cardMatchesReleases,
  cardMatchesCollections
} from '@scorer/releaseCollection';

interface PackDisplayProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  cards: Map<string, Card>;
  onClickCard: (cardName: string) => void;
  onClickCatastrophe: (cardName: string) => void;
  onDeselectCatastrophe: (cardName: string) => void;
  /** Mobile / touch: long-press pack cards to open full-screen preview */
  onOpenCardPreview?: (cardName: string) => void;
}

export default function PackDisplay({
  state,
  dispatch,
  cards,
  onClickCard,
  onClickCatastrophe,
  onDeselectCatastrophe,
  onOpenCardPreview
}: PackDisplayProps) {
  const {
    players,
    selectedReleases,
    selectedCollections,
    playerCount,
    selectedPlayerId,
    mobileAddingForPlayer,
    selectedCatastrophes
  } = state;

  const setHovered = useCallback(
    (cardName: string | null) => {
      dispatch({ type: 'SET_HOVERED', cardName });
    },
    [dispatch]
  );
  const isDesktop = useMediaQuery('(min-width: 768px)');
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
    if (selectedReleases.length > 0) return cardMatchesReleases(card, selectedReleases);
    if (selectedCollections.length > 0) return cardMatchesCollections(card, selectedCollections);
    return true;
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
  }, [activeTab, colorGroups, selectedReleases, selectedCollections, searchQuery, isSearching]);

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
  }, [activeTab, catastropheCards, selectedReleases, selectedCollections, searchQuery, isSearching]);

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
            onClickCard={onClickCard}
            onHover={isDesktop ? setHovered : undefined}
            onLongPressPreview={!isDesktop ? onOpenCardPreview : undefined}
          />
          {filteredCatastrophes.length > 0 && (
            <CatastropheInline
              playerCount={playerCount}
              catastropheCards={filteredCatastrophes}
              selectedCatastrophes={selectedCatastrophes}
              clickCard={onClickCatastrophe}
              onDeselect={onDeselectCatastrophe}
              onHover={isDesktop ? setHovered : undefined}
              onLongPressPreview={!isDesktop ? onOpenCardPreview : undefined}
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
          onHover={isDesktop ? setHovered : undefined}
          onLongPressPreview={!isDesktop ? onOpenCardPreview : undefined}
        />
      ) : (
        <CardGrid
          cards={filteredCards}
          onClickCard={onClickCard}
          onHover={isDesktop ? setHovered : undefined}
          onLongPressPreview={!isDesktop ? onOpenCardPreview : undefined}
        />
      )}
    </>
  );

  if (!isDesktop) {
    if (mobileAddingForPlayer === null) return null;

    const addingPlayer = players.find((p) => p.id === mobileAddingForPlayer);

    return (
      <section className="pack-display pack-display--mobile player-selected">
        <h2>Card Pack</h2>
        <div className="player-selection-hint">
          Tap cards below to add them to{' '}
          {addingPlayer?.name ?? `Player ${mobileAddingForPlayer + 1}`}
        </div>
        {tabbedContent}
      </section>
    );
  }

  if (selectedPlayerId === null) {
    return (
      <section
        className="pack-display pack-display--awaiting-player"
        aria-live="polite"
      >
        <h2>Card Pack</h2>
        <p className="pack-display-awaiting-text">
          Select a player above to browse and add cards.
        </p>
      </section>
    );
  }

  return (
    <section className="pack-display player-selected">
      <h2>Card Pack</h2>

      <div className="player-selection-hint">
        Click on cards below to add them to Player {selectedPlayerId + 1}
      </div>

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
  onHover,
  onLongPressPreview
}: {
  catastropheCards: Card[];
  selectedCatastrophes: CardEntry[];
  playerCount: number;
  clickCard: (name: string) => void;
  onDeselect: (name: string) => void;
  onHover?: (name: string | null) => void;
  onLongPressPreview?: (name: string) => void;
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

          const sel = selectedCatastrophes.find((c) => c.name === card.name);
          const idx =
            sel !== undefined
              ? selectedCatastrophes.indexOf(sel) + 1
              : undefined;

          return (
            <CatastrophePackCell
              key={card.name}
              card={card}
              isSelected={!!isSelected}
              missingMetadata={!!missingMetadata}
              selectedIndex={idx}
              clickCard={clickCard}
              onDeselect={onDeselect}
              onHover={onHover}
              onLongPressPreview={onLongPressPreview}
            />
          );
        })}
      </div>
    </div>
  );
}

function CatastrophePackCell({
  card,
  isSelected,
  missingMetadata,
  selectedIndex,
  clickCard,
  onDeselect,
  onHover,
  onLongPressPreview
}: {
  card: Card;
  isSelected: boolean;
  missingMetadata: boolean;
  selectedIndex?: number;
  clickCard: (name: string) => void;
  onDeselect: (name: string) => void;
  onHover?: (name: string | null) => void;
  onLongPressPreview?: (name: string) => void;
}) {
  const { touchProps, wrapClick } = useLongPressPreview(
    onLongPressPreview ? () => onLongPressPreview(card.name) : undefined
  );

  return (
    <div
      className={`card catastrophe-card${isSelected ? ' selected' : ''}${missingMetadata ? ' metadata-missing' : ''}`}
      {...touchProps}
      onClick={wrapClick(() => clickCard(card.name))}
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
      {selectedIndex !== undefined && (
        <div className="card-count">{selectedIndex}</div>
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
}
