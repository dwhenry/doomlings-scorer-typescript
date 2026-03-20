import { PLAYER_CARD_NAME } from "@scorer/types";

interface PlayerCardSelectFieldProps {
  id: string;
  fieldKey: string;
  value: string;
  options: string[];
  onChange: (key: string, value: string) => void;
}

export function PlayerCardSelectField({
  id,
  fieldKey,
  value,
  options,
  onChange
}: PlayerCardSelectFieldProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
    >
      <option value="">Select...</option>
      {options.map((name, position) => (
        name !== PLAYER_CARD_NAME &&
        (<option key={`card-${position}`} value={name}>
          {name}
        </option>)
      ))}
    </select>
  );
}
