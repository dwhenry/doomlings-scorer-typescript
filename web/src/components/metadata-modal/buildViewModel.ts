import type { GameScore } from '@scorer/scorer';
import { PLAYER_CARD_NAME } from '@scorer/types';
import type { CardEntry, PlayerState } from '../../types';
import type { MetadataField } from '../../utils/cardMetadata';
import {
  getCatastropheMetadataFields,
  getEditableMetadataFields,
  getInternalMetadataFields
} from '../../utils/cardMetadata';

export type MetadataModalSelector =
  | {
      kind: 'player-card';
      playerId: number;
      cardIndex: number;
      cardName: string;
    }
  | { kind: 'catastrophe'; cardName: string };

export interface MetadataModalGameContext {
  players: PlayerState[];
  selectedCatastrophes: CardEntry[];
  playerCount: number;
  selectedPlayerId: number | null;
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >;
  gameScore: GameScore | null;
}

export type MetadataSaveScope = 'global' | 'player' | 'card';

export interface MetadataModalViewModelBase {
  cardName: string;
  fields: MetadataField[];
  internalFields: MetadataField[];
  internalValues: Record<string, string | number | string[]>;
  currentValues: CardEntry;
  playerCardNames: string[];
  allPlayerCardNames: [playerIndex: string, cardName: string][];
  playerCount: number;
  selectedCatastrophes: CardEntry[];
}

export type MetadataModalViewModel =
  | (MetadataModalViewModelBase & {
      kind: 'player-card';
      playerId: number;
      cardIndex: number;
      saveScope: MetadataSaveScope;
    })
  | (MetadataModalViewModelBase & { kind: 'catastrophe' });

function deriveSaveScope(fields: MetadataField[]): MetadataSaveScope {
  if (fields.length === 0) return 'card';
  if (fields.some((f) => f.scope === 'global')) return 'global';
  if (fields.some((f) => f.scope === 'player')) return 'player';
  return 'card';
}

function buildPlayerCardNameOptions(
  players: PlayerState[],
  modalPlayerId: number,
  selectedPlayerId: number | null
): string[] {
  const names = new Set<string>();
  if (selectedPlayerId === null) return [];
  const player = players.find((p) => p.id === modalPlayerId);
  if (!player?.cards.length) return [];
  player.cards.forEach((c) => {
    if (c.name !== PLAYER_CARD_NAME) names.add(c.name);
  });
  return [...names].sort((a, b) => a.localeCompare(b));
}

function buildAllPlayerCardPairs(
  players: PlayerState[]
): [string, string][] {
  const set = new Set<[string, string]>();
  players.forEach((player, playerIndex) => {
    player.cards.forEach((card) => {
      set.add([playerIndex.toString(), card.name]);
    });
  });
  return [...set].sort(
    (a, b) => a[0].localeCompare(b[0]) * 2 + a[1].localeCompare(b[1])
  );
}

function buildPlayerInternalValues(
  gameScore: GameScore | null,
  players: PlayerState[],
  playerId: number,
  cardIndex: number,
  internalFields: MetadataField[]
): Record<string, string | number | string[]> {
  const out: Record<string, string | number | string[]> = {};
  if (!gameScore || internalFields.length === 0) return out;
  try {
    const playerIndex = players.findIndex((p) => p.id === playerId);
    const genMeta = gameScore
      .getPlayerScore(playerIndex)
      .getGeneratedMetadata(cardIndex);
    if (genMeta) Object.assign(out, genMeta);
  } catch {
    // Card may not have generated metadata
  }
  return out;
}

function buildCatastropheInternalValues(
  gameScore: GameScore | null,
  selectedCatastrophes: CardEntry[],
  catastropheCardName: string,
  internalFields: MetadataField[]
): Record<string, string | number | string[]> {
  const out: Record<string, string | number | string[]> = {};
  if (!gameScore || internalFields.length === 0) return out;
  try {
    const catIndex = selectedCatastrophes.findIndex(
      (c) => c.name === catastropheCardName
    );
    const metadata = gameScore.getCatastropheGeneratedMetadata()[catIndex];
    if (metadata) Object.assign(out, metadata);
  } catch {
    // Catastrophe may not have generated metadata
  }
  return out;
}

export function buildMetadataModalViewModel(
  selector: MetadataModalSelector,
  ctx: MetadataModalGameContext
): MetadataModalViewModel | null {
  const {
    players,
    selectedCatastrophes,
    playerCount,
    selectedPlayerId,
    catastropheMetadata,
    gameScore
  } = ctx;

  if (selector.kind === 'player-card') {
    const { playerId, cardIndex, cardName } = selector;
    const cardEntry = players.find((p) => p.id === playerId)?.cards[cardIndex];
    if (!cardEntry) return null;

    const fields = getEditableMetadataFields(cardName);
    const internalFields = getInternalMetadataFields(cardName);
    if (fields.length === 0 && internalFields.length === 0) return null;

    const internalValues = buildPlayerInternalValues(
      gameScore,
      players,
      playerId,
      cardIndex,
      internalFields
    );

    return {
      kind: 'player-card',
      playerId,
      cardIndex,
      cardName,
      currentValues: cardEntry,
      fields,
      internalFields,
      internalValues,
      playerCardNames: buildPlayerCardNameOptions(
        players,
        playerId,
        selectedPlayerId
      ),
      allPlayerCardNames: buildAllPlayerCardPairs(players),
      playerCount,
      selectedCatastrophes,
      saveScope: deriveSaveScope(fields)
    };
  }

  const { cardName } = selector;
  const cardEntry = selectedCatastrophes.find((c) => c.name === cardName);
  if (!cardEntry) return null;

  const fields = getEditableMetadataFields(cardName);
  const internalFields = getCatastropheMetadataFields(
    catastropheMetadata[cardName]
  );
  if (fields.length === 0 && internalFields.length === 0) return null;

  const internalValues = buildCatastropheInternalValues(
    gameScore,
    selectedCatastrophes,
    cardName,
    internalFields
  );

  return {
    kind: 'catastrophe',
    cardName,
    currentValues: cardEntry,
    fields,
    internalFields,
    internalValues,
    playerCardNames: [],
    allPlayerCardNames: [],
    playerCount,
    selectedCatastrophes: []
  };
}

/** True when the modal should mount (editable or internal metadata exists). */
export function hasMetadataModalContent(
  selector: MetadataModalSelector,
  ctx: MetadataModalGameContext
): boolean {
  return buildMetadataModalViewModel(selector, ctx) !== null;
}
