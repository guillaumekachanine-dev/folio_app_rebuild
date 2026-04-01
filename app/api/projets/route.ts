import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const db = supabase.schema('folio_app');

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch projects for the user
  const { data: projects, error } = await db
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        error: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(projects || []);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const db = supabase.schema('folio_app');
    console.log('[POST /api/projets] Client created');

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('[POST /api/projets] User:', user?.id || 'NOT AUTHENTICATED');

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[POST /api/projets] Body:', body);

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

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    console.log('[POST /api/projets] Creating project:', { name, type });

    // Create the project
    const { data: project, error: projectError } = await db
      .from('projects')
      .insert({
        name,
        type,
        description: null,
        context: context || null,
        objective: objective || null,
        activities: activities || null,
        deliverables: deliverables || null,
        means: null,
        client_id: null,
        cover_image_url: coverImageUrl || null,
        is_active: true,
        kpis: kpis || [],
        color: color || '#4f6ef7',
        charge_hours: estimatedHours ? parseInt(estimatedHours) : null,
        priority: priority || 3,
        deadline: deadline || null,
      })
      .select()
      .single();

    if (projectError) {
      console.error('[POST /api/projets] Error creating project:', projectError);
      return NextResponse.json(
        {
          error: projectError.message,
          code: (projectError as any).code,
          details: (projectError as any).details,
          hint: (projectError as any).hint,
        },
        { status: 500 }
      );
    }

    console.log('[POST /api/projets] Project created:', project);

    if (Array.isArray(phases) && phases.length) {
      const phaseRows = phases.map((phase: { name?: string }, index: number) => ({
        project_id: project.id,
        name: phase.name || `Phase ${index + 1}`,
        order_index: index,
      }));

      const { data: insertedPhases, error: phaseInsertError } = await db
        .from('project_phases')
        .insert(phaseRows)
        .select('*');

      if (phaseInsertError) {
        console.error('[POST /api/projets] Error inserting phases:', phaseInsertError);
        return NextResponse.json(
          {
            error: phaseInsertError.message,
            code: (phaseInsertError as any).code,
            details: (phaseInsertError as any).details,
            hint: (phaseInsertError as any).hint,
          },
          { status: 500 }
        );
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
            project_id: project.id,
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

      if (stepsToInsert.length) {
        const { error: stepInsertError } = await db
          .from('project_steps')
          .insert(stepsToInsert);

        if (stepInsertError) {
          console.error('[POST /api/projets] Error inserting steps:', stepInsertError);
          return NextResponse.json(
            {
              error: stepInsertError.message,
              code: (stepInsertError as any).code,
              details: (stepInsertError as any).details,
              hint: (stepInsertError as any).hint,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('[POST /api/projets] Exception:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
