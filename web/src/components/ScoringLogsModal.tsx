import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch
} from 'react';
import { Scorer } from '@scorer/scorer';
import type { Card, PlayerInput } from '@scorer/types';
import { PLAYER_CARD_NAME } from '@scorer/types';
import type { Action, AppState } from '../appReducer';
import EmailContactModal from './EmailContactModal';
import type { CardEntry, GameStateExport, PlayerState } from '../types';
import { gameStateToExport } from '../utils/gameStateExport';

type LogView = 'byPlayer' | 'bySource';

interface FormattedLogEntry {
  phase: string;
  points: string;
  updates: string;
  message: string;
}

interface FormattedCardLog {
  name: string;
  phaseA: number;
  phaseB: number | undefined;
  phaseC: number;
  pointsLog: FormattedLogEntry[];
}

interface FormattedPlayerLog {
  name: string;
  phaseA: number | undefined;
  phaseB: number | undefined;
  phaseC: number | undefined;
  cards: FormattedCardLog[];
}

interface ScoringLogsModalProps {
  cards: Map<string, Card>;
  state: AppState;
  dispatch: Dispatch<Action>;
}

function buildScorer(
  cards: Map<string, Card>,
  players: PlayerState[],
  selectedCatastrophes: CardEntry[],
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >
): Scorer | null {
  const hasAnyCards = players.some((p) => p.cards.length > 0);
  if (!hasAnyCards) return null;
  try {
    const playerCards = players.map((p) =>
      p.cards.map((c) => ({ ...c }) as PlayerInput)
    );
    const scorer = new Scorer(cards, ...playerCards);
    if (selectedCatastrophes.length > 0) {
      const catastropheInputs: PlayerInput[] = selectedCatastrophes.map(
        (cat) => ({
          ...cat,
          ...catastropheMetadata[cat.name]
        })
      );
      scorer.addCatastrophes(catastropheInputs);
    }
    return scorer;
  } catch {
    return null;
  }
}

function isValidGameStateExport(
  data: unknown
): data is GameStateExport {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.version === 'number' &&
    Array.isArray(o.players) &&
    (o.selectedReleases === undefined || Array.isArray(o.selectedReleases)) &&
    (o.selectedCollections === undefined || Array.isArray(o.selectedCollections))
  );
}

export default function ScoringLogsModal({
  state,
  cards,
  dispatch
}: ScoringLogsModalProps) {
  const {
    players,
    selectedCatastrophes,
    catastropheMetadata,
    selectedReleases,
    selectedCollections,
  } = state;

  const close = () => dispatch({ type: 'CLOSE_SCORING_LOGS' });
  const [logView, setLogView] = useState<LogView>('byPlayer');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [importError, setImportError] = useState<string | null>(null);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = gameStateToExport(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doomlings-game-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        if (typeof text !== 'string') {
          setImportError('Could not read file.');
          return;
        }
        const data = JSON.parse(text) as unknown;
        if (!isValidGameStateExport(data)) {
          setImportError('Invalid game state file.');
          return;
        }
        dispatch({ type: 'IMPORT_GAME_STATE', payload: data });
        close();
      } catch {
        setImportError('Invalid JSON or file format.');
      }
    };
    reader.readAsText(file);
  };

  const toggleCard = (cardKey: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardKey)) next.delete(cardKey);
      else next.add(cardKey);
      return next;
    });
  };

  const scorer = useMemo(
    () => buildScorer(cards, players, selectedCatastrophes, catastropheMetadata),
    [players, selectedCatastrophes, catastropheMetadata]
  );

  const logsData = useMemo((): FormattedPlayerLog[] | null => {
    if (!scorer) return null;
    const result = scorer.logs(logView);
    return (result as FormattedPlayerLog[] | undefined) ?? null;
  }, [scorer, logView]);

  const hasLogs =
    logsData &&
    logsData.some((p) => p.cards.some((c) => c.pointsLog.length > 0));

  const bugReportGameJson = useMemo(
    () => JSON.stringify(gameStateToExport(state), null, 2),
    [state]
  );

  return (
    <>
    <div
      className="modal-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-logs-title"
    >
      <div
        className="modal-content scoring-logs-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header scoring-logs-header">
          <h3 id="scoring-logs-title">Scoring logs</h3>
          <div className="scoring-logs-tabs">
            <button
              type="button"
              className={`scoring-logs-tab${logView === 'byPlayer' ? ' active' : ''}`}
              onClick={() => setLogView('byPlayer')}
            >
              By player
            </button>
            <button
              type="button"
              className={`scoring-logs-tab${logView === 'bySource' ? ' active' : ''}`}
              onClick={() => setLogView('bySource')}
            >
              By source
            </button>
          </div>
        </div>

        <div className="scoring-logs-body">
          {!scorer && (
            <p className="scoring-logs-empty">Add cards to see scoring logs.</p>
          )}
          {scorer && !hasLogs && (
            <p className="scoring-logs-empty">No scoring log entries yet.</p>
          )}
          {hasLogs && logsData && (
            <div className="scoring-logs-tables">
              <div
                className="scoring-logs-score-row scoring-logs-score-header"
                aria-hidden
              >
                <span className="scoring-logs-score-name" />
                <span className="scoring-logs-score-total">Total</span>
                <span className="scoring-logs-score-a">A</span>
                <span className="scoring-logs-score-b">B</span>
                <span className="scoring-logs-score-c">C</span>
              </div>
              {logsData.map((player) => (
                <section
                  key={player.name}
                  className="scoring-logs-player-section"
                >
                  <h4 className="scoring-logs-player-name scoring-logs-score-row">
                    <span className="scoring-logs-score-name">
                      {player.name} ({player.cards.length} cards)
                    </span>
                    {player.phaseA !== undefined ? (
                      <>
                        <span className="scoring-logs-score-total">
                          {player.phaseB !== undefined
                            ? (player.phaseA ?? 0) +
                              (player.phaseB ?? 0) +
                              (player.phaseC ?? 0)
                            : '–'}
                        </span>
                        <span className="scoring-logs-score-a">
                          {player.phaseA}
                        </span>
                        <span className="scoring-logs-score-b">
                          {player.phaseB ?? '–'}
                        </span>
                        <span className="scoring-logs-score-c">
                          {player.phaseC}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="scoring-logs-score-total" />
                        <span className="scoring-logs-score-a" />
                        <span className="scoring-logs-score-b" />
                        <span className="scoring-logs-score-c" />
                      </>
                    )}
                  </h4>
                  {player.cards.map((card, position) => {
                    const cardKey = `${player.name}-${card.name}-${position}`;
                    const isExpanded = expandedCards.has(cardKey);
                    return (
                      <div
                        key={cardKey}
                        className="scoring-logs-card-block"
                      >
                        <button
                          type="button"
                          className={`scoring-logs-card-name scoring-logs-card-toggle scoring-logs-score-row${isExpanded ? ' is-expanded' : ''}`}
                          onClick={() => toggleCard(cardKey)}
                          aria-expanded={isExpanded}
                        >
                          <span className="scoring-logs-score-name">
                            <span className="scoring-logs-card-chevron" aria-hidden>
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            {card.name === PLAYER_CARD_NAME
                              ? 'Player (catastrophe points)'
                              : card.name}
                          </span>
                          <span className="scoring-logs-score-total">
                            {card.phaseB !== undefined
                              ? card.phaseA + card.phaseB + card.phaseC
                              : '–'}
                          </span>
                          <span className="scoring-logs-score-a">
                            {card.phaseA}
                          </span>
                          <span className="scoring-logs-score-b">
                            {card.phaseB ?? '–'}
                          </span>
                          <span className="scoring-logs-score-c">
                            {card.phaseC}
                          </span>
                        </button>
                        {isExpanded && (
                          <table className="scoring-logs-table">
                            <thead>
                              <tr>
                                <th>Phase</th>
                                <th>Points</th>
                                <th>Source</th>
                                <th>Message</th>
                              </tr>
                            </thead>
                            <tbody>
                              {card.pointsLog.map((entry, i) => (
                                <tr key={i}>
                                  <td>{entry.phase}</td>
                                  <td>{entry.points}</td>
                                  <td>{entry.updates}</td>
                                  <td>{entry.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </div>

        {importError && (
          <p className="scoring-logs-import-error" role="alert">
            {importError}
          </p>
        )}
        <div className="modal-actions scoring-logs-modal-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="scoring-logs-file-input"
            aria-hidden
          />
          <button
            type="button"
            className="scoring-logs-report-bug-btn"
            onClick={() => setBugReportOpen(true)}
          >
            Report scoring bug
          </button>
          <button
            type="button"
            className="scoring-logs-export-btn"
            onClick={handleExport}
          >
            Export game
          </button>
          <button
            type="button"
            className="scoring-logs-import-btn"
            onClick={handleImportClick}
          >
            Import game
          </button>
          <button type="button" className="modal-cancel" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
    {bugReportOpen && (
      <EmailContactModal
        mode="bug"
        gameStateJson={bugReportGameJson}
        onClose={() => setBugReportOpen(false)}
      />
    )}
    </>
  );
}
