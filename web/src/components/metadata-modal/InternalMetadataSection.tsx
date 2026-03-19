import type { MetadataField } from '../../utils/cardMetadata';
import { formatInternalMetadataValue, formatMetadataLabel } from './formatters';

interface InternalMetadataSectionProps {
  fields: MetadataField[];
  values: Record<string, string | number | string[]>;
}

export function InternalMetadataSection({
  fields,
  values
}: InternalMetadataSectionProps) {
  if (fields.length === 0) return null;

  return (
    <div className="modal-internal-section">
      <div className="modal-internal-header">Engine Generated</div>
      {fields.map((field) => (
        <div key={field.key} className="modal-field modal-field--internal">
          <label>
            {formatMetadataLabel(field.key)}
            <span className="field-scope field-scope--internal">internal</span>
          </label>
          <div className="modal-internal-value">
            {formatInternalMetadataValue(values[field.key])}
          </div>
        </div>
      ))}
    </div>
  );
}
