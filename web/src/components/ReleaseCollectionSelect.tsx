import { useState, useRef, useEffect } from 'react';
import type { ReleaseType, CollectionType } from '@scorer/types';
import { RELEASE_TYPES, COLLECTION_TYPES } from '@scorer/types';

export type FilterMode = 'releases' | 'collections';

interface ReleaseCollectionSelectProps {
  selectedReleases: string[];
  selectedCollections: string[];
  onChange: (releases: string[], collections: string[]) => void;
  label?: string;
}

export default function ReleaseCollectionSelect({
  selectedReleases,
  selectedCollections,
  onChange,
  label
}: ReleaseCollectionSelectProps) {
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

  const hasSelection = selectedReleases.length > 0 || selectedCollections.length > 0;

  function toggleRelease(value: ReleaseType) {
    if (selectedReleases.includes(value)) {
      onChange(selectedReleases.filter((r) => r !== value), []);
    } else {
      onChange([...selectedReleases, value], []);
    }
  }

  function toggleCollection(value: CollectionType) {
    if (selectedCollections.includes(value)) {
      onChange([], selectedCollections.filter((c) => c !== value));
    } else {
      onChange([], [...selectedCollections, value]);
    }
  }

  function displayText() {
    if (!hasSelection) return 'Select';
    if (selectedReleases.length > 0) {
      if (selectedReleases.length > 2) {
        return `${selectedReleases.slice(0, 2).join(', ')} [+ ${selectedReleases.length - 2} more]`;
      }
      return selectedReleases.join(', ');
    }
    if (selectedCollections.length > 2) {
      return `${selectedCollections.slice(0, 2).join(', ')} [+ ${selectedCollections.length - 2} more]`;
    }
    return selectedCollections.join(', ');
  }

  return (
    <div
      ref={wrapperRef}
      className={`multiselect grouped${open ? ' active' : ''}${hasSelection ? ' selection' : ''}`}
    >
      {label && (
        <label className="pack-filter-label">{label}</label>
      )}
      <div className="title" onClick={() => setOpen(!open)}>
        <span className="text" title={displayText()}>
          {displayText()}
        </span>
        {hasSelection && (
          <span
            className="close-icon"
            onClick={(e) => {
              e.stopPropagation();
              onChange([], []);
            }}
          >
            &times;
          </span>
        )}
        <span className="expand-icon">&#9660;</span>
      </div>
      <div className="options grouped-options">
        <div className="option-group">
          <div className="option-group-label">Releases</div>
          {(RELEASE_TYPES as readonly string[]).map((release) => (
            <div
              key={release}
              className={`option${selectedReleases.includes(release) ? ' selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleRelease(release as ReleaseType);
              }}
            >
              {release}
            </div>
          ))}
        </div>
        <div className="option-group">
          <div className="option-group-label">Collections</div>
          {(COLLECTION_TYPES as readonly string[]).map((collection) => (
            <div
              key={collection}
              className={`option${selectedCollections.includes(collection) ? ' selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleCollection(collection as CollectionType);
              }}
            >
              {collection}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
