'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  convertYOLODetections,
  convertYOLOTeethDetections,
  removeDuplicateTeeth,
  ToothData,
  ToothNumberingEntry
} from '@/lib/utils';
import type {
  ProcessedDetection,
  ToothDetection,
  YOLOResponse
} from '@/lib/types';

interface XRayUploadSectionProps {
  onXRaySelected: (data: {
    id: string;
    url: string;
    detections: ProcessedDetection[];
    toothDetections: ToothDetection[];
    toothDetectionsPolygons: ToothDetection[];
  }) => void;
}

export default function XRayUploadSection({
  onXRaySelected
}: XRayUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://127.0.0.1:5000/api/v1/predict', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();

      if (data.status !== 'success') {
        throw new Error(data.data?.message || 'Prediction failed');
      }

      // 1. Process Disease Detections
      const diseases = convertYOLODetections(
        data.data.result.disease_detection[0]
      );

      // 2. Resolve Tooth Duplicates
      // We pass an object matching the ToothData interface: { tooth_numbering: [...] }
      const cleanedResult = removeDuplicateTeeth({
        tooth_numbering: data.data.result.tooth_numbering
      });

      // 3. Convert the cleaned detections for the first image result
      const teeth = convertYOLOTeethDetections(
        cleanedResult.tooth_numbering[0]
      );

      onXRaySelected({
        id: Date.now().toString(),
        url: `http://127.0.0.1:5000${data.data.image}`,
        detections: diseases,
        toothDetections: teeth,
        toothDetectionsPolygons: cleanedResult.tooth_numbering[0]
      });
    } catch (err) {
      console.error('Error processing X-ray:', err);
      alert(`Failed to process X-ray: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? 'border-primary bg-primary/10 scale-105'
          : 'border-primary/30 bg-card/50 hover:border-primary/50'
      } p-12 text-center cursor-pointer overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-transparent to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative z-10 space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/30 group-hover:border-primary/60 transition-colors">
            <Upload
              className={`w-8 h-8 text-primary neon-glow ${
                isProcessing ? 'animate-spin' : ''
              }`}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Upload Dental X-ray
          </h2>
          <p className="text-sm text-muted-foreground">
            {isProcessing
              ? 'Processing your X-ray...'
              : 'Drag and drop your X-ray or click to browse'}
          </p>
        </div>

        {!isProcessing && (
          <div className="pt-4 border-t border-border/30 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="font-mono text-primary">JPG</span>
            </div>
            <div>
              <span className="font-mono text-primary">PNG</span>
            </div>
            <div>
              <span className="font-mono text-primary">DICOM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
