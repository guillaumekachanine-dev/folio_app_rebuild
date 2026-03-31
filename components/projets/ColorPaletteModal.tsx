'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import ImageEditorModal from './ImageEditorModal';

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  onImageChange?: (imageUrl: string) => void;
}

const colors = [
  '#FF6B35', // Orange vif (Perso)
  '#4f6ef7', // Bleu (Pro)
  '#4A9B7F', // Vert tendre (Formation)
  '#E8704A', // Orange doux
  '#D84C4C', // Rouge
  '#D4A81B', // Jaune
  '#34aadc', // Cyan
  '#34c759', // Vert
  '#af52de', // Violet
  '#FF9500', // Orange
  '#0052CC', // Bleu foncé
  '#003A7D', // Bleu très foncé
];

export default function ColorPaletteModal({
  isOpen,
  onClose,
  selectedColor,
  onColorChange,
  onImageChange,
}: ColorPaletteModalProps) {
  const [activeTab, setActiveTab] = useState<'color' | 'image'>('color');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and open editor
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setShowImageEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageEditorConfirm = async (imageDataWithStyle: string) => {
    setIsUploading(true);
    try {
      // Upload to Supabase with style data
      const fileName = `project-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const response = await fetch('/api/projets/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          imageData: imageDataWithStyle,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (onImageChange) {
          onImageChange(url);
        }
        setImagePreview('');
        setShowImageEditor(false);
        setActiveTab('color');
      } else {
        alert('Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#1c1c1e' }}>
              Personnaliser
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6 border-b">
            <button
              onClick={() => setActiveTab('color')}
              className="py-2 px-4 font-semibold text-sm border-b-2 transition-colors"
              style={{
                borderColor: activeTab === 'color' ? '#4f6ef7' : 'transparent',
                color: activeTab === 'color' ? '#4f6ef7' : '#8e8e93',
              }}
            >
              Couleur
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className="py-2 px-4 font-semibold text-sm border-b-2 transition-colors"
              style={{
                borderColor: activeTab === 'image' ? '#4f6ef7' : 'transparent',
                color: activeTab === 'image' ? '#4f6ef7' : '#8e8e93',
              }}
            >
              Image
            </button>
          </div>

          {/* Color Palette */}
          {activeTab === 'color' && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    onClose();
                  }}
                  className="w-full aspect-square rounded-lg transition-all duration-200 border-4 hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color
                        ? '#1c1c1e'
                        : 'transparent',
                  }}
                />
              ))}
            </div>
          )}

          {/* Image Upload */}
          {activeTab === 'image' && (
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors"
                style={{
                  borderColor: '#4f6ef7',
                  backgroundColor: 'rgba(79, 110, 247, 0.05)',
                }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload size={32} style={{ color: '#4f6ef7', marginBottom: '8px' }} />
                <p className="font-semibold text-sm" style={{ color: '#1c1c1e' }}>
                  Télécharger une image
                </p>
                <p className="text-xs" style={{ color: '#8e8e93', marginTop: '4px' }}>
                  PNG, JPG ou GIF
                </p>
              </label>
              <ImageEditorModal
                isOpen={showImageEditor}
                imagePreview={imagePreview}
                onConfirm={handleImageEditorConfirm}
                onCancel={() => {
                  setShowImageEditor(false);
                  setImagePreview('');
                }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: 'rgba(0, 0, 0, 0.1)',
                color: '#1c1c1e',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
