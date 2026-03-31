'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StepModal from './StepModal';

interface Phase {
  id: string;
  name: string;
  steps: { id: string; name: string }[];
}

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phaseNames: string[]) => void;
  selectedPhase?: Phase;
  onSelectPhaseForSteps?: (phaseId: string, stepNames: string[]) => void;
  phases: Phase[];
  editingPhaseId?: string | null;
}

export default function PhaseModal({
  isOpen,
  onClose,
  onConfirm,
  selectedPhase,
  onSelectPhaseForSteps,
  phases,
  editingPhaseId,
}: PhaseModalProps) {
  // If editing a phase, start on the steps modal directly
  const [step, setStep] = useState<'count' | 'names' | 'selectPhase'>(() =>
    editingPhaseId ? 'selectPhase' : 'count'
  );
  const [phaseCount, setPhaseCount] = useState(0);
  const [phaseNames, setPhaseNames] = useState<string[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset step based on whether we're editing or creating
      setStep(editingPhaseId ? 'selectPhase' : 'count');
      setSelectedPhaseId(editingPhaseId || null);
    } else {
      // Reset all state when modal closes
      setStep('count');
      setPhaseCount(0);
      setPhaseNames([]);
      setSelectedPhaseId(null);
    }
  }, [isOpen, editingPhaseId]);

  if (!isOpen) return null;

  const handleCountSubmit = () => {
    if (phaseCount > 0) {
      setPhaseNames(Array(phaseCount).fill(''));
      setStep('names');
    }
  };

  const handleNamesSubmit = () => {
    const validNames = phaseNames.filter((n) => n.trim());
    if (validNames.length === phaseCount) {
      onConfirm(phaseNames);
      // Reset state
      setStep('count');
      setPhaseCount(0);
      setPhaseNames([]);
      onClose();
    }
  };

  const handlePhaseSelect = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setShowStepModal(true);
  };

  const handleStepsConfirm = (stepNames: string[]) => {
    if (selectedPhaseId && onSelectPhaseForSteps) {
      onSelectPhaseForSteps(selectedPhaseId, stepNames);
      setShowStepModal(false);
      setSelectedPhaseId(null);
      onClose();
      // Reset
      setStep('count');
      setPhaseCount(0);
      setPhaseNames([]);
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

      {step === 'selectPhase' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1c1c1e' }}>
                Sélectionnez une phase
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseSelect(phase.id)}
                  className="w-full p-3 rounded-lg text-left transition-all duration-200 border"
                  style={{
                    borderColor: '#4f6ef7',
                    backgroundColor: selectedPhaseId === phase.id ? '#4f6ef720' : 'transparent',
                    color: '#1c1c1e',
                  }}
                >
                  {phase.name} ({phase.steps.length} étapes)
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
            </div>
          </div>
        </div>
      )}

      {step === 'count' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1c1c1e' }}>
                Combien de phases ?
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
                  onClick={() => setPhaseCount(num)}
                  className="flex-1 py-3 rounded-lg font-bold transition-all duration-200"
                  style={{
                    backgroundColor:
                      phaseCount === num ? '#4f6ef7' : 'rgba(0, 0, 0, 0.06)',
                    color: phaseCount === num ? '#fff' : '#1c1c1e',
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
                disabled={phaseCount === 0}
                className="flex-1 py-2 rounded-lg text-white font-semibold transition-all"
                style={{
                  backgroundColor: '#4f6ef7',
                  opacity: phaseCount === 0 ? 0.5 : 1,
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
                Nommez les phases
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {phaseNames.map((name, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Phase ${idx + 1}`}
                  value={name}
                  onChange={(e) => {
                    const newNames = [...phaseNames];
                    newNames[idx] = e.target.value;
                    setPhaseNames(newNames);
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

      {/* StepModal */}
      <StepModal
        isOpen={showStepModal}
        onClose={() => {
          setShowStepModal(false);
          setSelectedPhaseId(null);
        }}
        onConfirm={handleStepsConfirm}
      />
    </>
  );
}
