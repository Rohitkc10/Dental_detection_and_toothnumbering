import { ToothNumberingEntry } from './utils';

export interface BoundingBox {
  class: string | number;
  confidence: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface DetectionResult {
  boxes: BoundingBox[];
  names: Record<string | number, string>;
  orig_shape: [number, number];
  path: string;
  polygons?: Array<Array<[string, string]>>;
  speed: {
    preprocess: string;
    inference: string;
    postprocess: string;
  };
}

export interface YOLOResponse {
  status: string;
  data: {
    image: string;
    message: string;
    result: {
      disease_detection: DetectionResult[];
      tooth_numbering: DetectionResult[];
    };
  };
}

export interface ProcessedDetection {
  id: string;
  disease: string;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ToothDetection {
  id: string;
  toothNumber: number;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
}
