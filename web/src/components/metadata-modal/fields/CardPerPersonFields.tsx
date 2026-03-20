import { MetadataField } from "src/utils/cardMetadata";
import { PlayerCardSelectField } from "./PlayerCardSelectField";
import { Card, PLAYER_CARD_NAME } from "@scorer/types";

interface CardPerPersonFieldsProps {
  field: MetadataField;
  playerCount: number;
  allPlayerCardNames: [playerIndex: string, cardName: string][];
  cards: Map<string, Card>;
  values: string[];
  onSlotChange: (key: string, slotIndex: number, value: string) => void;
}

export function CardPerPersonFields({
  field,
  playerCount,
  allPlayerCardNames,
  cards,
  values,
  onSlotChange
}: CardPerPersonFieldsProps) {
  const fieldKey = field.key;
  // TODO: filter by trait if present
  const playerCardNames  = (pos: number) => {
    const cardNames = allPlayerCardNames
      .filter(([playerIndex, cardName]) => {
        console.log('filtering cards')
        const card = cards.get(cardName)!;
        return cardName !== PLAYER_CARD_NAME &&
          playerIndex === pos.toString() &&
          (!field.trait || card.type.includes(field.trait));
      })
      .map(([_, cardName]) => cardName)

    return [...(new Set(cardNames))]
     .sort((a, b) => a.localeCompare(b));
  }

  const allCards = () => Array.from(cards.values())
    .filter((card) =>
      !card.type.includes('catastrophe') &&
      card.name !== PLAYER_CARD_NAME &&
      (!field.trait || card.type.includes(field.trait))
    )
    .map((card) => card.name)
    .sort((a, b) => a.localeCompare(b));

  return (
    <>
      {Array.from({ length: playerCount }, (_, pos) => pos).map((pos) => (
        <label key={`${fieldKey}-${pos}`}>
          Player {pos + 1}:
          {!field.source &&
          (<input
            id={`meta-${fieldKey}-${pos}`}
            type="number"
            value={values[pos] ?? ''}
            onChange={(e) => onSlotChange(fieldKey, pos, e.target.value)}
          />)}
          {field.source === 'player' &&
            (<PlayerCardSelectField
              id={`meta-${fieldKey}-${pos}`}
              fieldKey={fieldKey}
              value={values[pos] ?? ''}
              options={playerCardNames(pos)}
              onChange={(key: string, v: string) => onSlotChange(key, pos, v)}
            />)}
          {field.source === 'deck' &&
            (<PlayerCardSelectField
              id={`meta-${fieldKey}-${pos}`}
              fieldKey={fieldKey}
              value={values[pos] ?? ''}
              options={allCards()}
              onChange={(key: string, v: string) => onSlotChange(key, pos, v)}
            />)}
        </label>
      ))}
    </>
  );
}
