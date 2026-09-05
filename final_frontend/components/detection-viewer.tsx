'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { ProcessedDetection, ToothDetection } from '@/lib/types';
import { ToothNumberingEntry } from '@/lib/utils';
import { drawToothPolygon } from './draw-tooth-polygon';
import {
  captureCanvasRect,
  getCanvasPoint,
  isPointInRect
} from './capture-canvas';

interface DetectionViewerProps {
  xrayUrl: string;
  detections: ProcessedDetection[];
  selectedClasses: string[];
  toothDetections: Array<{
    id: string;
    toothNumber: number;
    bbox: { x: number; y: number; w: number; h: number };
  }>;
  toothDetectionPolygons: ToothNumberingEntry;
  hoveredDisease: string | null;
  zoomLevel: number;
  drawMode: boolean;
  hoveredTooth: number | null;
  showTeethNumbering: boolean;
}

const diseaseColors: Record<string, string> = {
  'Healthy Teeth': '#26d946',
  Caries: '#ff7f00',
  'Impacted Teeth': '#ff0000',
  'BDC-BDR': '#c127d9',
  Infection: '#ff0000',
  'Fractured Teeth': '#00d9ff'
};

export default function DetectionViewer({
  xrayUrl,
  detections,
  toothDetections,
  hoveredDisease,
  selectedClasses,
  zoomLevel,
  drawMode,
  toothDetectionPolygons,
  hoveredTooth,
  showTeethNumbering
}: DetectionViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [showTeethEdges, setShowTeethEdges] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hoveredDetection, setHoveredDetection] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStrokes, setDrawStrokes] = useState<
    Array<{ x: number; y: number; isStart: boolean }>
  >([]);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  // stores the image position + size on the canvas
  const canvasMetricsRef = useRef<{
    offsetX: number;
    offsetY: number;
    displayWidth: number;
    displayHeight: number;
  } | null>(null);

  console.log(hoveredTooth);

  const filterSelectedDetections = detections.filter(detection =>
    selectedClasses.includes(detection.disease)
  );

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.width, height: img.height });
      redrawDetectionCanvas();
    };
    img.src = xrayUrl;
  }, [xrayUrl]);

  useEffect(() => {
    const handleResize = () => {
      redrawDetectionCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    redrawDetectionCanvas();
  }, [
    zoomLevel,
    hoveredDisease,
    hoveredDetection,
    detections,
    toothDetections,
    selectedClasses,
    toothDetectionPolygons,
    showTeethEdges,
    hoveredTooth,
    showTeethNumbering
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Clicked');

    const canvas = canvasRef.current;
    const metrics = canvasMetricsRef.current;

    console.log(canvas);
    console.log(metrics);
    if (!canvas || !metrics) return;

    // convert click to canvas coordinates
    const point = getCanvasPoint(canvas, e.nativeEvent);

    // check disease bounding boxes
    for (const detection of filterSelectedDetections) {
      const bbox = {
        x: metrics.offsetX + detection.bbox.x * metrics.displayWidth,
        y: metrics.offsetY + detection.bbox.y * metrics.displayHeight,
        width: detection.bbox.w * metrics.displayWidth,
        height: detection.bbox.h * metrics.displayHeight
      };

      if (isPointInRect(point, bbox)) {
        console.log('Clicked on disease:', detection.disease, detection.id);

        // optional: capture rectangle as PNG
        const imgDataUrl = captureCanvasRect(canvas, bbox);
        setCapturedImages(prev => [...prev, imgDataUrl]);
        console.log(imgDataUrl);

        break;
      }
    }

    // check teeth bounding boxes
    for (const tooth of toothDetections) {
      const bbox = {
        x: metrics.offsetX + tooth.bbox.x * metrics.displayWidth,
        y: metrics.offsetY + tooth.bbox.y * metrics.displayHeight,
        width: tooth.bbox.w * metrics.displayWidth,
        height: tooth.bbox.h * metrics.displayHeight
      };

      if (isPointInRect(point, bbox)) {
        console.log('Clicked on tooth number:', tooth.toothNumber);
        break;
      }
    }
  };

  const redrawDetectionCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const canvasDisplayWidth = rect.width;
    const canvasDisplayHeight = rect.height;

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, canvasDisplayWidth, canvasDisplayHeight);

    // Draw image with zoom
    const img = imageRef.current;
    const aspectRatio = img.width / img.height;
    let displayWidth, displayHeight, offsetX, offsetY;

    if (canvasDisplayWidth / canvasDisplayHeight > aspectRatio) {
      displayHeight = canvasDisplayHeight * 0.9;
      displayWidth = displayHeight * aspectRatio;
    } else {
      displayWidth = canvasDisplayWidth * 0.9;
      displayHeight = displayWidth / aspectRatio;
    }

    displayWidth *= zoomLevel;
    displayHeight *= zoomLevel;

    offsetX = (canvasDisplayWidth - displayWidth) / 2;
    offsetY = (canvasDisplayHeight - displayHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, displayWidth, displayHeight);

    const hasCariesDetection = detections.some(d => d.disease === 'Caries');
    const hasHoveredItem =
      hoveredDetection ||
      hoveredDisease ||
      (hasCariesDetection && hoveredDisease === 'Caries');
    // const showOverlay = hoveredDetection || hoveredDisease;
    const showOverlay = true;

    if (showOverlay) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasDisplayWidth, canvasDisplayHeight);
    }

    // Draw disease bounding boxes
    filterSelectedDetections.forEach(detection => {
      const bbox = {
        x: offsetX + detection.bbox.x * displayWidth,
        y: offsetY + detection.bbox.y * displayHeight,
        w: detection.bbox.w * displayWidth,
        h: detection.bbox.h * displayHeight
      };

      const color = diseaseColors[detection.disease] || '#8b5cf6';
      // const isHovered =
      //   hoveredDetection === detection.id ||
      //   hoveredDisease === detection.disease ||
      //   (detection.disease === 'Caries' &&
      //     (hoveredDetection || hoveredDisease));
      const isHovered = hoveredDetection === detection.id;
      const lineWidth = isHovered ? 4 : 2;

      if (isHovered) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(bbox.x, bbox.y, bbox.w, bbox.h);
        ctx.globalAlpha = 1.0;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = isHovered ? 25 : 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

      // Draw label
      const fontSize = Math.max(10, 12 * zoomLevel);
      const confidence = Math.round(detection.confidence * 100);
      const labelText = `${detection.disease} ${confidence}%`;
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isHovered ? 15 : 8;
      ctx.fillText(labelText, bbox.x + 6, bbox.y - 8);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });

    if (showTeethNumbering) {
      toothDetections.forEach(tooth => {
        const bbox = {
          x: offsetX + tooth.bbox.x * displayWidth,
          y: offsetY + tooth.bbox.y * displayHeight,
          w: tooth.bbox.w * displayWidth,
          h: tooth.bbox.h * displayHeight
        };

        const fontSize = Math.max(10, 11 * zoomLevel);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = 'rgba(100, 255, 200, 0.9)';
        ctx.shadowColor = 'rgba(100, 255, 200, 0.5)';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          tooth.toothNumber.toString(),
          bbox.x + bbox.w / 2,
          bbox.y + bbox.h / 2
        );
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
    }

    const imgW = img.width;
    const imgH = img.height;

    function getPolygonCenter(polygon: [number, number][]) {
      let x = 0,
        y = 0;
      polygon.forEach(([px, py]) => {
        x += px;
        y += py;
      });
      return { x: x / polygon.length, y: y / polygon.length };
    }

    function getToothBoxCenterImageSpace(
      tooth: {
        bbox: { x: number; y: number; w: number; h: number };
      },
      imgW: number,
      imgH: number
    ) {
      return {
        x: (tooth.bbox.x + tooth.bbox.w / 2) * imgW,
        y: (tooth.bbox.y + tooth.bbox.h / 2) * imgH
      };
    }

    if (hoveredTooth && toothDetectionPolygons?.polygons?.length) {
      const tooth = toothDetections.find(t => t.toothNumber === hoveredTooth);
      if (!tooth) return;

      // ✅ IMAGE SPACE
      const toothCenter = getToothBoxCenterImageSpace(tooth, imgW, imgH);

      let bestPolygon: [number, number][] | null = null;
      let minDist = Infinity;

      toothDetectionPolygons.polygons.forEach(polygon => {
        const pc = getPolygonCenter(polygon); // already image-space
        const d = Math.hypot(pc.x - toothCenter.x, pc.y - toothCenter.y);

        if (d < minDist) {
          minDist = d;
          bestPolygon = polygon;
        }
      });

      if (bestPolygon) {
        drawToothPolygon({
          ctx,
          polygon: bestPolygon,
          imgW,
          imgH,
          displayWidth,
          displayHeight,
          offsetX,
          offsetY
        });
      }
    }

    if (showTeethEdges && toothDetectionPolygons?.polygons) {
      toothDetectionPolygons.polygons.forEach(polygon => {
        drawToothPolygon({
          ctx,
          polygon,
          imgW,
          imgH,
          displayWidth,
          displayHeight,
          offsetX,
          offsetY
        });
      });
    }

    // Draw user annotations with zoom scaling
    if (drawStrokes.length > 0) {
      ctx.strokeStyle = 'rgba(255, 100, 200, 0.8)';
      ctx.lineWidth = 3 * zoomLevel;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      drawStrokes.forEach((stroke, index) => {
        const x = offsetX + stroke.x * displayWidth;
        const y = offsetY + stroke.y * displayHeight;

        if (stroke.isStart || index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }

    canvasMetricsRef.current = {
      offsetX,
      offsetY,
      displayWidth,
      displayHeight
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawMode) return;

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    setDrawStrokes([{ x: normalizedX, y: normalizedY, isStart: true }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !container || !imageRef.current) return;

    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    if (drawMode) {
      if (isDrawing) {
        setDrawStrokes(prev => [
          ...prev,
          { x: normalizedX, y: normalizedY, isStart: false }
        ]);
        redrawDetectionCanvas();
      }
      canvas.style.cursor = 'crosshair';
    } else {
      const containerRect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const scaledWidth = containerRect.width * dpr;
      const scaledHeight = containerRect.height * dpr;

      const img = imageRef.current;
      const aspectRatio = img.width / img.height;
      let displayWidth, displayHeight, offsetX, offsetY;

      if (containerRect.width / containerRect.height > aspectRatio) {
        displayHeight = containerRect.height * 0.9;
        displayWidth = displayHeight * aspectRatio;
      } else {
        displayWidth = containerRect.width * 0.9;
        displayHeight = displayWidth / aspectRatio;
      }

      displayWidth *= zoomLevel;
      displayHeight *= zoomLevel;
      offsetX = (containerRect.width - displayWidth) / 2;
      offsetY = (containerRect.height - displayHeight) / 2;

      let foundDetection = null;
      for (const detection of detections) {
        const bboxX = offsetX + detection.bbox.x * displayWidth;
        const bboxY = offsetY + detection.bbox.y * displayHeight;
        const bboxW = detection.bbox.w * displayWidth;
        const bboxH = detection.bbox.h * displayHeight;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (
          mouseX >= bboxX &&
          mouseX <= bboxX + bboxW &&
          mouseY >= bboxY &&
          mouseY <= bboxY + bboxH
        ) {
          foundDetection = detection.id;
          break;
        }
      }

      setHoveredDetection(foundDetection);
      canvas.style.cursor = foundDetection ? 'pointer' : 'grab';
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearDrawing = () => {
    setDrawStrokes([]);
    redrawDetectionCanvas();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Detection Analysis
        </h2>

        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <div>
            <span className="text-primary">Zoom:</span> {zoomLevel.toFixed(1)}x
          </div>
          <div>
            <span className="text-primary">Detections:</span>{' '}
            {detections.length}
          </div>
          {drawMode && (
            <span className="text-accent animate-pulse">DRAW MODE</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="checkbox"
          name="showTeethEdges"
          id="showTeethEdges"
          checked={showTeethEdges}
          onChange={e => setShowTeethEdges(e.target.checked)}
        />
        <label htmlFor="showTeethEdges" className="text-md">
          Show Teeth Edges
        </label>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-xl border border-primary/30 overflow-hidden bg-card backdrop-blur-sm hover:border-primary/60 transition-colors"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={handleCanvasClick}
          onMouseLeave={() => {
            setHoveredDetection(null);
            setIsDrawing(false);
          }}
          className="w-full h-full"
        />

        {hoveredDetection && !drawMode && (
          <div className="absolute top-4 right-4 bg-card/80 border border-primary/50 rounded-lg p-3 backdrop-blur-sm z-20 animate-fade-in">
            {filterSelectedDetections
              .filter(d => d.id === hoveredDetection)
              .map(detection => (
                <div key={detection.id} className="space-y-1">
                  <p className="text-sm font-bold text-primary">
                    {detection.disease}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round(detection.confidence * 100)}%
                  </p>
                </div>
              ))}
          </div>
        )}

        {drawMode && drawStrokes.length > 0 && (
          <button
            onClick={handleClearDrawing}
            className="absolute top-4 right-4 px-3 py-1 bg-accent/80 hover:bg-accent text-xs font-mono rounded-lg border border-accent/50 transition-colors"
          >
            Clear Drawing
          </button>
        )}
      </div>

      {/* <div className="grid grid-cols-4 gap-3">
        {filterSelectedDetections.map(detection => (
          <div
            key={detection.id}
            className="p-3 rounded-lg border border-primary/20 bg-card/50 hover:bg-card/80 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredDetection(detection.id)}
            onMouseLeave={() => setHoveredDetection(null)}
          >
            <div
              className="text-xs font-mono font-bold mb-1"
              style={{ color: diseaseColors[detection.disease] }}
            >
              {detection.disease}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(detection.confidence * 100)}% conf.
            </div>
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-4 gap-3">
        {filterSelectedDetections.map(detection => {
          // Map disease to corresponding teeth using spatial correlation
          const toothDiseaseMap: Record<number, string[]> = {};
          const metrics = canvasMetricsRef.current;

          if (metrics) {
            toothDetections.forEach(tooth => {
              const toothBox = {
                x: metrics.offsetX + tooth.bbox.x * metrics.displayWidth,
                y: metrics.offsetY + tooth.bbox.y * metrics.displayHeight,
                width: tooth.bbox.w * metrics.displayWidth,
                height: tooth.bbox.h * metrics.displayHeight
              };

              const bbox = {
                x: metrics.offsetX + detection.bbox.x * metrics.displayWidth,
                y: metrics.offsetY + detection.bbox.y * metrics.displayHeight,
                width: detection.bbox.w * metrics.displayWidth,
                height: detection.bbox.h * metrics.displayHeight
              };

              const centerX = bbox.x + bbox.width / 2;
              const centerY = bbox.y + bbox.height / 2;

              if (
                centerX >= toothBox.x &&
                centerX <= toothBox.x + toothBox.width &&
                centerY >= toothBox.y &&
                centerY <= toothBox.y + toothBox.height
              ) {
                if (!toothDiseaseMap[tooth.toothNumber]) {
                  toothDiseaseMap[tooth.toothNumber] = [];
                }
                toothDiseaseMap[tooth.toothNumber].push(detection.disease);
              }
            });
          }

          return (
            <div
              key={detection.id}
              className="p-3 rounded-lg border border-primary/20 bg-card/50 hover:bg-card/80 transition-all cursor-pointer"
              onMouseEnter={() => setHoveredDetection(detection.id)}
              onMouseLeave={() => setHoveredDetection(null)}
            >
              <div
                className="text-xs font-mono font-bold mb-1"
                style={{ color: diseaseColors[detection.disease] }}
              >
                {detection.disease}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(detection.confidence * 100)}% conf.
              </div>

              {/* ✅ Show teeth numbers associated with this disease */}
              {Object.keys(toothDiseaseMap).length > 0 && (
                <div className="text-xs text-cyan-700 font-bold mt-1">
                  Tooth# {Object.keys(toothDiseaseMap).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold mb-2 text-foreground">
              Captured Thumbnails
            </h3>
            <div className="flex gap-2 items-start flex-wrap justify-center overflow-x-auto">
              {capturedImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`capture-${idx}`}
                  className="w-50 object-cover rounded-lg border border-primary/30"
                />
              ))}
            </div>

            <button
              onClick={() => setCapturedImages([])}
              className="mt-2 px-3 py-1 text-xs font-mono bg-accent/80 rounded-lg hover:bg-accent transition-colors"
            >
              Clear Captures
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
