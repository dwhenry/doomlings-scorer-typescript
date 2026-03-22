import type { Dispatch } from 'react';
import type { Action, AppState } from '../appReducer';
import ReleaseCollectionSelect from './ReleaseCollectionSelect';

interface DeckFilterModalProps {
  open: boolean;
  onClose: () => void;
  state: AppState;
  dispatch: Dispatch<Action>;
}

export default function DeckFilterModal({
  open,
  onClose,
  state,
  dispatch
}: DeckFilterModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay deck-filter-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-filter-modal-title"
    >
      <div
        className="modal-content deck-filter-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="deck-filter-modal-title">Select decks</h3>
        </div>
        <div className="deck-filter-modal-body">
          <ReleaseCollectionSelect
            variant="inline"
            label="Filter by release or collection:"
            selectedReleases={state.selectedReleases}
            selectedCollections={state.selectedCollections}
            onChange={(releases, collections) =>
              dispatch({ type: 'SET_RELEASE_COLLECTION_FILTER', releases, collections })
            }
          />
        </div>
        <div className="modal-actions deck-filter-modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
