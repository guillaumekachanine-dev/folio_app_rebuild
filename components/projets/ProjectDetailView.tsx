'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  LayoutDashboard,
  Pencil,
  Palette,
  BriefcaseBusiness,
  BookOpen,
  ShoppingBag,
  Laptop,
  GripVertical,
  ChevronRight,
  Circle,
  Link2,
  Plus,
  X,
  Upload,
  Save,
  FileText,
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
  const [editingStep, setEditingStep] = useState<ProjectStep | null>(null);
  const [stepForm, setStepForm] = useState<Partial<ProjectStep>>({});
  const [resourceUrls, setResourceUrls] = useState<Record<string, string[]>>({});
  const [urlInput, setUrlInput] = useState<Record<string, string>>({});

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

  /* ─── Step patch ──────────────────────────────────────────────────── */
  const handleStepPatch = async (stepId: string, data: Partial<ProjectStep>) => {
    const res = await fetch(`/api/projets/${projectState.id}/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: ProjectStep = await res.json();
      setPhaseState((prev) =>
        prev.map((ph) => ({
          ...ph,
          steps: ph.steps.map((s) => (s.id === stepId ? { ...s, ...updated } : s)),
        }))
      );
      // Refresh right panel if showing this phase
      if (activeView.type === 'phase') {
        const refreshed = phaseState
          .find((ph) => ph.phase.id === activeView.phase.id);
        if (refreshed) {
          setActiveView({
            type: 'phase',
            phase: refreshed.phase,
            steps: refreshed.steps.map((s) => (s.id === stepId ? { ...s, ...updated } : s)),
          });
        }
      }
    }
  };

  /* ─── Step status constants ───────────────────────────────────────── */
  const STATUS_ORDER: ProjectStep['status'][] = [
    'backlog', 'planifie', 'en_cours', 'en_validation', 'termine',
  ];
  const STATUS_LABELS: Record<ProjectStep['status'], string> = {
    backlog: 'Backlog', planifie: 'Planifié', en_cours: 'En cours',
    en_validation: 'Validation', termine: 'Terminé',
  };
  const STATUS_COLORS: Record<ProjectStep['status'], string> = {
    backlog: '#cbd5e1', planifie: '#93c5fd', en_cours: '#3b82f6',
    en_validation: '#f59e0b', termine: '#22c55e',
  };

  const priorityLabel = (p: number) => p >= 4 ? 'Haute' : p === 3 ? 'Moyenne' : 'Basse';
  const priorityColor = (p: number) => p >= 4 ? '#ef4444' : p === 3 ? '#f59e0b' : '#22c55e';

  /* ─── Reusable sub-components (inline) ───────────────────────────── */

  const CompactField = ({
    label,
    value,
    style,
  }: {
    label: string;
    value: string;
    style?: React.CSSProperties;
  }) => (
    <div style={{
      border: '1px solid #e7e9ee', borderRadius: 8, padding: '2px 6px',
      background: '#fff', display: 'flex', flexDirection: 'column', gap: 1,
      height: 22, justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#1e293b', lineHeight: 1.1 }}>{value}</span>
    </div>
  );

  /** Gray background text field */
  const FieldBox = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      background: '#f8f9fb', borderRadius: 8, padding: '7px 10px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: value === '—' ? '#cbd5e1' : '#1e293b', lineHeight: 1.4 }}>{value}</span>
    </div>
  );

  /** Horizontal status progress bar */
  const ProgressStepper = ({ status }: { status: ProjectStep['status'] }) => {
    const current = STATUS_ORDER.indexOf(status);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 10 }}>
        {STATUS_ORDER.map((s, i) => {
          const filled = i <= current;
          const color = filled ? STATUS_COLORS[status] : '#e2e8f0';
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: filled ? STATUS_COLORS[s] : '#e2e8f0',
                  border: i === current ? `2px solid ${STATUS_COLORS[s]}` : '2px solid transparent',
                  boxShadow: i === current ? `0 0 0 2px ${STATUS_COLORS[s]}30` : 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 8, color: i <= current ? STATUS_COLORS[s] : '#cbd5e1', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div style={{
                  flex: 1, height: 2, background: i < current ? STATUS_COLORS[status] : '#e2e8f0',
                  margin: '0 2px', marginBottom: 14,
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /** Compact resources field for phase header */
  const ResourcesField = ({ phaseId, style }: { phaseId: string; style?: React.CSSProperties }) => {
    const urls = resourceUrls[phaseId] ?? [];
    const input = urlInput[phaseId] ?? '';
    return (
      <div style={{
        border: '1px solid #e7e9ee', borderRadius: 10, padding: '6px 8px',
        background: '#fff', display: 'flex', flexDirection: 'column', gap: 6,
        minHeight: 48,
        ...style,
      }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ressources
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid #e7e9ee', borderRadius: 8, padding: '4px 6px', background: '#f8f9fb',
          }}>
            <Link2 size={10} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="url"
              placeholder="Lien ou note..."
              value={input}
              onChange={(e) => setUrlInput((p) => ({ ...p, [phaseId]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  setResourceUrls((p) => ({ ...p, [phaseId]: [...(p[phaseId] ?? []), input.trim()] }));
                  setUrlInput((p) => ({ ...p, [phaseId]: '' }));
                }
              }}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 9.5, color: '#1e293b', background: 'transparent' }}
            />
          </div>
          <button
            onClick={() => {
              if (!input.trim()) return;
              setResourceUrls((p) => ({ ...p, [phaseId]: [...(p[phaseId] ?? []), input.trim()] }));
              setUrlInput((p) => ({ ...p, [phaseId]: '' }));
            }}
            style={{
              width: 24, height: 24, borderRadius: 7, background: '#4f6ef7',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Plus size={12} style={{ color: '#fff' }} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <button
            type="button"
            style={{
              flex: 1, border: '1.5px dashed #c8d3e0', borderRadius: 8, padding: '5px 8px',
              background: '#fff', fontSize: 9, color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
            }}
          >
            <Upload size={11} style={{ color: '#94a3b8' }} />
            Uploader
          </button>
          <span style={{ fontSize: 8.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {urls.length ? `${urls.length} ressource${urls.length > 1 ? 's' : ''}` : 'Aucune'}
          </span>
        </div>
      </div>
    );
  };

  /** Step card */
  const StepCard = ({ step, index }: { step: ProjectStep; index: number }) => {
    const stepPalette = [
      { accent: '#7BC96F', bg: '#F3FBF2', border: '#DCEFDA' },
      { accent: '#4F83E9', bg: '#F1F5FF', border: '#D6E2FB' },
      { accent: '#F3B23B', bg: '#FFF7E8', border: '#F6E4BF' },
      { accent: '#7B4FD8', bg: '#F5F1FF', border: '#E0D5FA' },
    ];
    const palette = stepPalette[index % stepPalette.length];

    return (
      <div style={{
        border: `1px solid ${palette.border}`, borderRadius: 16, background: palette.bg,
        padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      }}>
      {/* Header: matricule + name + pencil */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 26 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.2 }} className="truncate">
            {step.name}
          </p>
        </div>
        <button
          onClick={() => { setEditingStep(step); setStepForm({ ...step }); }}
          style={{
            width: 26, height: 26, borderRadius: 7, border: '1px solid #e7e9ee',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, marginLeft: 8,
          }}
        >
          <Pencil size={12} style={{ color: '#94a3b8' }} />
        </button>
      </div>

      {/* Description */}
      <FieldBox label="Description" value={step.description || '—'} />

      {/* 2×2 fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <FieldBox label="Date début" value={formatDate(step.start_date)} />
        <FieldBox label="Deadline"   value={formatDate(step.deadline)} />
        <FieldBox label="Priorité"   value={step.priority ? `${priorityLabel(step.priority)} (${step.priority}/5)` : '—'} />
        <FieldBox label="Charge (h)" value={step.charge_hours ? `${step.charge_hours} h` : '—'} />
      </div>

      {/* Progress stepper */}
        <ProgressStepper status={step.status} />
      </div>
    );
  };

  /** Mini planning for phase */
  const MiniPlanning = ({ phase, steps }: { phase: ProjectPhase; steps: ProjectStep[] }) => {
    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    };

    const datedSteps = steps.filter((step) => step.start_date && step.deadline);
    const phaseAny = phase as any;
    const candidatesStart = [
      parseDate(phaseAny.start_date),
      ...datedSteps.map((s) => parseDate(s.start_date)),
    ].filter(Boolean) as Date[];
    const candidatesEnd = [
      parseDate(phaseAny.deadline),
      parseDate(phaseAny.end_date),
      ...datedSteps.map((s) => parseDate(s.deadline)),
    ].filter(Boolean) as Date[];

    if (candidatesStart.length === 0 || candidatesEnd.length === 0 || datedSteps.length === 0) {
      return (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Mini planning
          </p>
          <div style={{
            border: '1.5px dashed #e2e8f0', borderRadius: 14, padding: '18px',
            fontSize: 12, color: '#94a3b8', textAlign: 'center', background: '#fafbfc',
          }}>
            Ajoutez des dates aux étapes pour afficher le planning.
          </div>
        </div>
      );
    }

    const start = new Date(Math.min(...candidatesStart.map((d) => d.getTime())));
    const end = new Date(Math.max(...candidatesEnd.map((d) => d.getTime())));
    if (end < start) {
      return null;
    }

    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1);
    const rangeMs = Math.max(1, end.getTime() - start.getTime());
    const rowHeight = 24;
    const colors = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'];

    const weekSegments: Array<{ start: Date; end: Date }> = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const segStart = new Date(cursor);
      const segEnd = new Date(cursor);
      segEnd.setDate(segEnd.getDate() + 6);
      if (segEnd > end) segEnd.setTime(end.getTime());
      weekSegments.push({ start: segStart, end: segEnd });
      cursor.setDate(cursor.getDate() + 7);
    }

    const today = new Date();
    const showToday = today >= start && today <= end;
    const todayLeft = ((today.getTime() - start.getTime()) / rangeMs) * 100;

    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Mini planning
        </p>
        <div style={{
          border: '1px solid #e7e9ee', borderRadius: 16, background: '#fff',
          padding: '14px', display: 'grid', gridTemplateColumns: '170px 1fr', gap: 14,
        }}>
          {/* Left labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 34 }}>
            {datedSteps.map((step, idx) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 6, height: rowHeight }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: colors[idx % colors.length],
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, color: '#1e293b', fontWeight: 600 }} className="truncate">
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Week labels */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weekSegments.length}, 1fr)`, gap: 6 }}>
              {weekSegments.map((seg, i) => (
                <div key={i} style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
                  {seg.start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {seg.end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </div>
              ))}
            </div>

            {/* Day numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
              {Array.from({ length: totalDays }).map((_, i) => {
                const date = new Date(start.getTime() + i * dayMs);
                return (
                  <div key={i} style={{ fontSize: 8, color: '#cbd5e1', textAlign: 'center', opacity: i % 2 === 0 ? 1 : 0 }}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Bars */}
            <div
              style={{
                position: 'relative',
                height: datedSteps.length * rowHeight,
                borderRadius: 10,
                background: '#fff',
                backgroundImage: 'linear-gradient(to right, #f1f3f6 1px, transparent 1px)',
                backgroundSize: `${100 / totalDays}% 100%`,
              }}
            >
              {showToday && (
                <div style={{
                  position: 'absolute',
                  left: `${todayLeft}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: '#3b82f6',
                  borderRadius: 2,
                }} />
              )}
              {showToday && (
                <div style={{
                  position: 'absolute',
                  left: `calc(${todayLeft}% + 6px)`,
                  top: -18,
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                }}>
                  Aujourd’hui
                </div>
              )}
              {datedSteps.map((step, idx) => {
                const stepStart = parseDate(step.start_date)!;
                const stepEnd = parseDate(step.deadline)!;
                const left = ((stepStart.getTime() - start.getTime()) / rangeMs) * 100;
                const right = ((stepEnd.getTime() - start.getTime()) / rangeMs) * 100;
                const width = Math.max(2, right - left);
                return (
                  <div
                    key={step.id}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      top: idx * rowHeight + 4,
                      height: 16,
                      borderRadius: 999,
                      background: colors[idx % colors.length],
                      boxShadow: '0 6px 16px rgba(15,23,42,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 10,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /** Step edit overlay — shown when editingStep is set */
  const renderStepEditOverlay = () => {
    if (!editingStep) return null;
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.32)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 18,
      }}>
        <div style={{
          width: 'min(360px, 92%)', background: '#fff',
          borderRadius: 18,
          padding: '20px 20px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.16)',
          maxHeight: 'calc(100% - 36px)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                Modifier l'étape
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>
                {editingStep.name}
              </p>
            </div>
            <button
              onClick={() => { setEditingStep(null); setStepForm({}); }}
              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e7e9ee', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} style={{ color: '#64748b' }} />
            </button>
          </div>

          {/* Nom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nom de l'étape</label>
            <input
              type="text"
              value={stepForm.name ?? editingStep.name ?? ''}
              onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, name: e.target.value }))}
              style={{ border: '1px solid #e7e9ee', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#1e293b', background: '#f8f9fb', outline: 'none' }}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
            <textarea
              rows={2}
              value={stepForm.description ?? editingStep.description ?? ''}
              onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, description: e.target.value }))}
              style={{ border: '1px solid #e7e9ee', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#1e293b', background: '#f8f9fb', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Statut */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Statut</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_ORDER.map((s) => {
                const active = (stepForm.status ?? editingStep.status) === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStepForm((f: Partial<ProjectStep>) => ({ ...f, status: s }))}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${active ? STATUS_COLORS[s] : '#e7e9ee'}`,
                      background: active ? `${STATUS_COLORS[s]}18` : '#fff',
                      color: active ? STATUS_COLORS[s] : '#64748b',
                      cursor: 'pointer',
                    }}
                  >{STATUS_LABELS[s]}</button>
                );
              })}
            </div>
          </div>

          {/* Dates row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Date début', key: 'start_date' as const },
              { label: 'Deadline',   key: 'deadline'   as const },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
                <input
                  type="date"
                  value={(stepForm[key] ?? (editingStep as any)[key] ?? '').slice(0, 10)}
                  onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, [key]: e.target.value || null }))}
                  style={{ border: '1px solid #e7e9ee', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#1e293b', background: '#f8f9fb', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Priorité + Charge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Priorité (1–5)</label>
              <select
                value={stepForm.priority ?? editingStep.priority ?? 3}
                onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, priority: Number(e.target.value) }))}
                style={{
                  border: '1px solid #e7e9ee',
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontSize: 12,
                  color: '#1e293b',
                  background: '#f8f9fb',
                  outline: 'none',
                  ...(Number(stepForm.priority ?? editingStep.priority ?? 3) === 5
                    ? { borderColor: '#fca5a5', boxShadow: '0 0 0 2px rgba(248,113,113,0.15)' }
                    : {}),
                }}
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Charge (heures)</label>
              <input
                type="number" min={0}
                value={stepForm.charge_hours ?? editingStep.charge_hours ?? ''}
                onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, charge_hours: e.target.value ? Number(e.target.value) : null }))}
                style={{ border: '1px solid #e7e9ee', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#1e293b', background: '#f8f9fb', outline: 'none' }}
              />
            </div>
          </div>

          {/* Output / Livrables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Output / Livrables</label>
            <textarea
              rows={2}
              value={stepForm.deliverables ?? editingStep.deliverables ?? ''}
              onChange={(e) => setStepForm((f: Partial<ProjectStep>) => ({ ...f, deliverables: e.target.value }))}
              style={{ border: '1px solid #e7e9ee', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#1e293b', background: '#f8f9fb', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={async () => {
              await handleStepPatch(editingStep.id, stepForm);
              setEditingStep(null);
              setStepForm({});
            }}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, border: 'none',
              background: '#4f6ef7', color: '#fff', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer',
            }}
          >
            <Save size={14} />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    );
  };

  const renderPhaseHeader = (phase: ProjectPhase) => {
    const ph = phase as any;
    const phaseIndex = phaseState.findIndex((item) => item.phase.id === phase.id);
    const phaseNumber = phaseIndex >= 0 ? phaseIndex + 1 : 1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: '#eef2ff', color: '#4f46e5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700,
          flexShrink: 0,
          boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
        }}>
          {phaseNumber}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.2 }} className="truncate">
            {phase.name}
          </h2>
          {ph.description && (
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
              {ph.description}
            </p>
          )}
        </div>

        {/* 4 field pills on the same line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: 88 }}>
            <CompactField label="Début" value={formatDate(ph.start_date)} style={{ height: 41 }} />
            <CompactField label="Deadline" value={formatDate(ph.deadline)} style={{ height: 41 }} />
          </div>
          <ResourcesField phaseId={phase.id} style={{ width: 190, minHeight: 88 }} />
        </div>
      </div>
    );
  };

  const renderPhaseBody = (phase: ProjectPhase, steps: ProjectStep[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 24px' }}>
        {steps.length === 0 ? (
          <div style={{
            border: '1.5px dashed #e2e8f0', borderRadius: 14, padding: '24px',
            fontSize: 12, color: '#94a3b8', textAlign: 'center', background: '#fafbfc',
          }}>
            Aucune étape pour cette phase.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
              {steps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} />
              ))}
            </div>
            <MiniPlanning phase={phase} steps={steps} />
          </>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => {
    const flatSteps = phaseState.flatMap((phaseItem) =>
      phaseItem.steps.map((step) => ({ ...step, phaseName: phaseItem.phase.name }))
    );
    const phaseColors = ['#0ea5a6', '#3b82f6', '#a855f7', '#7c3aed', '#1e3a8a', '#f59e0b'];
    let phaseMetrics = phaseState.map((item) => {
      const totalCharge = item.steps.reduce((sum, step) => sum + (step.charge_hours ?? 0), 0);
      const value = totalCharge > 0 ? totalCharge : item.steps.length;
      return { label: item.phase.name, value };
    });
    let totalVolume = phaseMetrics.reduce((sum, item) => sum + item.value, 0);
    if (totalVolume === 0 && phaseMetrics.length > 0) {
      phaseMetrics = phaseMetrics.map((item) => ({ ...item, value: 1 }));
      totalVolume = phaseMetrics.length;
    }
    let current = 0;
    const donutStops =
      phaseMetrics.length > 0
        ? phaseMetrics
            .map((item, index) => {
              const pct = (item.value / totalVolume) * 100;
              const start = current;
              const end = current + pct;
              current = end;
              return `${phaseColors[index % phaseColors.length]} ${start}% ${end}%`;
            })
            .join(', ')
        : '#e2e8f0 0 100%';
    const datedSteps = flatSteps.filter((step) => step.start_date && step.deadline).slice(0, 5);
    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    };
    const startDates = datedSteps.map((s) => parseDate(s.start_date)).filter(Boolean) as Date[];
    const endDates = datedSteps.map((s) => parseDate(s.deadline)).filter(Boolean) as Date[];
    const planningStart = startDates.length ? new Date(Math.min(...startDates.map((d) => d.getTime()))) : null;
    const planningEnd = endDates.length ? new Date(Math.max(...endDates.map((d) => d.getTime()))) : null;
    const rangeMs =
      planningStart && planningEnd
        ? Math.max(1, planningEnd.getTime() - planningStart.getTime())
        : 1;

    return (
      <div className="flex h-full flex-col bg-slate-100">
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Total Project', color: '#7BC96F', percent: 80, actual: 50, planned: 85 },
              { label: 'Web Development', color: '#4F83E9', percent: 90, actual: 75, planned: 95 },
              { label: 'Design', color: '#F3B23B', percent: 75, actual: 60, planned: 80 },
              { label: 'Testing', color: '#7B4FD8', percent: 85, actual: 70, planned: 90 },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-3 text-white shadow-sm"
                style={{ backgroundColor: card.color }}
              >
                <p className="text-xs font-semibold">{card.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 rounded-xl bg-white/25 p-2">
                    <div className="h-2 rounded-full bg-white/50">
                      <div className="h-2 rounded-full bg-[#0ea5a6]" style={{ width: `${card.percent}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-white/90">{card.percent}%</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="rounded-lg border border-white/50 px-2 py-1 text-[10px]">
                      {card.actual}
                      <span className="block text-[9px] text-white/80">Actual</span>
                    </div>
                    <div className="rounded-lg border border-white/50 px-2 py-1 text-[10px]">
                      {card.planned}
                      <span className="block text-[9px] text-white/80">Planned</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginTop: 18 }}>
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-stone-500">
                Visuels
              </div>
              <div className="p-4 h-56 flex items-center justify-center">
                {projectState.cover_image_url ? (
                  <img
                    src={projectState.cover_image_url}
                    alt={projectState.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-3xl bg-white shadow-md flex items-center justify-center text-3xl font-semibold text-slate-500">
                      {projectState.name?.slice(0, 1) || 'P'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-stone-500">
                Charge par activité
              </div>
              <div className="p-4 h-56 flex items-center justify-center gap-6">
                <div
                  className="h-36 w-36 rounded-full"
                  style={{
                    background: `conic-gradient(${donutStops})`,
                  }}
                />
                <div className="space-y-2 text-xs text-stone-600">
                  {phaseMetrics.length > 0 ? (
                    phaseMetrics.slice(0, 6).map((item, index) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: phaseColors[index % phaseColors.length] }} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-400">Aucune phase</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-stone-500">
                Ressources / Outputs / Livrables
              </div>
              <div className="p-4 h-56">
                <div className="flex h-full items-center justify-center gap-6 text-slate-500">
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-[11px] font-semibold uppercase">
                    n8n
                  </div>
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <Link2 size={20} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-stone-500">
                Planning projet
              </div>
              <div className="p-4 h-56">
                <div className="h-full rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                  </div>
                  <div className="mt-3 relative h-[140px]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px)]" style={{ backgroundSize: '20% 100%' }} />
                    {datedSteps.length > 0 ? (
                      datedSteps.map((step, idx) => {
                        const stepStart = parseDate(step.start_date)!;
                        const stepEnd = parseDate(step.deadline)!;
                        const left = planningStart
                          ? ((stepStart.getTime() - planningStart.getTime()) / rangeMs) * 100
                          : 0;
                        const right = planningStart
                          ? ((stepEnd.getTime() - planningStart.getTime()) / rangeMs) * 100
                          : 10;
                        const width = Math.max(6, right - left);
                        return (
                          <div
                            key={step.id}
                            style={{
                              position: 'absolute',
                              left: `${left}%`,
                              top: idx * 24 + 6,
                              width: `${width}%`,
                              height: 14,
                              borderRadius: 999,
                              background: '#0ea5a6',
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        Ajoutez des dates pour afficher le planning.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    let content: React.ReactNode;

    if (activeView.type === 'phase') {
      content = renderPhaseBody(activeView.phase, activeView.steps);
    } else if (activeView.type === 'dashboard') {
      content = renderDashboard();
    } else {
      content = (
        <div className="flex h-full items-center justify-center text-sm text-stone-400">
          Sélectionnez une phase pour afficher le détail.
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        {content}
        {renderStepEditOverlay()}
      </div>
    );
  };

  const rightPanelMarginTop = 18;

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

          {/* ── Condensed phase/step list ─────────────────────────────── */}
          <div style={{ marginTop: '18px' }}>
            {orderedPhases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-sm text-stone-400">
                Aucune phase définie pour ce projet.
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #e7e9ee', background: '#fff' }}
              >
                {orderedPhases.map((phaseItem, phaseIdx) => {
                  const doneCount = phaseItem.steps.filter((s) => s.status === 'termine').length;
                  const total = phaseItem.steps.length;
                  const isLast = phaseIdx === orderedPhases.length - 1;

                  return (
                    <div key={phaseItem.phase.id}>
                      {/* ── Phase row ────────────────────────────────── */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveView({
                            type: 'phase',
                            phase: phaseItem.phase,
                            steps: phaseItem.steps,
                          })
                        }
                        className="w-full text-left group"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '16px 20px 1fr 82px',
                          alignItems: 'center',
                          padding: '9px 12px 9px 10px',
                          background: '#f3f4f7',
                          borderBottom: '1px solid #e7e9ee',
                          gap: 0,
                          cursor: 'pointer',
                        }}
                      >
                        {/* drag handle */}
                        <span style={{ color: '#c8cbd4', lineHeight: 0 }}>
                          <GripVertical size={12} />
                        </span>
                        {/* spacer */}
                        <span />
                        {/* name + progress */}
                        <span style={{ paddingLeft: 10, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span
                            className="group-hover:text-blue-700 transition-colors truncate"
                            style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}
                          >
                            {String(phaseIdx + 1).padStart(2, '0')}. {phaseItem.phase.name}
                          </span>
                          {total > 0 && (
                            <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                              {doneCount}/{total}
                            </span>
                          )}
                        </span>
                        {/* no date on phase rows */}
                        <span />
                      </button>

                      {/* ── Step rows ────────────────────────────────── */}
                      {phaseItem.steps.map((step, stepIdx) => {
                        const isLastStep = stepIdx === phaseItem.steps.length - 1;
                        const isTermine = step.status === 'termine';

                        // status → dot color
                        const statusDotColor: Record<string, string> = {
                          backlog: '#cbd5e1',
                          planifie: '#93c5fd',
                          en_cours: '#3b82f6',
                          en_validation: '#f59e0b',
                          termine: '#22c55e',
                        };

                        const description = step.description || '';

                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveView({ type: 'phase', phase: phaseItem.phase, steps: phaseItem.steps });
                            }}
                            className="w-full text-left group"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '16px 20px 1fr 82px',
                              alignItems: 'center',
                              padding: '7px 12px 7px 10px',
                              borderBottom:
                                isLastStep && isLast ? 'none' : '1px solid #f1f3f6',
                              background: 'transparent',
                              gap: 0,
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = '#f8f9fb';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }}
                          >
                            {/* drag handle */}
                            <span style={{ color: '#d1d5db', lineHeight: 0, opacity: 0 }}
                              className="group-hover:opacity-100 transition-opacity">
                              <GripVertical size={12} />
                            </span>

                            {/* status circle */}
                            <span style={{ lineHeight: 0, paddingLeft: 2 }}>
                              {isTermine ? (
                                <CheckCircle2
                                  size={14}
                                  style={{ color: '#22c55e', fill: '#dcfce7' }}
                                />
                              ) : (
                                <Circle
                                  size={14}
                                  style={{ color: statusDotColor[step.status] ?? '#cbd5e1' }}
                                />
                              )}
                            </span>

                            {/* name + description */}
                            <span style={{ paddingLeft: 10, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                              <ChevronRight
                                size={10}
                                style={{ color: '#c8cbd4', flexShrink: 0 }}
                              />
                              <span
                                className="truncate group-hover:text-blue-700 transition-colors"
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: isTermine ? '#94a3b8' : '#1e293b',
                                  textDecoration: isTermine ? 'line-through' : 'none',
                                }}
                              >
                                {step.name}
                              </span>
                              {description && (
                                <span
                                  className="truncate"
                                  style={{
                                    fontSize: 12,
                                    color: '#94a3b8',
                                    fontWeight: 400,
                                  }}
                                >
                                  - {description}
                                </span>
                              )}
                            </span>

                            {/* deadline */}
                            <span
                              style={{
                                fontSize: 11,
                                color: '#94a3b8',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {step.deadline
                                ? new Date(step.deadline).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                  })
                                : '—'}
                            </span>
                          </button>
                        );
                      })}

                      {phaseItem.steps.length === 0 && (
                        <div
                          style={{
                            padding: '7px 12px 7px 56px',
                            fontSize: 11,
                            color: '#cbd5e1',
                            borderBottom: isLast ? 'none' : '1px solid #f1f3f6',
                          }}
                        >
                          Aucune étape
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          {activeView.type === 'phase' && (
            <div>
              {renderPhaseHeader(activeView.phase)}
            </div>
          )}
          {activeView.type === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="h-20 w-20 rounded-3xl bg-blue-100 text-blue-600 shadow-md flex items-center justify-center">
                <LayoutDashboard size={30} />
              </div>
              <h2 className="text-2xl font-semibold text-stone-900">Tableau de Bord</h2>
            </div>
          )}
          <div
            className="h-[calc(100vh-140px)] rounded-3xl border border-stone-200 bg-white shadow-xl overflow-hidden"
            style={{ marginTop: `${rightPanelMarginTop}px` }}
          >
            {renderRightPanel()}
          </div>
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
