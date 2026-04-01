import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type RouteCtx = { params: Promise<{ id: string; stepId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  const { id: projectId, stepId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from('project_steps')
    .update(body)
    .eq('id', stepId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
