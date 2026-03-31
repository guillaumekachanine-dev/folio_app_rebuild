import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
    const {
      name,
      type,
      context,
      objective,
      activities,
      deliverables,
      priority,
      estimatedHours,
      deadline,
      kpis,
      color,
    coverImageUrl,
    phases,
  } = body;

  // Update the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .update({
      name,
      type,
      context: context || null,
      objective: objective || null,
      activities: activities || null,
      deliverables: deliverables || null,
      priority: priority || 3,
      deadline: deadline || null,
      charge_hours: estimatedHours ? parseInt(estimatedHours) : null,
      kpis: kpis || [],
      color: color || '#4f6ef7',
      cover_image_url: coverImageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (projectError) {
    console.error('Error updating project:', projectError);
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (Array.isArray(phases)) {
    const { error: stepDeleteError } = await supabase
      .from('project_steps')
      .delete()
      .eq('project_id', id);

    if (stepDeleteError) {
      console.error('Error deleting steps:', stepDeleteError);
      return NextResponse.json({ error: stepDeleteError.message }, { status: 500 });
    }

    const { error: phaseDeleteError } = await supabase
      .from('project_phases')
      .delete()
      .eq('project_id', id);

    if (phaseDeleteError) {
      console.error('Error deleting phases:', phaseDeleteError);
      return NextResponse.json({ error: phaseDeleteError.message }, { status: 500 });
    }

    if (phases.length) {
      const phaseRows = phases.map((phase: { name?: string }, index: number) => ({
        project_id: id,
        name: phase.name || `Phase ${index + 1}`,
        order_index: index,
      }));

      const { data: insertedPhases, error: phaseInsertError } = await supabase
        .from('project_phases')
        .insert(phaseRows)
        .select('*');

      if (phaseInsertError) {
        console.error('Error inserting phases:', phaseInsertError);
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
        notes: string | null;
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
            notes: null,
            is_sub_project: false,
          });
        });
      });

      if (stepsToInsert.length) {
        const { error: stepInsertError } = await supabase
          .from('project_steps')
          .insert(stepsToInsert);

        if (stepInsertError) {
          console.error('Error inserting steps:', stepInsertError);
          return NextResponse.json({ error: stepInsertError.message }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
