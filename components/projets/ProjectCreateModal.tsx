'use client';

import { useState, useEffect } from 'react';
import { X, Palette, Trash2 } from 'lucide-react';
import { BriefcaseBusiness, User, BookOpen } from 'lucide-react';
import PhaseModal from './PhaseModal';
import ColorPaletteModal from './ColorPaletteModal';

interface Phase {
  id: string;
  name: string;
  steps: Step[];
}

interface Step {
  id: string;
  name: string;
}

interface KPI {
  label: string;
  type: 'text' | 'document' | 'url';
  value: string;
}

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: any) => void;
  editingProject?: any | null;
}

const categoryConfig = {
  perso: {
    label: 'Personnel',
    icon: User,
    color: '#FF6B35',
    contextLabel: 'Contexte',
    objectivesLabel: 'Objectifs',
    activitiesLabel: 'Activités',
  },
  pro: {
    label: 'Professionnel',
    icon: BriefcaseBusiness,
    color: '#4f6ef7',
    contextLabel: 'Contexte client',
    objectivesLabel: 'Objectifs projet',
    activitiesLabel: 'Services proposés',
  },
  formation: {
    label: 'Formation',
    icon: BookOpen,
    color: '#4A9B7F',
    contextLabel: 'Domaine',
    objectivesLabel: 'Compétences visées',
    activitiesLabel: 'Modules',
  },
};

type CategoryType = keyof typeof categoryConfig;

export default function ProjectCreateModal({
  isOpen,
  onClose,
  onCreateProject,
  editingProject,
}: ProjectCreateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    editingProject ? (editingProject.type as CategoryType) : null
  );
  const [projectName, setProjectName] = useState(editingProject?.name || '');
  const [context, setContext] = useState(editingProject?.context || '');
  const [objective, setObjective] = useState(editingProject?.objective || '');
  const [activities, setActivities] = useState(editingProject?.activities || '');
  const [deliverables, setDeliverables] = useState(editingProject?.deliverables || '');
  const [priority, setPriority] = useState(editingProject?.priority || 3);
  const [estimatedHours, setEstimatedHours] = useState(editingProject?.estimatedHours?.toString() || '');
  const [deadline, setDeadline] = useState(editingProject?.deadline || '');
  const [coverImageUrl, setCoverImageUrl] = useState(editingProject?.coverImageUrl || '');
  const [kpis, setKpis] = useState<KPI[]>(
    editingProject?.kpis && editingProject.kpis.length > 0
      ? editingProject.kpis
      : [
          { label: '', type: 'text', value: '' },
          { label: '', type: 'text', value: '' },
          { label: '', type: 'text', value: '' },
        ]
  );
  const [phases, setPhases] = useState<Phase[]>(editingProject?.phases || []);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [projectColor, setProjectColor] = useState(editingProject?.color || '#4f6ef7');

  useEffect(() => {
    // When editing, initialize all fields from editingProject
    if (editingProject) {
      setSelectedCategory(editingProject.type as CategoryType);
      setProjectName(editingProject.name || '');
      setContext(editingProject.context || '');
      setObjective(editingProject.objective || '');
      setActivities(editingProject.activities || '');
      setDeliverables(editingProject.deliverables || '');
      setPriority(editingProject.priority || 3);
      setEstimatedHours(editingProject.charge_hours?.toString() || editingProject.estimatedHours?.toString() || '');
      setDeadline(editingProject.deadline || '');
      setCoverImageUrl(editingProject.coverImageUrl || '');
      setProjectColor(editingProject.color || '#4f6ef7');
      setKpis(
        editingProject.kpis && editingProject.kpis.length > 0
          ? editingProject.kpis
          : [
              { label: '', type: 'text', value: '' },
              { label: '', type: 'text', value: '' },
              { label: '', type: 'text', value: '' },
            ]
      );
      setPhases(editingProject.phases || []);
    }
  }, [editingProject]);

  useEffect(() => {
    // Reset form when modal closes
    if (!isOpen && !editingProject) {
      setSelectedCategory(null);
      setProjectName('');
      setContext('');
      setObjective('');
      setActivities('');
      setDeliverables('');
      setPriority(3);
      setEstimatedHours('');
      setDeadline('');
      setCoverImageUrl('');
      setKpis([
        { label: '', type: 'text', value: '' },
        { label: '', type: 'text', value: '' },
        { label: '', type: 'text', value: '' },
      ]);
      setPhases([]);
      setProjectColor('#4f6ef7');
    }
  }, [isOpen, editingProject]);

  if (!isOpen) return null;

  const category = selectedCategory ? categoryConfig[selectedCategory] : null;

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert('Veuillez entrer un nom de projet');
      return;
    }

    onCreateProject({
      name: projectName,
      type: selectedCategory,
      context,
      objective,
      activities,
      deliverables,
      priority,
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      deadline,
      coverImageUrl,
      kpis: kpis.filter((k) => k.label.trim()),
      phases,
      color: projectColor,
    });
  };

  const handleAddPhase = (phaseNames: string[]) => {
    const newPhases = phaseNames.map((name, index) => ({
      id: `phase-${Date.now()}-${index}`,
      name: name.trim() || `Phase ${index + 1}`,
      steps: [],
    }));
    setPhases(newPhases);
    setShowPhaseModal(false);
  };

  const updatePhaseSteps = (phaseId: string, stepNames: string[]) => {
    setPhases(
      phases.map((phase) => {
        if (phase.id === phaseId) {
          const newSteps = stepNames.map((name, index) => ({
            id: `step-${Date.now()}-${index}`,
            name: name.trim() || `Étape ${index + 1}`,
          }));
          return { ...phase, steps: newSteps };
        }
        return phase;
      })
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Category Selection (if not selected) ── */}
          {!selectedCategory ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-8" style={{ color: '#1c1c1e' }}>
                  Quel type de projet ?
                </h2>
                <div className="flex gap-6 justify-center">
                  {(Object.entries(categoryConfig) as [CategoryType, typeof categoryConfig[CategoryType]][]).map(
                    ([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-95"
                          style={{
                            backgroundColor: `${config.color}15`,
                            border: `2px solid ${config.color}30`,
                          }}
                        >
                          <Icon size={32} style={{ color: config.color }} />
                          <span className="font-semibold" style={{ color: '#1c1c1e' }}>
                            {config.label}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div
                className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
              >
                <h2
                  className="text-xl font-bold"
                  style={{ color: '#1c1c1e' }}
                >
                  {projectName || 'Nouveau projet'}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowColorModal(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Couleur et image"
                  >
                    <Palette size={20} style={{ color: category.color }} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} style={{ color: '#8e8e93' }} />
                  </button>
                </div>
              </div>

              {/* ── Scrollable Content ── */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Section 1: Informations générales */}
                <section>
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: category.color }}
                  >
                    Informations générales
                  </h3>
                  <div className="space-y-6">
                    <input
                      type="text"
                      placeholder="Nom du projet"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.06)',
                        '--tw-ring-color': category.color,
                      } as any}
                    />
                    <input
                      type="text"
                      placeholder={category.contextLabel}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.06)',
                        '--tw-ring-color': category.color,
                      } as any}
                    />
                    <textarea
                      placeholder={category.objectivesLabel}
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      rows={3}
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.06)',
                        '--tw-ring-color': category.color,
                      } as any}
                    />
                    <textarea
                      placeholder={category.activitiesLabel}
                      value={activities}
                      onChange={(e) => setActivities(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      rows={2}
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.06)',
                        '--tw-ring-color': category.color,
                      } as any}
                    />
                    <input
                      type="text"
                      placeholder="Livrable(s)"
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.06)',
                        '--tw-ring-color': category.color,
                      } as any}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold" style={{ color: '#8e8e93' }}>
                          Priorité (1-5)
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        >
                          {[1, 2, 3, 4, 5].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold" style={{ color: '#8e8e93' }}>
                          Charge (h)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={estimatedHours}
                          onChange={(e) => setEstimatedHours(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold" style={{ color: '#8e8e93' }}>
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: KPI */}
                <section>
                  <h3
                    className="text-lg font-bold mb-6"
                    style={{ color: category.color }}
                  >
                    KPI
                  </h3>
                  <div className="space-y-5">
                    {kpis.map((kpi, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder={`KPI #${idx + 1}`}
                          value={kpi.label}
                          onChange={(e) => {
                            const newKpis = [...kpis];
                            newKpis[idx].label = e.target.value;
                            setKpis(newKpis);
                          }}
                          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        />
                        <select
                          value={kpi.type}
                          onChange={(e) => {
                            const newKpis = [...kpis];
                            newKpis[idx].type = e.target.value as any;
                            setKpis(newKpis);
                          }}
                          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        >
                          <option value="text">Texte</option>
                          <option value="document">Document</option>
                          <option value="url">URL</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Valeur"
                          value={kpi.value}
                          onChange={(e) => {
                            const newKpis = [...kpis];
                            newKpis[idx].value = e.target.value;
                            setKpis(newKpis);
                          }}
                          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'rgba(0, 0, 0, 0.06)',
                            '--tw-ring-color': category.color,
                          } as any}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3: Structure du projet */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: category.color }}
                    >
                      Structure du projet
                    </h3>
                    <button
                      onClick={() => setShowPhaseModal(true)}
                      className="text-sm px-3 py-1 rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      + Ajouter phases
                    </button>
                  </div>

                  {phases.length > 0 ? (
                    <div className="space-y-3">
                      {phases.map((phase) => (
                        <div key={phase.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={phase.name}
                              onChange={(e) => {
                                setPhases(
                                  phases.map((p) =>
                                    p.id === phase.id
                                      ? { ...p, name: e.target.value }
                                      : p
                                  )
                                );
                              }}
                              className="font-semibold border-none focus:outline-none flex-1"
                              style={{ color: category.color }}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingPhaseId(phase.id);
                                  setShowPhaseModal(true);
                                }}
                                className="text-xs px-2 py-1 rounded border"
                                style={{
                                  borderColor: category.color,
                                  color: category.color,
                                }}
                                title="Modifier les étapes"
                              >
                                ✏️ Étapes
                              </button>
                              <button
                                onClick={() => {
                                  setPhases(phases.filter((p) => p.id !== phase.id));
                                }}
                                className="text-xs px-2 py-1 rounded border"
                                style={{
                                  borderColor: 'rgba(0, 0, 0, 0.1)',
                                  color: '#e11d48',
                                }}
                                title="Supprimer la phase"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {phase.steps.length > 0 && (
                            <div className="ml-3 space-y-1 text-sm">
                              {phase.steps.map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center gap-2 text-xs py-1 px-2 rounded"
                                  style={{
                                    backgroundColor: `${category.color}10`,
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={step.name}
                                    onChange={(e) => {
                                      setPhases(
                                        phases.map((p) =>
                                          p.id === phase.id
                                            ? {
                                                ...p,
                                                steps: p.steps.map((s) =>
                                                  s.id === step.id
                                                    ? { ...s, name: e.target.value }
                                                    : s
                                                ),
                                              }
                                            : p
                                        )
                                      );
                                    }}
                                    className="border-none bg-transparent focus:outline-none w-full"
                                    style={{ color: '#1c1c1e' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPhases(
                                        phases.map((p) =>
                                          p.id === phase.id
                                            ? {
                                                ...p,
                                                steps: p.steps.filter((s) => s.id !== step.id),
                                              }
                                            : p
                                        )
                                      );
                                    }}
                                    className="text-stone-400 hover:text-rose-500"
                                    title="Supprimer l'étape"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#8e8e93' }} className="text-sm">
                      Aucune phase ajoutée
                    </p>
                  )}
                </section>
              </div>

              {/* ── Footer ── */}
              <div
                className="flex items-center justify-end gap-3 p-6"
                style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}
              >
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg border transition-colors"
                  style={{
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    color: '#1c1c1e',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
                  style={{ backgroundColor: category.color }}
                >
                  {editingProject ? 'Valider' : 'Créer le projet'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Phase Selection Modal */}
      <PhaseModal
        isOpen={showPhaseModal}
        onClose={() => { setShowPhaseModal(false); setEditingPhaseId(null); }}
        onConfirm={handleAddPhase}
        selectedPhase={phases.find((p) =>
          p.id === (phases[0]?.id || null)
        )}
        editingPhaseId={editingPhaseId}
        onSelectPhaseForSteps={(phaseId, stepNames) => {
          updatePhaseSteps(phaseId, stepNames);
        }}
        phases={phases}
      />

      {/* Color Modal */}
      {showColorModal && (
        <ColorPaletteModal
          isOpen={showColorModal}
          onClose={() => setShowColorModal(false)}
          selectedColor={projectColor}
          onColorChange={setProjectColor}
          onImageChange={setCoverImageUrl}
        />
      )}
    </>
  );
}
