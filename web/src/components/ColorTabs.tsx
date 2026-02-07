import type { CardType } from '../types';

export type TabId = CardType | 'catastrophe';

interface TabDef {
  id: TabId;
  label: string;
  color: string;
}

const TABS: TabDef[] = [
  { id: 'purple', label: 'Purple', color: '#6f42c1' },
  { id: 'red', label: 'Red', color: '#dc3545' },
  { id: 'green', label: 'Green', color: '#28a745' },
  { id: 'blue', label: 'Blue', color: '#007bff' },
  { id: 'colourless', label: 'Colourless', color: '#6c757d' },
  { id: 'catastrophe', label: 'Catastrophe', color: '#ffc107' },
];

interface ColorTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function ColorTabs({ activeTab, onTabChange }: ColorTabsProps) {
  return (
    <div className="color-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`color-tab${activeTab === tab.id ? ' color-tab--active' : ''}`}
          style={activeTab === tab.id ? { borderColor: tab.color, backgroundColor: tab.color, color: 'white' } : undefined}
          onClick={() => onTabChange(tab.id)}
        >
          <span
            className="color-tab-dot"
            style={{ backgroundColor: tab.color }}
          />
          <span className="color-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
