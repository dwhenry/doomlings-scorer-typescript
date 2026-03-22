import type { AppState } from '../appReducer';
import type { GameStateExport } from '../types';
import { GAME_STATE_EXPORT_VERSION } from '../types';

export function gameStateToExport(state: AppState): GameStateExport {
  return {
    version: GAME_STATE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    players: state.players,
    selectedCatastrophes: state.selectedCatastrophes,
    catastropheMetadata: state.catastropheMetadata,
    selectedReleases: state.selectedReleases,
    selectedCollections: state.selectedCollections
  };
}
