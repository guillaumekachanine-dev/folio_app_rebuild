'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  LayoutDashboard,
  Pencil,
  Palette,
  BriefcaseBusiness,
  BookOpen,
  ShoppingBag,
  Laptop,
} from 'lucide-react';
import ProjectCreateModal from '@/components/projets/ProjectCreateModal';
import type { Project, ProjectPhase, ProjectStep } from '@/types';

type PhaseWithSteps = {
  phase: ProjectPhase;
  steps: ProjectStep[];
};

type ViewState =
  | { type: 'empty' }
  | { type: 'step'; step: ProjectStep; phase?: ProjectPhase }
  | { type: 'phase'; phase: ProjectPhase; steps: ProjectStep[] }
  | { type: 'dashboard' };

const statusLabels: Record<ProjectStep['status'], string> = {
  backlog: 'Backlog',
  planifie: 'Planifie',
  en_cours: 'En cours',
  en_validation: 'Validation',
  termine: 'Termine',
};

const stepIcons = [Palette, Laptop, BookOpen, ShoppingBag, BriefcaseBusiness];

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ProjectDetailView({
  project,
  phases,
}: {
  project: Project;
  phases: PhaseWithSteps[];
}) {
  const [activeView, setActiveView] = useState<ViewState>({ type: 'empty' });
  const [projectState, setProjectState] = useState(project);
  const [phaseState, setPhaseState] = useState<PhaseWithSteps[]>(phases);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const orderedPhases = useMemo(
    () => phaseState.slice().sort((a, b) => a.phase.order_index - b.phase.order_index),
    [phaseState]
  );

  const editingProject = useMemo(
    () => ({
      id: projectState.id,
      name: projectState.name,
      type: projectState.type,
      context: projectState.context ?? '',
      objective: projectState.objective ?? '',
      activities: projectState.activities ?? '',
      deliverables: (projectState as any).deliverables ?? '',
      priority: projectState.priority ?? 3,
      estimatedHours: projectState.charge_hours ?? undefined,
      deadline: projectState.deadline ?? '',
      coverImageUrl: projectState.cover_image_url ?? '',
      color: projectState.color ?? '#4f6ef7',
      kpis: Array.isArray(projectState.kpis) ? projectState.kpis : [],
      phases: phaseState.map((phaseItem) => ({
        id: phaseItem.phase.id,
        name: phaseItem.phase.name,
        steps: phaseItem.steps.map((step) => ({ id: step.id, name: step.name })),
      })),
    }),
    [projectState, phaseState]
  );

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projets/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsEditOpen(false);
        window.location.href = '/projets';
      } else {
        alert('Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  const handleUpdateProject = async (payload: any) => {
    const response = await fetch(`/api/projets/${projectState.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const updated = await response.json();
      setProjectState(updated);
    }

    if (payload.phases) {
      const structureResponse = await fetch(`/api/projets/${projectState.id}/structure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phases: payload.phases }),
      });

      if (structureResponse.ok) {
        const structure = await structureResponse.json();
        const phasesData: ProjectPhase[] = structure.phases ?? [];
        const stepsData: ProjectStep[] = structure.steps ?? [];
        const grouped = new Map<string, ProjectStep[]>();
        stepsData.forEach((step) => {
          const list = grouped.get(step.phase_id) ?? [];
          list.push(step);
          grouped.set(step.phase_id, list);
        });
        setPhaseState(
          phasesData.map((phase) => ({
            phase,
            steps: grouped.get(phase.id) ?? [],
          }))
        );
      }
    }

    setIsEditOpen(false);
  };

  const renderStepModal = (step: ProjectStep, phase?: ProjectPhase) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-stone-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Detail de l&apos;etape
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">{step.name}</h2>
        {phase ? (
          <p className="mt-1 text-sm text-stone-500">{phase.name}</p>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-stone-600">
              <CheckCircle2 size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Statut</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-900">
              {statusLabels[step.status]}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-stone-600">
              <Flag size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Priorite</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-900">{step.priority}/5</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Echeance</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-900">
              {formatDate(step.deadline)}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-stone-600">
              <Clock size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Charge</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-900">
              {step.charge_hours ? `${step.charge_hours}h` : '—'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Livrables
          </p>
          <p className="mt-3 text-sm text-stone-700">
            {step.deliverables || 'Aucun livrable defini.'}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Notes
          </p>
          <p className="mt-3 text-sm text-stone-700">{step.notes || 'Aucune note.'}</p>
        </div>
      </div>
    </div>
  );

  const renderPhaseModal = (phase: ProjectPhase, steps: ProjectStep[]) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-stone-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Vue phase
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">{phase.name}</h2>
        <p className="mt-1 text-sm text-stone-500">{steps.length} etapes</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {steps.length ? (
          <div className="grid grid-cols-2 gap-4">
            {steps.map((step, index) => {
              const Icon = stepIcons[index % stepIcons.length];
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{step.name}</p>
                      <p className="text-xs text-stone-400">{formatDate(step.deadline)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-sm text-stone-400">
            Aucune etape pour cette phase.
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Mini planning
          </p>
          <div className="mt-4 grid gap-4">
            {steps.length ? (
              steps.map((step, index) => {
                const progress = Math.round(((index + 1) / Math.max(steps.length, 1)) * 100);
                return (
                  <div key={step.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-700">{step.name}</span>
                      <span className="text-xs text-stone-400">{formatDate(step.deadline)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-stone-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-stone-400">Aucun planning disponible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between px-6 py-4 bg-[#DCE1EB]">
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <LayoutDashboard size={16} />
          T-card Dashboard
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              className="h-9 w-56 rounded-full border border-white bg-white px-4 text-sm text-stone-600 shadow-sm"
              placeholder="Search"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm">
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Project', color: '#7BC96F' },
            { label: 'Web Development', color: '#4F83E9' },
            { label: 'Design', color: '#F3B23B' },
            { label: 'Testing', color: '#7B4FD8' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4 text-white shadow-sm"
              style={{ backgroundColor: card.color }}
            >
              <p className="text-xs font-semibold">{card.label}</p>
              <div className="mt-3 h-2 rounded-full bg-white/40">
                <div className="h-2 w-2/3 rounded-full bg-white" />
              </div>
              <p className="mt-3 text-xs text-white/80">Actual 75</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">Project Status</p>
            <div className="mt-4 h-40 rounded-xl bg-slate-100" />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">Language Used</p>
            <div className="mt-4 h-40 rounded-xl bg-slate-100" />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">Sales</p>
            <div className="mt-4 h-40 rounded-xl bg-slate-100" />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">Monthly Status</p>
            <div className="mt-4 h-40 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRightPanel = () => {
    if (activeView.type === 'step') {
      return renderStepModal(activeView.step, activeView.phase);
    }
    if (activeView.type === 'phase') {
      return renderPhaseModal(activeView.phase, activeView.steps);
    }
    if (activeView.type === 'dashboard') {
      return renderDashboard();
    }

    return (
      <div className="flex h-full items-center justify-center text-sm text-stone-400">
        Selectionnez une phase ou une etape pour afficher le detail.
      </div>
    );
  };

  return (
    <div className="px-10 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                  {projectState.cover_image_url ? (
                    <img
                      src={projectState.cover_image_url}
                      alt={projectState.name}
                      className="h-20 w-20 rounded-3xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-2xl font-semibold text-blue-600">
                      {projectState.name?.slice(0, 1) || 'P'}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-900">{projectState.name}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:border-blue-300"
                  >
                    <Pencil size={16} />
                    Editer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView({ type: 'dashboard' })}
                    className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:border-blue-300"
                  >
                    <LayoutDashboard size={16} />
                    Tableau de bord projet
                  </button>
                </div>
              </div>

          <div
            className="flex flex-col"
            style={{ marginTop: '72px', gap: '24px' }}
          >
            {orderedPhases.length ? (
              orderedPhases.map((phaseItem, index) => (
                <div key={phaseItem.phase.id} className="flex flex-col" style={{ gap: '12px' }}>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveView({
                          type: 'phase',
                          phase: phaseItem.phase,
                          steps: phaseItem.steps,
                        })
                      }
                      className="group flex items-center gap-3 text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-xs font-semibold text-stone-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-stone-900 group-hover:text-blue-700 leading-relaxed">
                          {phaseItem.phase.name}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-stone-400" />
                  </div>

                  <div className="flex flex-col" style={{ gap: '10px' }}>
                    {phaseItem.steps.length ? (
                      phaseItem.steps.map((step) => (
                        <button
                          key={step.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveView({
                              type: 'step',
                              step,
                              phase: phaseItem.phase,
                            });
                          }}
                          className="flex w-full items-center justify-between py-2 text-left transition-colors hover:text-blue-700"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[13px] font-semibold text-stone-900 leading-loose">
                                {step.name}
                              </p>
                              <p className="text-[11px] text-stone-400 leading-loose">
                                {formatDate(step.deadline)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-[9px] font-semibold uppercase text-stone-500">
                              {statusLabels[step.status]}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                              <FileText size={14} />
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-stone-400">Aucune etape renseignee.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-sm text-stone-400">
                Aucune phase definie pour ce projet.
              </div>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-140px)] rounded-3xl border border-stone-200 bg-white shadow-xl overflow-hidden">
          {renderRightPanel()}
        </div>
      </div>

      <ProjectCreateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onCreateProject={handleUpdateProject}
        editingProject={editingProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
