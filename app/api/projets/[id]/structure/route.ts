import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const db = supabase.schema('folio_app');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const phases = Array.isArray(body?.phases) ? body.phases : [];

  const { error: stepDeleteError } = await db
    .from('project_steps')
    .delete()
    .eq('project_id', id);

  if (stepDeleteError) {
    return NextResponse.json({ error: stepDeleteError.message }, { status: 500 });
  }

  const { error: phaseDeleteError } = await db
    .from('project_phases')
    .delete()
    .eq('project_id', id);

  if (phaseDeleteError) {
    return NextResponse.json({ error: phaseDeleteError.message }, { status: 500 });
  }

  if (!phases.length) {
    return NextResponse.json({ phases: [], steps: [] });
  }

  const phaseRows = phases.map((phase: { name?: string }, index: number) => ({
    project_id: id,
    name: phase.name || `Phase ${index + 1}`,
    order_index: index,
  }));

  const { data: insertedPhases, error: phaseInsertError } = await db
    .from('project_phases')
    .insert(phaseRows)
    .select('*');

  if (phaseInsertError) {
    return NextResponse.json({ error: phaseInsertError.message }, { status: 500 });
  }

  const stepsToInsert: Array<{
    project_id: string;
    phase_id: string;
    name: string;
    order_index: number;
    status: string;
    priority: number;
    start_date: string | null;
    deadline: string | null;
    charge_hours: number | null;
    deliverables: string | null;
    description: string | null;
    is_sub_project: boolean;
  }> = [];

  (insertedPhases || []).forEach((phase: any, index: number) => {
    const steps = phases[index]?.steps ?? [];
    steps.forEach((step: { name?: string }, stepIndex: number) => {
      stepsToInsert.push({
        project_id: id,
        phase_id: phase.id,
        name: step.name || `Etape ${stepIndex + 1}`,
        order_index: stepIndex,
        status: 'backlog',
        priority: 3,
        start_date: null,
        deadline: null,
        charge_hours: null,
        deliverables: null,
        description: null,
        is_sub_project: false,
      });
    });
  });

  let insertedSteps: any[] = [];
  if (stepsToInsert.length) {
    const { data: stepsData, error: stepInsertError } = await db
      .from('project_steps')
      .insert(stepsToInsert)
      .select('*');

    if (stepInsertError) {
      return NextResponse.json({ error: stepInsertError.message }, { status: 500 });
    }
    insertedSteps = stepsData || [];
  }

  return NextResponse.json({
    phases: insertedPhases || [],
    steps: insertedSteps,
  });
}
