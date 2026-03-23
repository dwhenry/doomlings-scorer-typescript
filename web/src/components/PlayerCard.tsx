import { useLayoutEffect, useRef, type Dispatch } from 'react';
import type { Action } from '../appReducer';
import type { PlayerState, CardGroup } from '../types';
import { countPlayerDisplayCards } from '../utils/countPlayerDisplayCards';

function selectOrStartAddingPlayer(
  dispatch: Dispatch<Action>,
  isMobile: boolean,
  playerId: number
): void {
  if (isMobile) {
    dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId });
  } else {
    dispatch({ type: 'SELECT_PLAYER', id: playerId });
  }
}

export function removePlayerCard(
  dispatch: Dispatch<Action>,
  playerId: number,
  cardIndex: number
): void {
  dispatch({ type: 'REMOVE_CARD', playerId, cardIndex });
}

function openCardMetadataModal(
  dispatch: Dispatch<Action>,
  playerId: number,
  cardIndex: number,
  cardName: string
): void {
  dispatch({ type: 'OPEN_MODAL', playerId, cardIndex, cardName });
}

function setHoveredCard(
  dispatch: Dispatch<Action>,
  cardName: string | null
): void {
  dispatch({ type: 'SET_HOVERED', cardName });
}

function startAddingForPlayer(
  dispatch: Dispatch<Action>,
  playerId: number
): void {
  dispatch({ type: 'START_ADDING_FOR_PLAYER', playerId });
}

export type PlayerCardLayoutVariant = 'default' | 'compact' | 'featured';

interface PlayerCardProps {
  dispatch: Dispatch<Action>;
  player: PlayerState;
  isSelected: boolean;
  isMobile: boolean;
  cardGroups: CardGroup[];
  totalScore: number;
  showAddButton?: boolean;
  /** Desktop: narrow name+score when another player is selected */
  layoutVariant?: PlayerCardLayoutVariant;
}

export default function PlayerCard({
  dispatch,
  player,
  isSelected,
  isMobile,
  cardGroups,
  totalScore,
  showAddButton,
  layoutVariant = 'default'
}: PlayerCardProps) {
  const prevCardCountRef = useRef(player.cards.length);
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  const lastCardIndex = player.cards.length > 0 ? player.cards.length - 1 : -1;
  const isCompact = layoutVariant === 'compact';
  const displayCardCount = countPlayerDisplayCards(player.cards);

  useLayoutEffect(() => {
    if (isMobile || isCompact) {
      prevCardCountRef.current = player.cards.length;
      return;
    }
    if (
      player.cards.length > prevCardCountRef.current &&
      scrollTargetRef.current
    ) {
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollTargetRef.current.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
    prevCardCountRef.current = player.cards.length;
  }, [player.cards.length, isMobile, isCompact]);

  const layoutClass =
    layoutVariant === 'featured'
      ? ' player--featured'
      : isCompact
        ? ' player--compact'
        : '';

  if (isCompact) {
    return (
      <div
        className={`player player--compact${isSelected ? ' selected' : ''}`}
        data-player-id={player.id}
        onClick={() => selectOrStartAddingPlayer(dispatch, isMobile, player.id)}
      >
        <div className="player-header">
          <h3>{player.name}</h3>
          <div
            className="player-score-row-compact"
            aria-label={`${totalScore} points, ${displayCardCount} cards`}
          >
            <span className="player-score-pts">
              <span className="total-score">{totalScore}</span> pts
            </span>
            <span className="player-score-sep" aria-hidden="true">
              |
            </span>
            <span className="player-score-cards">
              {displayCardCount} cards
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`player${isSelected ? ' selected' : ''}${layoutClass}`}
      data-player-id={player.id}
      onClick={() => selectOrStartAddingPlayer(dispatch, isMobile, player.id)}
    >
      <div className="player-header">
        <h3>{player.name}</h3>
        <div className="player-score-stack">
          <div className="player-score">
            <span className="total-score">{totalScore}</span> points
          </div>
          <div className="player-hand-count">{displayCardCount} cards</div>
        </div>
      </div>
      <div className="player-hand">
        {cardGroups.length === 0 ? (
          <div className="drop-zone">
            Select this player, then click cards in the pack to add them
          </div>
        ) : (
          cardGroups.map((group) => {
            const allDiscarded = group.discardedIndices.length === group.count;
            const refLastAdded =
              lastCardIndex >= 0 &&
              group.cardIndices.includes(lastCardIndex)
                ? scrollTargetRef
                : undefined;
            return (
              <div
                key={`${group.name}-${group.cardIndices[0]}`}
                ref={refLastAdded}
                className={`card player-card${group.metadataMissing ? ' metadata-missing' : ''}${allDiscarded ? ' card--discarded' : ''}`}
                onMouseEnter={
                  isMobile
                    ? undefined
                    : () => setHoveredCard(dispatch, group.name)
                }
                onMouseLeave={
                  isMobile ? undefined : () => setHoveredCard(dispatch, null)
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (group.hasMetadata) {
                    openCardMetadataModal(
                      dispatch,
                      player.id,
                      group.cardIndices[0],
                      group.name
                    );
                  }
                }}
              >
                <img
                  src={`/cards/${encodeURIComponent(group.name)}.png`}
                  alt={group.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {group.count > 1 && (
                  <div className="card-count">{group.count}</div>
                )}
                {allDiscarded ? (
                  <div className="card-score card-score--discarded">0 pts</div>
                ) : group.totalScore !== null ? (
                  <div className="card-score">{group.totalScore} pts</div>
                ) : group.metadataMissing ? (
                  <div className="card-score card-score--missing">-</div>
                ) : null}
                <button
                  className="remove-card remove-card--visible"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlayerCard(
                      dispatch,
                      player.id,
                      group.cardIndices[0]
                    );
                  }}
                >
                  &times;
                </button>
              </div>
            );
          })
        )}
      </div>
      {showAddButton && (
        <button
          className="add-cards-btn"
          onClick={(e) => {
            e.stopPropagation();
            startAddingForPlayer(dispatch, player.id);
          }}
        >
          + Add cards
        </button>
      )}
    </div>
  );
}
