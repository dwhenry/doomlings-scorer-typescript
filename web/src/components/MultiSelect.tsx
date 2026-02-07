import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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
      return selected.slice(0, 2).join(', ') + ` [+ ${selected.length - 2} more]`;
    }
    return selected.join(', ');
  }

  return (
    <div
      ref={wrapperRef}
      className={`multiselect${open ? ' active' : ''}${selected.length > 0 ? ' selection' : ''}`}
    >
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
      <div className="options">
        {options.map((opt) => (
          <div
            key={opt}
            className={`option${selected.includes(opt) ? ' selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleOption(opt);
            }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}
