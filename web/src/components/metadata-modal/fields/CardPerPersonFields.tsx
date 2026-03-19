interface CardPerPersonFieldsProps {
  fieldKey: string;
  playerCount: number;
  values: string[];
  onSlotChange: (key: string, slotIndex: number, value: string) => void;
}

export function CardPerPersonFields({
  fieldKey,
  playerCount,
  values,
  onSlotChange
}: CardPerPersonFieldsProps) {
  return (
    <>
      {Array.from({ length: playerCount }, (_, pos) => pos).map((pos) => (
        <label key={`${fieldKey}-${pos}`}>
          Player {pos + 1}:
          <input
            id={`meta-${fieldKey}-${pos}`}
            type="number"
            value={values[pos] ?? ''}
            onChange={(e) => onSlotChange(fieldKey, pos, e.target.value)}
          />
        </label>
      ))}
    </>
  );
}
