import type { MouseEvent } from 'react';

interface LicenseModalProps {
  onClose: () => void;
}

export default function LicenseModal({ onClose }: LicenseModalProps) {
  const overlayClick = (ev: MouseEvent) => {
    if (ev.target === ev.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={overlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-modal-title"
    >
      <div
        className="modal-content license-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="license-modal-title">License & disclaimer</h3>
        </div>
        <div className="license-modal-body">
          <p>
            This software is provided <strong>free of charge</strong> for your
            convenience. You may use it at no cost, subject to the disclaimer
            below.
          </p>
          <p>
            THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
          <p>
            <strong>No guarantee of accuracy:</strong> Scores produced by this
            application are not warranted to match official Doomlings rules or
            tournament rulings. Always verify scores using the official rules
            and your own judgment. This tool is unofficial fan software and is
            not affiliated with or endorsed by the publisher of Doomlings.
          </p>
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
