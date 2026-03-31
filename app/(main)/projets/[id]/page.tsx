import { createClient } from '@/lib/supabase/server';
import ProjectDetailView from '@/components/projets/ProjectDetailView';
import type { Project, ProjectPhase, ProjectStep } from '@/types';

type PhaseWithSteps = {
  phase: ProjectPhase;
  steps: ProjectStep[];
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="px-10 py-12 text-sm text-stone-400">
        Vous devez etre connecte pour acceder a ce projet.
      </div>
    );
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    return (
      <div className="px-10 py-12 text-sm text-stone-400">
        Projet introuvable.
      </div>
    );
  }

  let phasesWithSteps: PhaseWithSteps[] = [];

  const { data: phasesData } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true });

  const { data: stepsData } = await supabase
    .from('project_steps')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true });

  if (phasesData && phasesData.length) {
    const stepsByPhase = new Map<string, ProjectStep[]>();
    const typedSteps = (stepsData as ProjectStep[] | null) ?? [];
    typedSteps.forEach((step) => {
      const list = stepsByPhase.get(step.phase_id) ?? [];
      list.push(step);
      stepsByPhase.set(step.phase_id, list);
    });

    phasesWithSteps = (phasesData as ProjectPhase[]).map((phase) => ({
      phase,
      steps: stepsByPhase.get(phase.id) ?? [],
    }));
  } else if ((project as Project & { phases?: any }).phases) {
    const legacyPhases = (project as Project & { phases?: any }).phases as Array<{
      id: string;
      name: string;
      steps?: { id: string; name: string }[];
    }>;
    phasesWithSteps = legacyPhases.map((phase, index) => ({
      phase: {
        id: phase.id,
        project_id: project.id,
        name: phase.name,
        order_index: index,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      steps:
        phase.steps?.map((step, stepIndex) => ({
          id: step.id,
          phase_id: phase.id,
          project_id: project.id,
          name: step.name,
          order_index: stepIndex,
          status: 'backlog',
          start_date: null,
          deadline: null,
          charge_hours: null,
          priority: 3,
          deliverables: null,
          notes: null,
          is_sub_project: false,
          created_at: project.created_at,
          updated_at: project.updated_at,
        })) ?? [],
    }));
  }

  return <ProjectDetailView project={project} phases={phasesWithSteps} />;
}
