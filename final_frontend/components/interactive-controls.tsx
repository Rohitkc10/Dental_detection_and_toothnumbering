"use client"
import { Maximize2, Eye, Crosshair } from "lucide-react"

interface InteractiveControlsProps {
  zoomLevel: number
  onZoomChange: (level: number) => void
  hoveredEnabled: boolean
  onHoverToggle: () => void
  drawMode: boolean
  onDrawToggle: () => void
}

export default function InteractiveControls({
  zoomLevel,
  onZoomChange,
  hoveredEnabled,
  onHoverToggle,
  drawMode,
  onDrawToggle,
}: InteractiveControlsProps) {
  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Interactive Tools</h3>

      {/* Zoom Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Zoom Level</span>
          </div>
          <span className="text-xs font-mono text-primary neon-glow">{zoomLevel}x</span>
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.5"
          value={zoomLevel}
          onChange={(e) => onZoomChange(Number.parseFloat(e.target.value))}
          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1x (Fit)</span>
          <span>3x (Max)</span>
        </div>
      </div>

      {/* Hover Highlight Toggle */}
      <div className="space-y-3 pt-3 border-t border-primary/20">
        <button
          onClick={onHoverToggle}
          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
            hoveredEnabled
              ? "bg-primary/20 border-primary/60"
              : "bg-primary/5 border-primary/20 hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Hover Highlight</span>
          </div>
          <span className={`text-xs font-mono ${hoveredEnabled ? "text-primary neon-glow" : "text-muted-foreground"}`}>
            {hoveredEnabled ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* Draw/Annotate Toggle */}
      <div className="space-y-3 pt-3 border-t border-primary/20">
        <button
          onClick={onDrawToggle}
          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
            drawMode ? "bg-primary/20 border-primary/60" : "bg-primary/5 border-primary/20 hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Draw/Annotate</span>
          </div>
          <span className={`text-xs font-mono ${drawMode ? "text-primary neon-glow" : "text-muted-foreground"}`}>
            {drawMode ? "ON" : "OFF"}
          </span>
        </button>

        {drawMode && (
          <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/20">
            Click and drag on the X-ray to draw annotations. Press Escape to exit draw mode.
          </div>
        )}
      </div>
    </div>
  )
}
