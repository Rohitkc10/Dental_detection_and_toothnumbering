'use client';

import { useState } from 'react';

const FDI_TEETH_DATA = [
  // Upper right quadrant
  { number: 18, position: 'upper-right', name: '3rd Molar' },
  { number: 17, position: 'upper-right', name: '2nd Molar' },
  { number: 16, position: 'upper-right', name: '1st Molar' },
  { number: 15, position: 'upper-right', name: '2nd Premolar' },
  { number: 14, position: 'upper-right', name: '1st Premolar' },
  { number: 13, position: 'upper-right', name: 'Canine' },
  { number: 12, position: 'upper-right', name: 'Lateral Incisor' },
  { number: 11, position: 'upper-right', name: 'Central Incisor' },
  // Upper left quadrant
  { number: 21, position: 'upper-left', name: 'Central Incisor' },
  { number: 22, position: 'upper-left', name: 'Lateral Incisor' },
  { number: 23, position: 'upper-left', name: 'Canine' },
  { number: 24, position: 'upper-left', name: '1st Premolar' },
  { number: 25, position: 'upper-left', name: '2nd Premolar' },
  { number: 26, position: 'upper-left', name: '1st Molar' },
  { number: 27, position: 'upper-left', name: '2nd Molar' },
  { number: 28, position: 'upper-left', name: '3rd Molar' },
  // Lower left quadrant
  { number: 38, position: 'lower-left', name: '3rd Molar' },
  { number: 37, position: 'lower-left', name: '2nd Molar' },
  { number: 36, position: 'lower-left', name: '1st Molar' },
  { number: 35, position: 'lower-left', name: '2nd Premolar' },
  { number: 34, position: 'lower-left', name: '1st Premolar' },
  { number: 33, position: 'lower-left', name: 'Canine' },
  { number: 32, position: 'lower-left', name: 'Lateral Incisor' },
  { number: 31, position: 'lower-left', name: 'Central Incisor' },
  // Lower right quadrant
  { number: 41, position: 'lower-right', name: 'Central Incisor' },
  { number: 42, position: 'lower-right', name: 'Lateral Incisor' },
  { number: 43, position: 'lower-right', name: 'Canine' },
  { number: 44, position: 'lower-right', name: '1st Premolar' },
  { number: 45, position: 'lower-right', name: '2nd Premolar' },
  { number: 46, position: 'lower-right', name: '1st Molar' },
  { number: 47, position: 'lower-right', name: '2nd Molar' },
  { number: 48, position: 'lower-right', name: '3rd Molar' }
];

interface TeethNumberingProps {
  hoveredTooth?: number | null;
  selectedTooth?: number | null;
  onToothHover?: (tooth: number | null) => void;
  onToothSelect?: (tooth: number) => void;
  showTeethNumbering: boolean;
  onChangeShowTeethNumber: (showToothNumbering: boolean) => void;
}

export default function TeethNumbering({
  hoveredTooth,
  selectedTooth,
  onToothHover,
  onToothSelect,
  showTeethNumbering,
  onChangeShowTeethNumber
}: TeethNumberingProps) {
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);

  const quadrants = [
    {
      key: 'upper-right',
      label: 'Upper Right',
      teeth: FDI_TEETH_DATA.filter(t => t.position === 'upper-right')
    },
    {
      key: 'upper-left',
      label: 'Upper Left',
      teeth: FDI_TEETH_DATA.filter(t => t.position === 'upper-left')
    },
    {
      key: 'lower-left',
      label: 'Lower Left',
      teeth: FDI_TEETH_DATA.filter(t => t.position === 'lower-left')
    },
    {
      key: 'lower-right',
      label: 'Lower Right',
      teeth: FDI_TEETH_DATA.filter(t => t.position === 'lower-right')
    }
  ];

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          FDI Tooth Numbering
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          32 Teeth
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="checkbox"
          name="showTeethNumbering"
          id="showTeethNumbering"
          checked={showTeethNumbering}
          onChange={e => onChangeShowTeethNumber(e.target.checked)}
        />
        <label htmlFor="showTeethNumbering">Tooth Numbering</label>
      </div>

      {/* Tooth diagram representation */}
      <div className="space-y-3">
        {quadrants.map(quadrant => (
          <div
            key={quadrant.key}
            className="border border-primary/20 rounded-lg overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedQuadrant(
                  expandedQuadrant === quadrant.key ? null : quadrant.key
                )
              }
              className="w-full px-4 py-3 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors text-left"
            >
              <span className="text-xs font-bold text-foreground">
                {quadrant.label}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {quadrant.teeth.length} teeth
              </span>
            </button>

            {expandedQuadrant === quadrant.key && (
              <div className="px-4 py-3 bg-card/30 grid grid-cols-4 gap-2 border-t border-primary/20">
                {quadrant.teeth.map(tooth => (
                  <button
                    key={tooth.number}
                    onMouseEnter={() => onToothHover?.(tooth.number)}
                    onMouseLeave={() => onToothHover?.(null)}
                    onClick={() => onToothSelect?.(tooth.number)}
                    className={`p-2 rounded-lg border transition-all duration-200 text-center text-xs font-bold ${
                      selectedTooth === tooth.number
                        ? 'bg-primary/40 border-primary/80 scale-105'
                        : hoveredTooth === tooth.number
                        ? 'bg-primary/20 border-primary/60 scale-105'
                        : 'bg-primary/5 border-primary/20 hover:border-primary/40'
                    }`}
                    title={tooth.name}
                  >
                    <span className="text-primary neon-glow">
                      {tooth.number}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-semibold">FDI System:</span>{' '}
          International tooth numbering using quadrant (1-4) and position (1-8)
        </p>
      </div>
    </div>
  );
}
