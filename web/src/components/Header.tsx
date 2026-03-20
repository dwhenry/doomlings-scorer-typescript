import { useState, type Dispatch } from 'react';
import type { Action, AppState } from '../appReducer';
import ReleaseCollectionSelect from './ReleaseCollectionSelect';

interface HeaderProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  children: React.ReactNode; // PlayerSection rendered inside header
}

export default function Header({ state, dispatch, children }: HeaderProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <header className="game-header">
      <div className="header-top">
        <h1>Doomlings Scorer</h1>

        <button
          type="button"
          className="new-game-btn"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          title="Start a new game (clears current game)"
        >
          New Game
        </button>

        <button
          className="config-toggle"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? '\u2715' : '\u2699\uFE0F'}
        </button>

        <div className={`header-controls${showControls ? ' show' : ''}`}>
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
                dispatch({ type: 'SET_PLAYER_COUNT', count: parseInt(e.target.value, 10) })
              }
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>
        </div>
      </div>

      {children}
    </header>
  );
}
