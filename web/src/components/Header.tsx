import { useState } from 'react';
import ReleaseCollectionSelect from './ReleaseCollectionSelect';

interface HeaderProps {
  selectedReleases: string[];
  selectedCollections: string[];
  onReleaseCollectionFilterChange: (releases: string[], collections: string[]) => void;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  onNewGame: () => void;
  children: React.ReactNode; // PlayerSection rendered inside header
}

export default function Header({
  selectedReleases,
  selectedCollections,
  onReleaseCollectionFilterChange,
  playerCount,
  onPlayerCountChange,
  onNewGame,
  children
}: HeaderProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <header className="game-header">
      <div className="header-top">
        <h1>Doomlings Scorer</h1>

        <button
          type="button"
          className="new-game-btn"
          onClick={onNewGame}
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
              selectedReleases={selectedReleases}
              selectedCollections={selectedCollections}
              onChange={onReleaseCollectionFilterChange}
            />
          </div>
          <div className="player-count">
            <label>Number of Players:</label>
            <select
              value={playerCount}
              onChange={(e) => onPlayerCountChange(parseInt(e.target.value))}
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
