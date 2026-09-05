'use client';

import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

const DISEASE_CLASSES = [
  { id: 'healthy', name: 'Healthy Teeth', color: '#26d946' },
  { id: 'caries', name: 'Caries', color: '#ff7f00' },
  { id: 'impacted', name: 'Impacted Teeth', color: '#ff0000' },
  { id: 'bdc', name: 'BDC-BDR', color: '#c127d9' },
  { id: 'infection', name: 'Infection', color: '#ff0000' },
  { id: 'fractured', name: 'Fractured Teeth', color: '#00d9ff' }
];

interface DataFilterPanelProps {
  selectedClasses: string[];
  onClassToggle: (classId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export default function DataFilterPanel({
  selectedClasses,
  onClassToggle,
  onSelectAll,
  onClearAll
}: DataFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-0 py-0 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Class Filters
          </h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-primary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-3">
          {DISEASE_CLASSES.map(disease => (
            <label
              key={disease.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedClasses.includes(disease.name)}
                onChange={() => onClassToggle(disease.name)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <div
                className="w-3 h-3 rounded-full neon-glow flex-shrink-0"
                style={{ backgroundColor: disease.color }}
              />
              <span className="text-xs font-semibold text-foreground flex-1">
                {disease.name}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {selectedClasses.includes(disease.name) ? 'on' : 'off'}
              </span>
            </label>
          ))}

          <div className="flex gap-2 pt-2 border-t border-primary/20">
            <button
              onClick={onSelectAll}
              className="flex-1 px-3 py-2 text-xs font-mono bg-primary/20 border border-primary/50 rounded hover:bg-primary/30 transition-colors text-primary"
            >
              All
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 px-3 py-2 text-xs font-mono bg-primary/20 border border-primary/50 rounded hover:bg-primary/30 transition-colors text-primary"
            >
              None
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
        <p>
          <span className="text-primary font-semibold">
            {selectedClasses.length}
          </span>{' '}
          of{' '}
          <span className="text-primary font-semibold">
            {DISEASE_CLASSES.length}
          </span>{' '}
          classes selected
        </p>
      </div>
    </div>
  );
}
