'use client';

import { useState } from 'react';
import XRayUploadSection from '@/components/x-ray-upload';
import DetectionViewer from '@/components/detection-viewer';
import TeethNumbering from '@/components/teeth-numbering';
import DataFilterPanel from '@/components/data-filter-panel';
import InteractiveControls from '@/components/interactive-controls';
import DataGallery from '@/components/data-gallery';
import DiseaseLegend from '@/components/disease-legend';
import type { ProcessedDetection, ToothDetection } from '@/lib/types';
import { ToothNumberingEntry } from '@/lib/utils';

interface SelectedXRayData {
  id: string;
  url: string;
  detections: ProcessedDetection[];
  toothDetections: ToothDetection[];
  toothDetectionsPolygons: ToothNumberingEntry;
}

interface GalleryImage {
  id: string;
  date: string;
  xrayUrl: string;
  findings: string;
  classes: string[];
}

export default function Home() {
  const [selectedXRay, setSelectedXRay] = useState<SelectedXRayData | null>(
    null
  );
  const [hoveredDisease, setHoveredDisease] = useState<string | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([
    'Healthy Teeth',
    'Caries',
    'Impacted Teeth',
    'BDC-BDR',
    'Infection',
    'Fractured Teeth'
  ]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredEnabled, setHoveredEnabled] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const [showTeethNumbering, setShowTeethNumbering] = useState(true);

  console.log(selectedXRay);

  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      date: '2024-01-15',
      xrayUrl: '/dental-xray-scan.jpg',
      findings: 'Healthy teeth with no abnormalities',
      classes: ['Healthy Teeth']
    },
    {
      id: '2',
      date: '2023-10-22',
      xrayUrl: '/dental-xray-with-caries.jpg',
      findings: '2 cavities detected in molars',
      classes: ['Caries']
    }
  ];

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const handleSelectAll = () => {
    setSelectedClasses([
      'Healthy Teeth',
      'Caries',
      'Impacted Teeth',
      'BDC-BDR',
      'Infection',
      'Fractured Teeth'
    ]);
  };

  const handleClearAll = () => {
    setSelectedClasses([]);
  };

  const onChangeShowTeethNumber = (showToothNumbering: boolean) => {
    setShowTeethNumbering(showToothNumbering);
  };

  // const handleSelectImage = (image: GalleryImage) => {
  //   setSelectedImageId(image.id);
  //   setSelectedXRay({
  //     id: image.id,
  //     url: image.xrayUrl,
  //     detections: [
  //       {
  //         id: '1',
  //         disease: 'Caries',
  //         bbox: { x: 0.2, y: 0.3, w: 0.12, h: 0.15 },
  //         confidence: 0.92,
  //         x1: 128,
  //         y1: 144,
  //         x2: 219,
  //         y2: 228
  //       }
  //     ],
  //     toothDetections: [
  //       {
  //         id: 'tooth_1',
  //         toothNumber: 11,
  //         bbox: { x: 0.15, y: 0.25, w: 0.08, h: 0.12 },
  //         confidence: 0.95
  //       }
  //     ]
  //   });
  // };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

      <div className="relative z-10">
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
                <span className="text-xs font-bold text-white">DAI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-blue-400 bg-clip-text text-transparent">
                  Danta AI
                </h1>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-xs font-mono text-primary neon-glow">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {!selectedXRay ? (
            <div className="">
              <XRayUploadSection onXRaySelected={setSelectedXRay} />
              {/* <div className="space-y-6"></div> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <button
                  onClick={() => setSelectedXRay(null)}
                  className="w-full px-4 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary hover:bg-primary/30 transition-colors font-mono text-sm neon-glow"
                >
                  Load Another X-ray
                </button>

                <TeethNumbering
                  hoveredTooth={hoveredTooth}
                  selectedTooth={selectedTooth}
                  onToothHover={setHoveredTooth}
                  onToothSelect={setSelectedTooth}
                  showTeethNumbering={showTeethNumbering}
                  onChangeShowTeethNumber={onChangeShowTeethNumber}
                />

                <DiseaseLegend onDiseaseHover={setHoveredDisease} />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <DetectionViewer
                  xrayUrl={selectedXRay.url}
                  detections={selectedXRay.detections}
                  toothDetections={selectedXRay.toothDetections}
                  hoveredDisease={hoveredDisease}
                  selectedClasses={selectedClasses}
                  zoomLevel={zoomLevel}
                  drawMode={drawMode}
                  toothDetectionPolygons={selectedXRay.toothDetectionsPolygons}
                  hoveredTooth={hoveredTooth}
                  showTeethNumbering={showTeethNumbering}
                />
              </div>

              <div className="lg:col-span-1 space-y-6">
                <InteractiveControls
                  zoomLevel={zoomLevel}
                  onZoomChange={setZoomLevel}
                  hoveredEnabled={hoveredEnabled}
                  onHoverToggle={() => setHoveredEnabled(!hoveredEnabled)}
                  drawMode={drawMode}
                  onDrawToggle={() => setDrawMode(!drawMode)}
                />

                <DataFilterPanel
                  selectedClasses={selectedClasses}
                  onClassToggle={handleClassToggle}
                  onSelectAll={handleSelectAll}
                  onClearAll={handleClearAll}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
