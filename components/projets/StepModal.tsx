'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stepNames: string[]) => void;
}

export default function StepModal({ isOpen, onClose, onConfirm }: StepModalProps) {
  const [step, setStep] = useState<'count' | 'names'>('count');
  const [stepCount, setStepCount] = useState(0);
  const [stepNames, setStepNames] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCountSubmit = () => {
    if (stepCount > 0) {
      setStepNames(Array(stepCount).fill(''));
      setStep('names');
    }
  };

  const handleNamesSubmit = () => {
    const validNames = stepNames.filter((n) => n.trim());
    if (validNames.length === stepCount) {
      onConfirm(stepNames);
      // Reset state
      setStep('count');
      setStepCount(0);
      setStepNames([]);
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          style={{ backdropFilter: 'blur(4px)' }}
        />
      )}

      {step === 'count' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1c1c1e' }}>
                Combien d'étapes ?
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setStepCount(num)}
                  className="flex-1 py-3 rounded-lg font-bold transition-all duration-200"
                  style={{
                    backgroundColor:
                      stepCount === num ? '#4f6ef7' : 'rgba(0, 0, 0, 0.06)',
                    color: stepCount === num ? '#fff' : '#1c1c1e',
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'rgba(0, 0, 0, 0.1)', color: '#1c1c1e' }}
              >
                Annuler
              </button>
              <button
                onClick={handleCountSubmit}
                disabled={stepCount === 0}
                className="flex-1 py-2 rounded-lg text-white font-semibold transition-all"
                style={{
                  backgroundColor: '#4f6ef7',
                  opacity: stepCount === 0 ? 0.5 : 1,
                }}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'names' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1c1c1e' }}>
                Nommez les étapes
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {stepNames.map((name, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Étape ${idx + 1}`}
                  value={name}
                  onChange={(e) => {
                    const newNames = [...stepNames];
                    newNames[idx] = e.target.value;
                    setStepNames(newNames);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                    '--tw-ring-color': '#4f6ef7',
                  } as any}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('count')}
                className="flex-1 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'rgba(0, 0, 0, 0.1)', color: '#1c1c1e' }}
              >
                Retour
              </button>
              <button
                onClick={handleNamesSubmit}
                className="flex-1 py-2 rounded-lg text-white font-semibold transition-all"
                style={{ backgroundColor: '#4f6ef7' }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
