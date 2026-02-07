import { useState, useEffect } from 'react';
import { TRAIT_CARD_TYPES } from '@scorer/types';
import type { MetadataField } from '../utils/cardMetadata';
import type { PlayerCardEntry } from '../types';

interface MetadataModalProps {
  cardName: string;
  fields: MetadataField[];
  currentValues: PlayerCardEntry;
  onSave: (values: Record<string, string | number>) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = TRAIT_CARD_TYPES.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MetadataModal({
  cardName,
  fields,
  currentValues,
  onSave,
  onClose,
}: MetadataModalProps) {
  const [values, setValues] = useState<Record<string, string | number>>({});

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
    if (f.type === 'number') return typeof val === 'number' || !isNaN(Number(val));
    return true;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
              {field.type === 'number' ? (
                <input
                  id={`meta-${field.key}`}
                  type="number"
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [field.key]: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />
              ) : (
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
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-save" disabled={!allValid}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
