import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type SetStateAction
} from 'react';
import type { MetadataField } from '../../utils/cardMetadata';
import type { CardEntry } from '../../types';
import {
  buildMetadataModalViewModel,
  type MetadataModalGameContext,
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

interface MetadataModalProps {
  selector: MetadataModalSelector | null;
  game: MetadataModalGameContext;
  onSave: (payload: MetadataModalSavePayload) => void;
  onClose: () => void;
  onClearError?: () => void;
}

export default function MetadataModal({
  selector,
  game,
  onSave,
  onClose,
  onClearError
}: MetadataModalProps) {
  const model = useMemo(
    () => (selector ? buildMetadataModalViewModel(selector, game) : null),
    [
      selector,
      game.players,
      game.selectedCatastrophes,
      game.playerCount,
      game.selectedPlayerId,
      game.catastropheMetadata,
      game.gameScore
    ]
  );

  const [values, setValues] = useState<Record<string, string | number>>({});
  const [arrayValues, setArrayValues] = useState<Record<string, string[]>>({});

  const currentValues: CardEntry | undefined = model?.currentValues;
  const fields: MetadataField[] = model?.fields ?? [];
  const cardName = model?.cardName ?? '';

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
      onClearError?.();
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
      onClose();
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
      onSave({
        kind: 'player-card',
        playerId: model.playerId,
        cardIndex: model.cardIndex,
        cardName: model.cardName,
        scope: model.saveScope,
        values: coerced
      });
    } else {
      onSave({
        kind: 'catastrophe',
        cardName: model.cardName,
        values: coerced
      });
    }
  }

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
