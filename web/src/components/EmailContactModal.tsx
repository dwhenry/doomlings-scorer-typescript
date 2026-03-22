import { useState, type FormEvent, type MouseEvent } from 'react';
import emailjs from '@emailjs/browser';
import {
  CONTACT_RECIPIENT_EMAIL,
  getEmailJsConfig
} from '../emailConfig';

export type EmailContactModalMode = 'contact' | 'bug';

type EmailContactModalProps =
  | { mode: 'contact'; onClose: () => void }
  | { mode: 'bug'; onClose: () => void; gameStateJson: string };

const BUG_SUBJECT_DEFAULT = 'Doomlings Scorer — scoring bug report';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function EmailContactModal(props: EmailContactModalProps) {
  const { mode, onClose } = props;
  const gameStateJson = props.mode === 'bug' ? props.gameStateJson : undefined;
  const config = getEmailJsConfig();
  const [replyEmail, setReplyEmail] = useState('');
  const [subject, setSubject] = useState(
    mode === 'bug' ? BUG_SUBJECT_DEFAULT : ''
  );
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'sent' | 'error'
  >('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  const title =
    mode === 'bug' ? 'Report a scoring bug' : 'Contact us';

  const userPart =
    message.trim() ||
    (mode === 'bug'
      ? '(No additional written description — see game JSON below.)'
      : '');

  const composedBody =
    mode === 'bug' && gameStateJson
      ? [
          userPart,
          '',
          '--- Game state (JSON) — please do not remove ---',
          gameStateJson
        ].join('\n')
      : message.trim();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!config) {
      setErrorText(
        'Email is not configured. Add VITE_EMAILJS_* variables (see .env.example).'
      );
      setStatus('error');
      return;
    }
    if (!isValidEmail(replyEmail)) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setErrorText('Please enter a subject.');
      return;
    }
    if (mode === 'contact' && !message.trim()) {
      setErrorText('Please enter a message.');
      return;
    }
    if (mode === 'bug' && !gameStateJson?.trim()) {
      setErrorText('Game data is missing; try closing and reopening this form.');
      return;
    }
    setStatus('sending');
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          reply_email: replyEmail.trim(),
          subject: subject.trim(),
          message: composedBody,
          to_email: CONTACT_RECIPIENT_EMAIL
        },
        { publicKey: config.publicKey }
      );
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorText(
        err instanceof Error ? err.message : 'Failed to send. Please try again.'
      );
    }
  };

  const overlayClick = (ev: MouseEvent) => {
    if (ev.target === ev.currentTarget) onClose();
  };

  return (
    <div
      className="email-contact-modal-overlay"
      onClick={overlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-contact-title"
    >
      <div
        className="modal-content email-contact-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="email-contact-title">{title}</h3>
        </div>

        {mode === 'bug' && (
          <p className="email-contact-helper">
            Describe what you expected versus what the scorer showed (which
            phase, which card, and steps if you can). The game state JSON below
            is sent with your message so the issue can be reproduced.
          </p>
        )}

        {mode === 'contact' && (
          <p className="email-contact-helper">
            Your message will be sent to {CONTACT_RECIPIENT_EMAIL}. We may reply
            at the address you provide.
          </p>
        )}

        {!config && (
          <p className="email-contact-config-warning" role="status">
            Email sending requires EmailJS setup: create a template at{' '}
            <a
              href="https://www.emailjs.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              EmailJS
            </a>{' '}
            and set <code>VITE_EMAILJS_PUBLIC_KEY</code>,{' '}
            <code>VITE_EMAILJS_SERVICE_ID</code>, and{' '}
            <code>VITE_EMAILJS_TEMPLATE_ID</code> (see <code>.env.example</code>
            ).
          </p>
        )}

        {status === 'sent' ? (
          <div className="email-contact-sent">
            <p>Thank you — your message was sent.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label htmlFor="email-contact-reply">Your email</label>
              <input
                id="email-contact-reply"
                type="email"
                autoComplete="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="modal-field">
              <label htmlFor="email-contact-subject">Subject</label>
              <input
                id="email-contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder={
                  mode === 'bug' ? BUG_SUBJECT_DEFAULT : 'Subject'
                }
              />
            </div>
            <div className="modal-field">
              <label htmlFor="email-contact-body">
                {mode === 'bug' ? 'Describe the issue' : 'Message'}
              </label>
              <textarea
                id="email-contact-body"
                className="email-contact-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required={mode === 'contact'}
                rows={mode === 'bug' ? 6 : 5}
                placeholder={
                  mode === 'bug'
                    ? 'e.g. “Ancient Brainworm should score X in phase B because…” (optional but helpful)'
                    : 'Your message…'
                }
              />
            </div>

            {mode === 'bug' && gameStateJson && (
              <div className="modal-field">
                <label htmlFor="email-contact-game-json">Game data (included)</label>
                <textarea
                  id="email-contact-game-json"
                  className="email-contact-textarea email-contact-game-json"
                  readOnly
                  value={gameStateJson}
                  rows={8}
                  spellCheck={false}
                />
              </div>
            )}

            {errorText && (
              <p className="modal-error" role="alert">
                {errorText}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={onClose}
                disabled={status === 'sending'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-save"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
