"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface GalleryImage {
  id: string
  date: string
  xrayUrl: string
  findings: string
  classes: string[]
}

interface DataGalleryProps {
  images: GalleryImage[]
  onSelectImage: (image: GalleryImage) => void
  selectedImageId?: string
}

export default function DataGallery({ images, onSelectImage, selectedImageId }: DataGalleryProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-0 py-0 text-left hover:opacity-80 transition-opacity"
      >
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Data Gallery</h3>
        <ChevronDown
          className={`w-4 h-4 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => onSelectImage(image)}
              className={`relative rounded-lg overflow-hidden border transition-all ${
                selectedImageId === image.id
                  ? "border-primary/80 ring-2 ring-primary/50 scale-105"
                  : "border-primary/20 hover:border-primary/50"
              }`}
            >
              <div className="aspect-square bg-black/30 overflow-hidden">
                <img
                  src={image.xrayUrl || "/placeholder.svg?height=120&width=120&query=dental-xray"}
                  alt={`X-ray from ${image.date}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2 opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-xs font-mono text-cyan-400 neon-glow">{new Date(image.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{image.findings}</p>
              </div>

              {selectedImageId === image.id && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary neon-glow" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
        <span className="text-primary font-semibold">{images.length}</span> X-rays available
      </div>
    </div>
  )
}
