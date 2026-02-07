import { useState } from 'react';
import MultiSelect from './MultiSelect';

interface HeaderProps {
  packs: string[];
  selectedPacks: string[];
  onPacksChange: (packs: string[]) => void;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  children: React.ReactNode; // PlayerSection rendered inside header
}

export default function Header({
  packs,
  selectedPacks,
  onPacksChange,
  playerCount,
  onPlayerCountChange,
  children,
}: HeaderProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <header className="game-header">
      <div className="header-top">
        <h1>Doomlings Scorer</h1>

        <button
          className="config-toggle"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? '\u2715' : '\u2699\uFE0F'}
        </button>

        <div className={`header-controls${showControls ? ' show' : ''}`}>
          <div className="pack-filter">
            <label>Select Packs:</label>
            <MultiSelect
              options={packs}
              selected={selectedPacks}
              onChange={onPacksChange}
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
