import type { MetadataField } from '../../utils/cardMetadata';
import type { CardEntry } from '../../types';
import { formatMetadataLabel } from './formatters';
import { AnyPlayerCardSelectField } from './fields/AnyPlayerCardSelectField';
import { CatastropheSelectField } from './fields/CatastropheSelectField';
import { CardPerPersonFields } from './fields/CardPerPersonFields';
import { NumberMetadataField } from './fields/NumberMetadataField';
import { PlayerCardSelectField } from './fields/PlayerCardSelectField';
import { TraitColorSelectField } from './fields/TraitColorSelectField';

interface EditableMetadataFieldProps {
  field: MetadataField;
  scalarValues: Record<string, string | number>;
  arrayValues: Record<string, string[]>;
  playerCount: number;
  selectedCatastrophes: CardEntry[];
  playerCardNames: string[];
  allPlayerCardNames: [playerIndex: string, cardName: string][];
  onScalarChange: (key: string, value: string | number | '') => void;
  onArraySlotChange: (key: string, slotIndex: number, value: string) => void;
}

export function EditableMetadataField({
  field,
  scalarValues,
  arrayValues,
  playerCount,
  selectedCatastrophes,
  playerCardNames,
  allPlayerCardNames,
  onScalarChange,
  onArraySlotChange
}: EditableMetadataFieldProps) {
  const id = `meta-${field.key}`;

  return (
    <div className="modal-field">
      <label htmlFor={id}>
        {formatMetadataLabel(field.key)}
        <span className="field-scope">{field.scope}</span>
      </label>
      {field.type === 'catastrophe' && (
        <CatastropheSelectField
          id={id}
          fieldKey={field.key}
          value={(scalarValues[field.key] as string) ?? ''}
          selectedCatastrophes={selectedCatastrophes}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'player_card' && (
        <PlayerCardSelectField
          id={id}
          fieldKey={field.key}
          value={(scalarValues[field.key] as string) ?? ''}
          options={playerCardNames}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'any_player_card' && (
        <AnyPlayerCardSelectField
          id={id}
          fieldKey={field.key}
          value={(scalarValues[field.key] as string) ?? ''}
          options={allPlayerCardNames}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'number' && (
        <NumberMetadataField
          id={id}
          fieldKey={field.key}
          value={scalarValues[field.key] ?? ''}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'trait' && (
        <TraitColorSelectField
          id={id}
          fieldKey={field.key}
          value={(scalarValues[field.key] as string) ?? ''}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'card_type' && (
        <TraitColorSelectField
          id={id}
          fieldKey={field.key}
          value={(scalarValues[field.key] as string) ?? ''}
          onChange={(key, v) => onScalarChange(key, v)}
        />
      )}
      {field.type === 'card_per_person' && (
        <CardPerPersonFields
          fieldKey={field.key}
          playerCount={playerCount}
          values={arrayValues[field.key] ?? []}
          onSlotChange={onArraySlotChange}
        />
      )}
    </div>
  );
}
