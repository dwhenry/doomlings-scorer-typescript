import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode
} from 'react';
import type { Action, AppState } from '../appReducer';
import ReleaseCollectionSelect from './ReleaseCollectionSelect';
import MobileHeaderMenu from './MobileHeaderMenu';
import DeckFilterModal from './DeckFilterModal';
import EmailContactModal from './EmailContactModal';
import { gameStateToExport } from '../utils/gameStateExport';
import { shareOrDownloadGameState } from '../utils/shareGameState';

interface HeaderProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  children: ReactNode;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export default function Header({ state, dispatch, children }: HeaderProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  const bugReportGameJson = useMemo(
    () => JSON.stringify(gameStateToExport(state), null, 2),
    [state]
  );

  const handleShareGame = useCallback(() => {
    void shareOrDownloadGameState(state);
  }, [state]);

  return (
    <header className="game-header">
      <div className="header-top">
        <h1>Doomlings Scorer</h1>

        {!isMobile && (
          <button
            type="button"
            className="new-game-btn"
            onClick={() => dispatch({ type: 'NEW_GAME' })}
            title="Start a new game (clears current game)"
          >
            New Game
          </button>
        )}

        {isMobile && (
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileMenuOpen}
            aria-label="Open menu"
          >
            <span aria-hidden>☰</span>
          </button>
        )}

        {!isMobile && (
          <div className="header-controls">
            <div className="pack-filter">
              <ReleaseCollectionSelect
                label="Filter by release or collection:"
                selectedReleases={state.selectedReleases}
                selectedCollections={state.selectedCollections}
                onChange={(releases, collections) =>
                  dispatch({ type: 'SET_RELEASE_COLLECTION_FILTER', releases, collections })
                }
              />
            </div>
            <div className="player-count">
              <label>Number of Players:</label>
              <select
                value={state.playerCount}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_PLAYER_COUNT',
                    count: parseInt(e.target.value, 10)
                  })
                }
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {children}

      {isMobile && (
        <MobileHeaderMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          dispatch={dispatch}
          onOpenDeckFilter={() => setDeckModalOpen(true)}
          onShareGame={handleShareGame}
          onReportBug={() => setBugReportOpen(true)}
        />
      )}
      {isMobile && (
        <DeckFilterModal
          open={deckModalOpen}
          onClose={() => setDeckModalOpen(false)}
          state={state}
          dispatch={dispatch}
        />
      )}
      {isMobile && bugReportOpen && (
        <EmailContactModal
          mode="bug"
          gameStateJson={bugReportGameJson}
          onClose={() => setBugReportOpen(false)}
        />
      )}
    </header>
  );
}
