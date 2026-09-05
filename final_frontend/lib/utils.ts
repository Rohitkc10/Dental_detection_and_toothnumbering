import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  DetectionResult,
  ProcessedDetection,
  ToothDetection
} from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertYOLODetections(
  result: DetectionResult
): ProcessedDetection[] {
  return result.boxes.map((box, idx) => {
    const [imgHeight, imgWidth] = result.orig_shape;

    // Normalize coordinates to 0-1 range
    const x = box.x1 / imgWidth;
    const y = box.y1 / imgHeight;
    const w = (box.x2 - box.x1) / imgWidth;
    const h = (box.y2 - box.y1) / imgHeight;

    const className = result.names[box.class] || `Disease ${box.class}`;

    return {
      id: `detection_${idx}`,
      disease: className,
      bbox: { x, y, w, h },
      confidence: box.confidence,
      x1: box.x1,
      y1: box.y1,
      x2: box.x2,
      y2: box.y2
    };
  });
}

export function convertYOLOTeethDetections(
  result: DetectionResult
): ToothDetection[] {
  return result.boxes.map((box, idx) => {
    const [imgHeight, imgWidth] = result.orig_shape;

    // Normalize coordinates to 0-1 range
    const x = box.x1 / imgWidth;
    const y = box.y1 / imgHeight;
    const w = (box.x2 - box.x1) / imgWidth;
    const h = (box.y2 - box.y1) / imgHeight;

    // Extract tooth number from class name or use class id
    const toothNumber = Number.parseInt(
      result.names[box.class] || box.class.toString(),
      10
    );

    return {
      id: `tooth_${idx}`,
      toothNumber: isNaN(toothNumber) ? 0 : toothNumber,
      bbox: { x, y, w, h },
      confidence: box.confidence
    };
  });
}

interface ToothBox {
  class: string;
  confidence: string | number;
  x1: string | number;
  x2: string | number;
  y1: string | number;
  y2: string | number;
}

export interface ToothNumberingEntry {
  boxes: ToothBox[];
  names: Record<string, string>;
  orig_shape: [string | number, string | number];
  path: string;
  polygons: [number, number][][];
  speed: {
    preprocess: number;
    inference: number;
    postprocess: number;
  };
}

export interface ToothData {
  tooth_numbering: ToothNumberingEntry[];
}

/**
 * Removes duplicate tooth detections using anatomical proximity logic.
 */
export function removeDuplicateTeeth(data: ToothData): ToothData {
  // FDI Adjacency Map: Which teeth are physically next to each other
  const ADJ_MAP: Record<string, string[]> = {
    '18': ['17'],
    '17': ['18', '16'],
    '16': ['17', '15'],
    '15': ['16', '14'],
    '14': ['15', '13'],
    '13': ['14', '12'],
    '12': ['13', '11'],
    '11': ['12', '21'],
    '21': ['11', '22'],
    '22': ['21', '23'],
    '23': ['22', '24'],
    '24': ['23', '25'],
    '25': ['24', '26'],
    '26': ['25', '27'],
    '27': ['26', '28'],
    '28': ['27'],
    '31': ['41', '32'],
    '32': ['31', '33'],
    '33': ['32', '34'],
    '34': ['33', '35'],
    '35': ['34', '36'],
    '36': ['35', '37'],
    '37': ['36', '38'],
    '38': ['37'],
    '41': ['31', '42'],
    '42': ['41', '43'],
    '43': ['42', '44'],
    '44': ['43', '45'],
    '45': ['44', '46'],
    '46': ['45', '47'],
    '47': ['46', '48'],
    '48': ['47']
  };

  const getCenter = (box: ToothBox) => ({
    x: (Number(box.x1) + Number(box.x2)) / 2,
    y: (Number(box.y1) + Number(box.y2)) / 2
  });

  const getDist = (b1: ToothBox, b2: ToothBox): number => {
    const c1 = getCenter(b1);
    const c2 = getCenter(b2);
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
  };

  // Deep clone to avoid side effects
  const result: ToothData = JSON.parse(JSON.stringify(data));

  result.tooth_numbering.forEach(entry => {
    const allBoxes = entry.boxes;
    const groups: Record<string, ToothBox[]> = {};

    // Group boxes by their predicted class
    allBoxes.forEach(box => {
      if (!groups[box.class]) groups[box.class] = [];
      groups[box.class].push(box);
    });

    const filteredBoxes: ToothBox[] = [];

    Object.keys(groups).forEach(clsId => {
      const candidates = groups[clsId];

      if (candidates.length === 1) {
        filteredBoxes.push(candidates[0]);
        return;
      }

      // Handle Duplicates
      const neighbors = ADJ_MAP[clsId] || [];
      let winner = candidates[0];
      let bestScore = { hasNeighbor: false, minDist: Infinity, conf: -1 };

      candidates.forEach(cand => {
        let currentMinDist = Infinity;
        let foundNeighbor = false;

        // Check against all other boxes to find actual neighbors
        allBoxes.forEach(other => {
          if (other === cand) return;
          if (neighbors.includes(other.class)) {
            const d = getDist(cand, other);
            if (d < currentMinDist) {
              currentMinDist = d;
              foundNeighbor = true;
            }
          }
        });

        const conf = Number(cand.confidence);

        // Selection Logic
        let isBetter = false;
        if (!foundNeighbor && !bestScore.hasNeighbor) {
          if (conf > bestScore.conf) isBetter = true;
        } else if (foundNeighbor && !bestScore.hasNeighbor) {
          isBetter = true;
        } else if (foundNeighbor && bestScore.hasNeighbor) {
          if (currentMinDist < bestScore.minDist) isBetter = true;
        }

        if (isBetter) {
          winner = cand;
          bestScore = {
            hasNeighbor: foundNeighbor,
            minDist: currentMinDist,
            conf
          };
        }
      });

      filteredBoxes.push(winner);
    });

    entry.boxes = filteredBoxes;
  });

  return result;
}
