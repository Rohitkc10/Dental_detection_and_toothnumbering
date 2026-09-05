"use client"

import { useState } from "react"
import { ChevronDown, Calendar, FileText } from "lucide-react"

interface HistoryItem {
  id: number
  date: string
  xrayUrl: string
  findings: string
}

interface PatientHistoryPanelProps {
  history: HistoryItem[]
  onSelectXRay: (data: any) => void
}

export default function PatientHistoryPanel({ history, onSelectXRay }: PatientHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Patient History</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.findings}</p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-primary transition-transform duration-200 flex-shrink-0 ${
                  expandedId === item.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedId === item.id && (
              <div className="border-t border-primary/20 px-4 py-3 space-y-3 bg-primary/5">
                <div className="rounded-lg overflow-hidden border border-primary/30 h-32 bg-black/30">
                  <img
                    src={item.xrayUrl || "/placeholder.svg"}
                    alt="X-ray thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  onClick={() =>
                    onSelectXRay({
                      id: item.id,
                      url: item.xrayUrl,
                      detections: [],
                      toothMap: {},
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono bg-primary/20 border border-primary/50 rounded text-primary hover:bg-primary/30 transition-colors"
                >
                  Load Analysis
                </button>

                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground font-semibold flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Findings
                  </p>
                  <p className="text-muted-foreground">{item.findings}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
