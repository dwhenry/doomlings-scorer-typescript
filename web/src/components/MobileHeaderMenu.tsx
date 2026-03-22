import { useEffect, useState, type Dispatch } from 'react';
import type { Action } from '../appReducer';

type MenuPanel = 'main' | 'newGame';

interface MobileHeaderMenuProps {
  open: boolean;
  onClose: () => void;
  dispatch: Dispatch<Action>;
  onOpenDeckFilter: () => void;
  onShareGame: () => void;
  onReportBug: () => void;
}

export default function MobileHeaderMenu({
  open,
  onClose,
  dispatch,
  onOpenDeckFilter,
  onShareGame,
  onReportBug
}: MobileHeaderMenuProps) {
  const [panel, setPanel] = useState<MenuPanel>('main');

  useEffect(() => {
    if (open) setPanel('main');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const startGame = (count: 2 | 3 | 4) => {
    dispatch({ type: 'NEW_GAME_WITH_PLAYER_COUNT', count });
    onClose();
  };

  return (
    <div
      className="modal-overlay mobile-header-menu-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Game menu"
    >
      <div
        className="modal-content mobile-header-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-header-menu-header">
          {panel === 'newGame' ? (
            <button
              type="button"
              className="mobile-header-menu-back"
              onClick={() => setPanel('main')}
            >
              ← Back
            </button>
          ) : (
            <h3 className="mobile-header-menu-title">Menu</h3>
          )}
          <button
            type="button"
            className="mobile-header-menu-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {panel === 'main' && (
          <nav className="mobile-header-menu-list" aria-label="Game actions">
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => setPanel('newGame')}
            >
              New game
            </button>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => {
                onClose();
                onOpenDeckFilter();
              }}
            >
              Select decks
            </button>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => {
                onClose();
                void onShareGame();
              }}
            >
              Share game
            </button>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => {
                onClose();
                onReportBug();
              }}
            >
              Report bug
            </button>
          </nav>
        )}

        {panel === 'newGame' && (
          <div className="mobile-header-menu-list" role="group" aria-label="Player count">
            <p className="mobile-header-menu-hint">Start a new game with:</p>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => startGame(2)}
            >
              2 players
            </button>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => startGame(3)}
            >
              3 players
            </button>
            <button
              type="button"
              className="mobile-header-menu-item"
              onClick={() => startGame(4)}
            >
              4 players
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
