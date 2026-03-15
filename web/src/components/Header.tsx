import { useState } from 'react';
import GroupedMultiSelect, { type GroupOption } from './GroupedMultiSelect';

interface HeaderProps {
  releaseGroups: GroupOption[];
  selectedReleaseCollections: string[];
  onReleaseCollectionsChange: (keys: string[]) => void;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  children: React.ReactNode; // PlayerSection rendered inside header
}

function optionValue(release: string, collection: string): string {
  return `${release}|${collection}`;
}

export default function Header({
  releaseGroups,
  selectedReleaseCollections,
  onReleaseCollectionsChange,
  playerCount,
  onPlayerCountChange,
  children
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
            <GroupedMultiSelect
              label="Select by release / collection:"
              groups={releaseGroups}
              selected={selectedReleaseCollections}
              onChange={onReleaseCollectionsChange}
              optionValue={optionValue}
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
