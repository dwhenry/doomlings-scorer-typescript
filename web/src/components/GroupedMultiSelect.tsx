import { useState, useRef, useEffect } from 'react';

export interface GroupOption {
  release: string;
  collections: string[];
}

interface GroupedMultiSelectProps {
  /** Groups: release first, then list of collections */
  groups: GroupOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Format option value for selection (e.g. "release|collection") */
  optionValue: (release: string, collection: string) => string;
  /** Optional label for the control */
  label?: string;
}

export default function GroupedMultiSelect({
  groups,
  selected,
  onChange,
  optionValue,
  label
}: GroupedMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function toggleOption(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function displayText() {
    if (selected.length === 0) return 'Select';
    if (selected.length > 2) {
      return (
        selected.slice(0, 2).join(', ') + ` [+ ${selected.length - 2} more]`
      );
    }
    return selected.join(', ');
  }

  return (
    <div
      ref={wrapperRef}
      className={`multiselect grouped${open ? ' active' : ''}${selected.length > 0 ? ' selection' : ''}`}
    >
      {label && (
        <label className="pack-filter-label">{label}</label>
      )}
      <div className="title" onClick={() => setOpen(!open)}>
        <span className="text" title={selected.join(', ')}>
          {displayText()}
        </span>
        {selected.length > 0 && (
          <span
            className="close-icon"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          >
            &times;
          </span>
        )}
        <span className="expand-icon">&#9660;</span>
      </div>
      <div className="options grouped-options">
        {groups.map(({ release, collections }) => (
          <div key={release} className="option-group">
            <div className="option-group-label">{release}</div>
            {collections.map((collection) => {
              const value = optionValue(release, collection);
              return (
                <div
                  key={value}
                  className={`option${selected.includes(value) ? ' selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(value);
                  }}
                >
                  {collection}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
