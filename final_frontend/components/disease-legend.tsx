'use client';

import { useState } from 'react';

interface DiseaseLegendProps {
  onDiseaseHover: (disease: string | null) => void;
}

const diseases = [
  { name: 'Healthy Teeth', color: '#26d946', description: 'No abnormalities' },
  { name: 'Caries', color: '#ff7f00', description: 'Tooth decay' },
  { name: 'Impacted Teeth', color: '#ff0000', description: 'Impacted teeth' },
  { name: 'BDC-BDR', color: '#c127d9', description: 'Bone density' },
  { name: 'Infection', color: '#ff0000', description: 'Infection detected' },
  { name: 'Fractured Teeth', color: '#00d9ff', description: 'Tooth fracture' }
];

export default function DiseaseLegend({ onDiseaseHover }: DiseaseLegendProps) {
  const [hoveredDisease, setHoveredDisease] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
        Detection Classes
      </h3>

      <div className="space-y-3">
        {diseases.map(disease => (
          <div
            key={disease.name}
            onMouseEnter={() => {
              setHoveredDisease(disease.name);
              onDiseaseHover(disease.name);
            }}
            onMouseLeave={() => {
              setHoveredDisease(null);
              onDiseaseHover(null);
            }}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              hoveredDisease === disease.name
                ? 'bg-card border-primary/60 scale-105'
                : 'bg-transparent border-primary/20 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full neon-glow flex-shrink-0"
                style={{ backgroundColor: disease.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {disease.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {disease.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
