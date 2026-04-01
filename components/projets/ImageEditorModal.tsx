'use client';

import { useState, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imagePreview: string;
  onConfirm: (imageData: string) => void;
  onCancel: () => void;
}

interface ImageStyle {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function ImageEditorModal({
  isOpen,
  imagePreview,
  onConfirm,
  onCancel,
}: ImageEditorModalProps) {
  const [style, setStyle] = useState<ImageStyle>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !imagePreview) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - style.offsetX,
      y: e.clientY - style.offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setStyle((prev) => ({
      ...prev,
      offsetX: e.clientX - dragStart.x,
      offsetY: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirm = () => {
    // Encode the style data in the URL
    const encodedStyle = btoa(JSON.stringify(style));
    const finalImageData = `${imagePreview}|${encodedStyle}`;
    onConfirm(finalImageData);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#1c1c1e' }}>
              Éditer l'image
            </h2>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Preview - simulating card size (300x320px) */}
            <div
              className="flex justify-center"
            >
              <div
                ref={containerRef}
                className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-move border border-gray-700"
                style={{
                  width: '250px',
                  height: '270px',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
              <img
                src={imagePreview}
                alt="Preview"
                className="absolute w-full h-full object-cover"
                style={{
                  transform: `translate(${style.offsetX}px, ${style.offsetY}px) scale(${style.scale})`,
                  userSelect: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s',
                }}
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-white/20" />
            </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              {/* Zoom */}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1c1c1e' }}>
                  Taille
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStyle((prev) => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={14} style={{ color: '#4f6ef7' }} />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={style.scale}
                    onChange={(e) => setStyle((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
                    className="flex-1"
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    onClick={() => setStyle((prev) => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={14} style={{ color: '#4f6ef7' }} />
                  </button>
                  <span className="text-xs" style={{ color: '#8e8e93', minWidth: '35px' }}>
                    {(style.scale * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Position X */}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1c1c1e' }}>
                  Position H
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={style.offsetX}
                    onChange={(e) => setStyle((prev) => ({ ...prev, offsetX: parseInt(e.target.value) }))}
                    className="flex-1"
                    style={{ cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    value={style.offsetX}
                    onChange={(e) => setStyle((prev) => ({ ...prev, offsetX: parseInt(e.target.value) || 0 }))}
                    className="w-12 px-1 py-0.5 border rounded text-xs"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  />
                </div>
              </div>

              {/* Position Y */}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1c1c1e' }}>
                  Position V
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={style.offsetY}
                    onChange={(e) => setStyle((prev) => ({ ...prev, offsetY: parseInt(e.target.value) }))}
                    className="flex-1"
                    style={{ cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    value={style.offsetY}
                    onChange={(e) => setStyle((prev) => ({ ...prev, offsetY: parseInt(e.target.value) || 0 }))}
                    className="w-12 px-1 py-0.5 border rounded text-xs"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#1c1c1e',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: '#4f6ef7' }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
