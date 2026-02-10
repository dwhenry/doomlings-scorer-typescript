import { useState, useEffect } from 'react';
import { Card, TRAIT_CARD_TYPES } from '@scorer/types';
import type { MetadataField } from '../utils/cardMetadata';
import type { CardEntry } from '../types';

interface MetadataModalProps {
  cardName: string;
  selectedCatastrophes: CardEntry[];
  playerCardNames: string[];
  allPlayerCardNames: [playerIndex: string, cardName: string][];
  playerCount: number;
  fields: MetadataField[];
  internalFields: MetadataField[];
  internalValues: Record<string, string | number | string[]>;
  currentValues: CardEntry;
  onSave: (values: Record<string, string | number | string[]>) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = TRAIT_CARD_TYPES.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1)
}));

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatInternalValue(
  value: string | number | string[] | undefined
): string {
  if (value === undefined) return '-';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
  return String(value);
}

export default function MetadataModal({
  cardName,
  selectedCatastrophes,
  playerCardNames,
  allPlayerCardNames,
  playerCount,
  fields,
  internalFields,
  internalValues,
  currentValues,
  onSave,
  onClose
}: MetadataModalProps) {
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [arrayValues, setArrayValues] = useState<Record<string, string[]>>({});

  const hasEditableFields = fields.length > 0;

  useEffect(() => {
    const initial: Record<string, string | number> = {};
    const initialArray: Record<string, string[]> = {};
    fields.forEach((f) => {
      if (f.type === 'card_per_person') {
        const existing = currentValues[f.key];
        if (existing !== undefined && existing !== '') {
          initialArray[f.key] = existing as string[];
        } else {
          initialArray[f.key] = Array.from(
            { length: playerCount },
            (_, pos) => pos
          ).map(() => '');
        }
      } else {
        const existing = currentValues[f.key];
        if (existing !== undefined && existing !== '') {
          initial[f.key] = existing as string | number;
        }
      }
    });
    setValues(initial);
    setArrayValues(initialArray);
  }, [fields, currentValues]);

  const allValid = fields.every((f) => {
    const val = values[f.key];
    if (val) {
      if (val === '') return false;
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasEditableFields) {
      onClose();
      return;
    }
    if (!allValid) return;
    const coerced: Record<string, string | number | string[]> = {};
    fields.forEach((f) => {
      const val = values[f.key];
      if (val) {
        coerced[f.key] = f.type === 'number' ? Number(val) : val;
      }
      const arrayVal = arrayValues[f.key];
      if (arrayVal) {
        coerced[f.key] = arrayVal;
      }
    });
    onSave(coerced);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <img
            src={`/cards/${encodeURIComponent(cardName)}.small.png`}
            alt={cardName}
            className="modal-card-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h3>{cardName}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} className="modal-field">
              <label htmlFor={`meta-${field.key}`}>
                {formatLabel(field.key)}
                <span className="field-scope">{field.scope}</span>
              </label>
              {field.type === 'catastrophe' && (
                <select
                  id={`meta-${field.key}`}
                  value={(values[field.key] as string) ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {[0, 1, 2, 3].map((position) => (
                    <option key={`catastrophe-${position}`} value={position}>
                      {/* populate the catastrophe name here from the index if it
                      has been selected */}
                      {selectedCatastrophes[position]
                        ? selectedCatastrophes[position].name
                        : `Catastrophe ${position + 1}`}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'player_card' && (
                <select
                  id={`meta-${field.key}`}
                  value={(values[field.key] as string) ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {playerCardNames.map((cardName, position) => (
                    <option key={`card-${position}`} value={cardName}>
                      {cardName}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'any_player_card' && (
                <select
                  id={`meta-${field.key}`}
                  value={(values[field.key] as string) ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {allPlayerCardNames.map(
                    ([playerIndex, cardName], position) => (
                      <option
                        key={`card-${position}`}
                        value={[playerIndex, cardName]}
                      >
                        Player {Number(playerIndex) + 1}: {cardName}
                      </option>
                    )
                  )}
                </select>
              )}
              {field.type === 'number' && (
                <input
                  id={`meta-${field.key}`}
                  type="number"
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [field.key]:
                        e.target.value === '' ? '' : Number(e.target.value)
                    }))
                  }
                />
              )}
              {field.type === 'trait' && (
                <select
                  id={`meta-${field.key}`}
                  value={(values[field.key] as string) ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'card_per_person' &&
                Array.from({ length: playerCount }, (_, pos) => pos).map(
                  (pos) => {
                    if (!arrayValues[field.key]) arrayValues[field.key] = [];
                    return (
                      <label>
                        Player {pos + 1}:
                        <input
                          id={`meta-${field.key}-${pos}`}
                          type="number"
                          value={arrayValues[field.key][pos] ?? ''}
                          onChange={(e) =>
                            setArrayValues((v) => {
                              const newValues = [...v[field.key]];
                              newValues[pos] = e.target.value;
                              return {
                                ...v,
                                [field.key]: newValues
                              };
                            })
                          }
                        />
                      </label>
                    );
                  }
                )}
            </div>
          ))}

          {internalFields.length > 0 && (
            <div className="modal-internal-section">
              <div className="modal-internal-header">Engine Generated</div>
              {internalFields.map((field) => (
                <div
                  key={field.key}
                  className="modal-field modal-field--internal"
                >
                  <label>
                    {formatLabel(field.key)}
                    <span className="field-scope field-scope--internal">
                      internal
                    </span>
                  </label>
                  <div className="modal-internal-value">
                    {formatInternalValue(internalValues[field.key])}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
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
