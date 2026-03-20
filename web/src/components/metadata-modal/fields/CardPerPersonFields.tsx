import { MetadataField } from "src/utils/cardMetadata";
import { PlayerCardSelectField } from "./PlayerCardSelectField";
import { Card, CardInstance, PLAYER_CARD_NAME, PlayerCard, TRAIT_CARD_TYPES } from "@scorer/types";

interface CardPerPersonFieldsProps {
  field: MetadataField;
  playerCount: number;
  allPlayerCardNames: [playerIndex: string, cardName: string][];
  cards: Map<string, Card>;
  values: string[];
  onSlotChange: (key: string, slotIndex: number, value: string) => void;
}

const getFaceValueforCards = (
  cards: Map<string, Card>,
  allPlayerCardNames: [playerIndex: string, cardName: string][],
  pos: number
): [number, string][] => {
  const playerCards = allPlayerCardNames
    .filter(([playerIndex, cardName]) =>
      cardName !== PLAYER_CARD_NAME && playerIndex === pos.toString()
    );

  return playerCards.map(([_, cardName]) => {
    const card = cards.get(cardName)! as PlayerCard;
    const cardInst = new CardInstance(card, {});
    card.calcA(cardInst, [], pos);
    return [cardInst.finalA, cardName];
  })
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
          (!field.trait || card.type.includes(field.trait as (typeof TRAIT_CARD_TYPES)[number]));
      })
      .map(([_, cardName]) => cardName)

    return [...(new Set(cardNames))]
     .sort((a, b) => a.localeCompare(b));
  }

  const allCards = () => Array.from(cards.values())
    .filter((card) =>
      !card.type.includes('catastrophe') &&
      card.name !== PLAYER_CARD_NAME &&
      (!field.trait || card.type.includes(field.trait as (typeof TRAIT_CARD_TYPES)[number]))
    )
    .map((card) => card.name)
    .sort((a, b) => a.localeCompare(b));

  const playerHighestValueCards = (pos: number) => {
    const cardValues = getFaceValueforCards(cards, allPlayerCardNames, pos);

    const cardMaxValue = Math.max(...cardValues.map(([value, _cardName]) => value));
    return cardValues
      .filter(([value, _cardName]) => value === cardMaxValue)
      .map(([_, cardName]) => cardName);
  }

  const playerValueOver4Cards = (pos: number) => {
    const cardValues = getFaceValueforCards(cards, allPlayerCardNames, pos);

    return cardValues
      .filter(([value, _cardName]) => value >= 4)
      .map(([_, cardName]) => cardName);
  }

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
          {field.source === 'custom' && field.trait === 'player_highest_value' &&
            (<PlayerCardSelectField
              id={`meta-${fieldKey}-${pos}`}
              fieldKey={fieldKey}
              value={values[pos] ?? ''}
              options={playerHighestValueCards(pos)}
              onChange={(key: string, v: string) => onSlotChange(key, pos, v)}
            />)}
          {field.source === 'custom' && field.trait === 'player_value_over_4' &&
            (<PlayerCardSelectField
              id={`meta-${fieldKey}-${pos}`}
              fieldKey={fieldKey}
              value={values[pos] ?? ''}
              options={playerValueOver4Cards(pos)}
              onChange={(key: string, v: string) => onSlotChange(key, pos, v)}
            />)}
        </label>
      ))}
    </>
  );
}
