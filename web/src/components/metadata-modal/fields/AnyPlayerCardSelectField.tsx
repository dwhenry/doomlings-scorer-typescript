import { PLAYER_CARD_NAME } from "@scorer/types";

interface AnyPlayerCardSelectFieldProps {
  id: string;
  fieldKey: string;
  value: string;
  options: [playerIndex: string, cardName: string][];
  onChange: (key: string, value: string) => void;
}

export function AnyPlayerCardSelectField({
  id,
  fieldKey,
  value,
  options,
  onChange
}: AnyPlayerCardSelectFieldProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
    >
      <option value="">Select...</option>
      {options.map(([playerIndex, cardName], position) => (
        cardName !== PLAYER_CARD_NAME &&
        (<option
          key={`card-${position}`}
          // HTML option values are strings; tuple matches how this metadata is stored at runtime.
          value={[playerIndex, cardName] as unknown as string}
        >
          Player {Number(playerIndex) + 1}: {cardName}
        </option>)
      ))}
    </select>
  );
}
