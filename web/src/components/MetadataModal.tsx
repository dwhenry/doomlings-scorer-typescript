import { useState, useEffect } from 'react';
import { TRAIT_CARD_TYPES } from '@scorer/types';
import type { MetadataField } from '../utils/cardMetadata';
import type { PlayerCardEntry } from '../types';

interface MetadataModalProps {
  cardName: string;
  selectedCatastrophes: string[];
  playerCardNames: string[];
  fields: MetadataField[];
  internalFields: MetadataField[];
  internalValues: Record<string, string | number | string[]>;
  currentValues: PlayerCardEntry;
  onSave: (values: Record<string, string | number>) => void;
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
  fields,
  internalFields,
  internalValues,
  currentValues,
  onSave,
  onClose
}: MetadataModalProps) {
  const [values, setValues] = useState<Record<string, string | number>>({});
  const hasEditableFields = fields.length > 0;

  useEffect(() => {
    const initial: Record<string, string | number> = {};
    fields.forEach((f) => {
      const existing = currentValues[f.key];
      if (existing !== undefined && existing !== '') {
        initial[f.key] = existing as string | number;
      }
    });
    setValues(initial);
  }, [fields, currentValues]);

  const allValid = fields.every((f) => {
    const val = values[f.key];
    if (val === undefined || val === '') return false;
    if (f.type === 'number' || f.type === 'catastrophe')
      return typeof val === 'number' || !isNaN(Number(val));
    return true;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasEditableFields) {
      onClose();
      return;
    }
    if (!allValid) return;
    const coerced: Record<string, string | number> = {};
    fields.forEach((f) => {
      const val = values[f.key];
      coerced[f.key] = f.type === 'number' ? Number(val) : val;
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
                      {selectedCatastrophes[position] ||
                        `Catastrophe ${position + 1}`}
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
