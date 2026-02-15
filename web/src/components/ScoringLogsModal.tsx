import { useMemo, useState } from 'react';
import { Scorer } from '@scorer/scorer';
import type { PlayerInput } from '@scorer/types';
import type { PlayerState } from '../types';
import type { CardEntry } from '../types';

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
  players: PlayerState[];
  selectedCatastrophes: CardEntry[];
  catastropheMetadata: Record<
    string,
    Record<string, string | number | string[]>
  >;
  onClose: () => void;
}

function buildScorer(
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
    const scorer = new Scorer(...playerCards);
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

export default function ScoringLogsModal({
  players,
  selectedCatastrophes,
  catastropheMetadata,
  onClose
}: ScoringLogsModalProps) {
  const [logView, setLogView] = useState<LogView>('byPlayer');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardKey: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardKey)) next.delete(cardKey);
      else next.add(cardKey);
      return next;
    });
  };

  const scorer = useMemo(
    () => buildScorer(players, selectedCatastrophes, catastropheMetadata),
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

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
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
              {logsData.map((player) => (
                <section
                  key={player.name}
                  className="scoring-logs-player-section"
                >
                  <h4 className="scoring-logs-player-name">
                    {player.name}
                    {player.phaseA !== undefined ? (
                      <>
                        {' '}
                        (
                        {player.phaseB !== undefined
                          ? (player.phaseA ?? 0) +
                            (player.phaseB ?? 0) +
                            (player.phaseC ?? 0)
                          : '–'}{' '}
                        points : {player.cards.length} cards)
                        <span className="scoring-logs-phases">
                          A: {player.phaseA} · B: {player.phaseB ?? '–'} · C:{' '}
                          {player.phaseC}
                        </span>
                      </>
                    ) : (
                      <> ({player.cards.length} cards)</>
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
                          className={`scoring-logs-card-name scoring-logs-card-toggle${isExpanded ? ' is-expanded' : ''}`}
                          onClick={() => toggleCard(cardKey)}
                          aria-expanded={isExpanded}
                        >
                          <span className="scoring-logs-card-chevron" aria-hidden>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          {card.name} (
                          {card.phaseB !== undefined
                            ? card.phaseA + card.phaseB + card.phaseC
                            : '–'}{' '}
                          points)
                          <span className="scoring-logs-phases">
                            A: {card.phaseA} · B: {card.phaseB ?? '–'} · C:{' '}
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

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
