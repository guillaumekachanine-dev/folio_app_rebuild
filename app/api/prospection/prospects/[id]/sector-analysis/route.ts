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

  const phaseParam = request.nextUrl.searchParams.get('phase');
  const phase = phaseParam ? Number(phaseParam) : 2;

  const { data: agentClient, error: clientError } = await supabase
    .schema('agent_business_analyst')
    .from('clients')
    .select('id')
    .eq('source_prospect_id', id)
    .single();

  if (clientError || !agentClient?.id) {
    return NextResponse.json({ result: null });
  }

  const { data: mission, error: missionError } = await supabase
    .schema('agent_business_analyst')
    .from('missions')
    .select('id')
    .eq('client_id', agentClient.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (missionError || !mission?.id) {
    return NextResponse.json({ result: null });
  }

  const { data, error } = await supabase
    .schema('agent_business_analyst')
    .from('resultats_phases')
    .select('contenu_json')
    .eq('mission_id', mission.id)
    .eq('phase', phase)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ result: null });
    }
    console.error('Error fetching sector analysis:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ result: data?.contenu_json ?? null });
}
