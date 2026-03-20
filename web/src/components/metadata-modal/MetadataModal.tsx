import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction
} from 'react';
import type { GameScore } from '@scorer/scorer';
import type { Action, AppState } from '../../appReducer';
import type { Card, CardEntry } from '../../types';
import type { MetadataField } from '../../utils/cardMetadata';
import {
  buildMetadataModalViewModel,
  type MetadataModalSelector,
  type MetadataSaveScope
} from './buildViewModel';
import { EditableMetadataField } from './EditableMetadataField';
import { InternalMetadataSection } from './InternalMetadataSection';
import { MetadataModalHeader } from './MetadataModalHeader';

export type MetadataModalSavePayload =
  | {
      kind: 'player-card';
      playerId: number;
      cardIndex: number;
      cardName: string;
      scope: MetadataSaveScope;
      values: Record<string, string | number | string[]>;
    }
  | {
      kind: 'catastrophe';
      cardName: string;
      values: Record<string, string | number | string[]>;
    };

interface MetadataModalPanelProps {
  selector: MetadataModalSelector;
  state: AppState;
  cards: Map<string, Card>;
  gameScore: GameScore | null;
  dispatch: Dispatch<Action>;
}

function MetadataModalPanel({
  selector,
  cards,
  state,
  gameScore,
  dispatch
}: MetadataModalPanelProps) {
  const model = useMemo(
    () => buildMetadataModalViewModel(selector, { state, gameScore }),
    [selector, state, gameScore]
  );

  const currentValues: CardEntry | undefined = model?.currentValues;
  const fields: MetadataField[] = model?.fields ?? [];
  const cardName = model?.cardName ?? '';

  const [values, setValues] = useState<Record<string, string | number>>({});
  const [arrayValues, setArrayValues] = useState<Record<string, string[]>>({});

  const [displayError, setDisplayError] = useState<string | undefined>(() =>
    currentValues && typeof currentValues.error === 'string'
      ? currentValues.error
      : undefined
  );

  const hasEditableFields = fields.length > 0;

  useEffect(() => {
    setDisplayError(
      currentValues && typeof currentValues.error === 'string'
        ? currentValues.error
        : undefined
    );
  }, [cardName, currentValues?.error]);

  function clearError() {
    if (displayError) {
      setDisplayError(undefined);
      if (state.modal) {
        dispatch({
          type: 'CLEAR_PLAYER_CARD_METADATA_ERROR',
          modal: state.modal
        });
      } else if (state.catastropheModal) {
        dispatch({
          type: 'CLEAR_CATASTROPHE_CARD_METADATA_ERROR',
          catastropheModal: state.catastropheModal
        });
      }
    }
  }

  const setValuesAndClearError = (
    updater: SetStateAction<Record<string, string | number>>
  ) => {
    clearError();
    setValues(updater);
  };

  const setArrayValuesAndClearError = (
    updater: SetStateAction<Record<string, string[]>>
  ) => {
    clearError();
    setArrayValues(updater);
  };

  useEffect(() => {
    if (!model) return;
    const initial: Record<string, string | number> = {};
    const initialArray: Record<string, string[]> = {};
    model.fields.forEach((f) => {
      if (f.type === 'card_per_person') {
        const existing = model.currentValues[f.key];
        if (existing !== undefined && existing !== '') {
          initialArray[f.key] = existing as string[];
        } else {
          initialArray[f.key] = Array.from(
            { length: model.playerCount },
            () => ''
          );
        }
      } else {
        const existing = model.currentValues[f.key];
        if (existing !== undefined && existing !== '') {
          initial[f.key] = existing as string | number;
        }
      }
    });
    setValues(initial);
    setArrayValues(initialArray);
  }, [model]);

  const allValid =
    model &&
    fields.every((f) => {
      const val = values[f.key];
      if (val !== undefined && val !== '') {
        if (f.type === 'number' || f.type === 'catastrophe')
          return typeof val === 'number' || !isNaN(Number(val));
        return true;
      }
      const arrayVal = arrayValues[f.key];
      if (arrayVal) {
        if (arrayVal.length === 0) return false;
        if (arrayVal.some((v) => v === '')) return false;
        return true;
      }
      return false;
    });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (!model) return;
    if (!hasEditableFields) {
      dispatch({ type: 'CLOSE_MODAL' });
      return;
    }
    if (!allValid) return;

    const coerced: Record<string, string | number | string[]> = {};
    fields.forEach((f) => {
      const val = values[f.key];
      if (val !== undefined && val !== '') {
        coerced[f.key] = f.type === 'number' ? Number(val) : val;
      }
      const arrayVal = arrayValues[f.key];
      if (arrayVal) {
        coerced[f.key] = arrayVal;
      }
    });

    if (model.kind === 'player-card') {
      dispatch({
        type: 'UPDATE_CARD_METADATA',
        payload: {
          playerId: model.playerId,
          cardIndex: model.cardIndex,
          cardName: model.cardName,
          scope: model.saveScope,
          values: coerced
        }
      });
    } else {
      dispatch({
        type: 'UPDATE_CATASTROPHE_CARD_METADATA',
        payload: {
          cardName: model.cardName,
          values: coerced
        }
      });
    }
  }

  const onClose = () => dispatch({ type: 'CLOSE_MODAL' });

  if (!model) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <MetadataModalHeader cardName={model.cardName} />
        {displayError && (
          <div className="modal-error" role="alert">
            {displayError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {model.fields.map((field) => (
            <EditableMetadataField
              key={field.key}
              field={field}
              cards={cards}
              scalarValues={values}
              arrayValues={arrayValues}
              playerCount={model.playerCount}
              selectedCatastrophes={model.selectedCatastrophes}
              playerCardNames={model.playerCardNames}
              allPlayerCardNames={model.allPlayerCardNames}
              onScalarChange={(key, v) =>
                setValuesAndClearError((prev) => ({ ...prev, [key]: v }))
              }
              onArraySlotChange={(key, slotIndex, v) =>
                setArrayValuesAndClearError((prev) => {
                  const row = [...(prev[key] ?? [])];
                  row[slotIndex] = v;
                  return { ...prev, [key]: row };
                })
              }
            />
          ))}

          <InternalMetadataSection
            fields={model.internalFields}
            values={model.internalValues}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={() => {
                clearError();
                onClose();
              }}
            >
              {hasEditableFields ? 'Cancel' : 'Close'}
            </button>
            {hasEditableFields && (
              <button type="submit" className="modal-save" disabled={!allValid}>
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface MetadataModalProps {
  state: AppState;
  gameScore: GameScore | null;
  cards: Map<string, Card>;
  dispatch: Dispatch<Action>;
}

export default function MetadataModal({
  state,
  gameScore,
  cards,
  dispatch
}: MetadataModalProps) {
  const selector: MetadataModalSelector | null = useMemo(
    () =>
      state.modal
        ? { kind: 'player-card', ...state.modal }
        : state.catastropheModal
          ? { kind: 'catastrophe', cardName: state.catastropheModal.cardName }
          : null,
    [state.modal, state.catastropheModal]
  );

  if (!selector) return null;

  const remountKey =
    state.modal != null
      ? `p-${state.modal.playerId}-${state.modal.cardIndex}`
      : `c-${state.catastropheModal!.cardName}`;

  return (
    <MetadataModalPanel
      key={remountKey}
      selector={selector}
      state={state}
      cards={cards}
      gameScore={gameScore}
      dispatch={dispatch}
    />
  );
}
