interface NumberMetadataFieldProps {
  id: string;
  fieldKey: string;
  value: string | number | '';
  onChange: (key: string, value: string | number | '') => void;
}

export function NumberMetadataField({
  id,
  fieldKey,
  value,
  onChange
}: NumberMetadataFieldProps) {
  return (
    <input
      id={id}
      type="number"
      value={value}
      onChange={(e) =>
        onChange(
          fieldKey,
          e.target.value === '' ? '' : Number(e.target.value)
        )
      }
    />
  );
}
