export function formatMetadataLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatInternalMetadataValue(
  value: string | number | string[] | undefined
): string {
  if (value === undefined) return '-';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
  return String(value);
}
