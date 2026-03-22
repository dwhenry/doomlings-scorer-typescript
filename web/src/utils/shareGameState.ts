import type { AppState } from '../appReducer';
import { gameStateToExport } from './gameStateExport';

/**
 * Shares the game JSON via the Web Share API when available (typical on mobile),
 * otherwise triggers a file download.
 */
export async function shareOrDownloadGameState(state: AppState): Promise<void> {
  const payload = gameStateToExport(state);
  const json = JSON.stringify(payload, null, 2);
  const filename = `doomlings-game-${new Date().toISOString().slice(0, 10)}.json`;

  const file = new File([json], filename, { type: 'application/json' });
  const shareData: ShareData = { files: [file] };

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare(shareData)
  ) {
    try {
      await navigator.share(shareData);
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      // Fall through to download.
    }
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
