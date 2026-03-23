import { DOOMLINGS_WEBSITE_URL } from '../emailConfig';

interface AppFooterProps {
  onOpenScoringLogs: () => void;
  scoringLogsDisabled: boolean;
  scoringLogsTitle: string;
  onOpenContact: () => void;
  onOpenLicense: () => void;
  onOpenHowToUse: () => void;
}

export default function AppFooter({
  onOpenScoringLogs,
  scoringLogsDisabled,
  scoringLogsTitle,
  onOpenContact,
  onOpenLicense,
  onOpenHowToUse
}: AppFooterProps) {
  return (
    <footer className="app-footer" data-tour="footer">
      <nav className="app-footer-links" aria-label="Site links">
        <a
          href={DOOMLINGS_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="app-footer-action"
        >
          Doomlings
          <span className="app-footer-sr-only"> (opens in new tab)</span>
        </a>
        <button
          type="button"
          className="app-footer-action app-footer-action-btn"
          onClick={onOpenContact}
        >
          Contact us
        </button>
        <button
          type="button"
          className="app-footer-action app-footer-action-btn"
          onClick={onOpenLicense}
        >
          License
        </button>
        <button
          type="button"
          className="app-footer-action app-footer-action-btn"
          onClick={onOpenHowToUse}
        >
          How to use
        </button>
        <button
          type="button"
          className="app-footer-action app-footer-action-btn"
          onClick={onOpenScoringLogs}
          disabled={scoringLogsDisabled}
          title={scoringLogsTitle}
        >
          View scoring logs
        </button>
      </nav>
    </footer>
  );
}
