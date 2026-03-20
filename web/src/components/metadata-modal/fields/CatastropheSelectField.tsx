import type { CardEntry } from '../../../types';

interface CatastropheSelectFieldProps {
  id: string;
  fieldKey: string;
  value: string;
  selectedCatastrophes: CardEntry[];
  onChange: (key: string, value: string) => void;
}

export function CatastropheSelectField({
  id,
  fieldKey,
  value,
  selectedCatastrophes,
  onChange
}: CatastropheSelectFieldProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
    >
      <option value="">Select...</option>
      {[0, 1, 2, 3].map((position) => (
        <option key={`catastrophe-${position}`} value={position}>
          {selectedCatastrophes[position]
            ? selectedCatastrophes[position].name
            : `Catastrophe ${position + 1}`}
        </option>
      ))}
    </select>
  );
}
