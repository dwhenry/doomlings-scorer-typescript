import { METADATA_COLOR_OPTIONS } from '../constants';

interface TraitColorSelectFieldProps {
  id: string;
  fieldKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

export function TraitColorSelectField({
  id,
  fieldKey,
  value,
  onChange
}: TraitColorSelectFieldProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
    >
      <option value="">Select...</option>
      {METADATA_COLOR_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
