import type { Dispatch } from 'react';
import type { PlayerState, CardGroup, Card } from '../types';
import type { Action, AppState } from '../appReducer';
import type { GameScore } from '@scorer/scorer';
import { PLAYER_CARD_NAME } from '@scorer/types';
import { countPlayerDisplayCards } from '../utils/countPlayerDisplayCards';
import {
  getCardMetadataFields,
  isMetadataComplete,
  hasCardScopedMetadata
} from '../utils/cardMetadata';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useMobileHandPin } from '../hooks/useMobileHandPin';
import PlayerCard, { type PlayerCardLayoutVariant } from './PlayerCard';

interface PlayerSectionProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  gameScore: GameScore | null;
}

function buildCardGroups(
  player: PlayerState,
  gameScore: GameScore | null,
  playerIndex: number
): CardGroup[] {
  const groups: Map<string, CardGroup> = new Map();
  const individualCards: CardGroup[] = [];

  player.cards.forEach((card, cardIndex) => {
    const fields = getCardMetadataFields(card.name);
    const hasMetadata = fields.length > 0;
    const metadataMissing = hasMetadata && !isMetadataComplete(card, fields);
    const isCardScoped = hasCardScopedMetadata(fields);

    let cardScore: {
      finalA: number;
      finalB: number | undefined;
      total: number | undefined;
      discarded?: boolean;
    } = { finalA: 0, finalB: 0, total: 0 };
    if (gameScore) {
      try {
        const ps = gameScore.getPlayerScore(playerIndex);
        const cs = ps.getCardScoreByIndex(cardIndex);
        cardScore = {
          finalA: cs.finalA,
          finalB: cs.finalB,
          total: cs.total,
          discarded: cs.discarded
        };
      } catch {
        // card may not have a score yet
      }
    }
    const isDiscarded = cardScore.discarded === true;

    // Card-scoped metadata cards are never grouped
    if (isCardScoped) {
      individualCards.push({
        name: card.name,
        count: 1,
        totalScore:
          gameScore && cardScore.total !== undefined ? cardScore.total : null,
        perCardScores: [cardScore],
        hasMetadata,
        metadataMissing,
        cardIndices: [cardIndex],
        discardedIndices: isDiscarded ? [cardIndex] : []
      });
      return;
    }

    const key = `${card.name}-${isDiscarded ? `discarded-${cardIndex}` : ''}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.perCardScores.push(cardScore);
      existing.cardIndices.push(cardIndex);
      if (isDiscarded) existing.discardedIndices.push(cardIndex);
      if (cardScore.total !== undefined && existing.totalScore !== null) {
        existing.totalScore = existing.totalScore + cardScore.total;
      } else {
        existing.totalScore = null;
      }
      // If any instance is missing metadata, mark the group
      if (metadataMissing) existing.metadataMissing = true;
    } else {
      groups.set(key, {
        name: card.name,
        count: 1,
        totalScore:
          gameScore && cardScore.total !== undefined ? cardScore.total : null,
        perCardScores: [cardScore],
        hasMetadata,
        metadataMissing,
        cardIndices: [cardIndex],
        discardedIndices: isDiscarded ? [cardIndex] : []
      });
    }
  });

  const allGroups = [...Array.from(groups.values()), ...individualCards];
  return allGroups.filter((g) => g.name !== PLAYER_CARD_NAME);
}

export default function PlayerSection({
  state,
  dispatch,
  gameScore,
}: PlayerSectionProps) {
  const { players, selectedPlayerId, mobileAddingForPlayer } = state;
  const isMobile = !useMediaQuery('(min-width: 768px)');
  const mobileAddingActive =
    isMobile && mobileAddingForPlayer !== null;
  const { flowSlotRef, handRef, pinned, spacerHeight, handPinStyle } =
    useMobileHandPin(mobileAddingActive);

  // Mobile focused view: only show the player we're adding cards for
  if (mobileAddingActive) {
    const playerIndex = players.findIndex(
      (p) => p.id === mobileAddingForPlayer
    );
    const player = players[playerIndex];
    if (!player) return null;
    const cardGroups = buildCardGroups(player, gameScore, playerIndex);
    const totalScore = gameScore
      ? gameScore.getPlayerScore(playerIndex).total
      : 0;
    const displayCardCount = countPlayerDisplayCards(player.cards);

    const handCards = cardGroups.map((group) => {
      const allDiscarded = group.discardedIndices.length === group.count;
      return (
        <div
          key={`${group.name}-${group.cardIndices[0]}`}
          className={`card player-card${group.metadataMissing ? ' metadata-missing' : ''}${allDiscarded ? ' card--discarded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (group.hasMetadata) {
              dispatch({
                type: 'OPEN_MODAL',
                playerId: player.id,
                cardIndex: group.cardIndices[0],
                cardName: group.name
              });
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
              dispatch({
                type: 'REMOVE_CARD',
                playerId: player.id,
                cardIndex: group.cardIndices[0]
              });
            }}
          >
            &times;
          </button>
        </div>
      );
    });

    return (
      <section className="players-section players-section--focused players-section--focused-mobile-card">
        <div className="focused-player-header">
          <button
            className="focused-player-done"
            onClick={() => dispatch({ type: 'STOP_ADDING' })}
          >
            Done
          </button>
          <span className="focused-player-name">{player.name}</span>
          <div
            className="focused-player-stats"
            aria-label={`${totalScore} points, ${displayCardCount} cards`}
          >
            <span className="focused-player-score">{totalScore} pts</span>
            <span className="focused-player-sep" aria-hidden="true">
              |
            </span>
            <span className="focused-player-cards">
              {displayCardCount} cards
            </span>
          </div>
        </div>
        <div
          ref={flowSlotRef}
          className="focused-player-hand-flow-slot"
        >
          {pinned ? (
            <div
              className="focused-player-hand-spacer"
              style={{ height: spacerHeight }}
              aria-hidden
            />
          ) : null}
          <div
            ref={handRef}
            className={`focused-player-hand-sticky${pinned ? ' focused-player-hand-sticky--pinned' : ''}`}
            style={handPinStyle}
            aria-label={`${player.name}'s hand`}
          >
            <div className="focused-player-hand focused-player-hand--two-rows">
              {handCards}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const desktopHasSelection = !isMobile && selectedPlayerId !== null;

  const sectionClass = `players-section${
    isMobile
      ? ''
      : desktopHasSelection
        ? ' players-section--has-selection'
        : ' players-section--grid-desktop-2'
  }`;

  function playerCardFor(
    player: PlayerState,
    playerIndex: number,
    layoutVariant: PlayerCardLayoutVariant
  ) {
    const cardGroups = buildCardGroups(player, gameScore, playerIndex);
    const totalScore = gameScore
      ? gameScore.getPlayerScore(playerIndex).total
      : 0;

    return (
      <PlayerCard
        key={player.id}
        dispatch={dispatch}
        player={player}
        isSelected={selectedPlayerId === player.id}
        isMobile={isMobile}
        cardGroups={cardGroups}
        totalScore={totalScore}
        showAddButton={isMobile}
        layoutVariant={layoutVariant}
      />
    );
  }

  if (desktopHasSelection) {
    const selected = players.find((p) => p.id === selectedPlayerId);
    if (!selected) {
      return (
        <section className={sectionClass}>
          {players.map((player, index) =>
            playerCardFor(player, index, 'default')
          )}
        </section>
      );
    }
    const selectedIndex = players.findIndex((p) => p.id === selected.id);
    const others = players.filter((p) => p.id !== selectedPlayerId);

    return (
      <section className={sectionClass}>
        {playerCardFor(selected, selectedIndex, 'featured')}
        <div className="players-section__others" aria-label="Other players">
          {others.map((p) =>
            playerCardFor(p, players.findIndex((x) => x.id === p.id), 'compact')
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      {players.map((player, index) =>
        playerCardFor(player, index, 'default')
      )}
    </section>
  );
}
