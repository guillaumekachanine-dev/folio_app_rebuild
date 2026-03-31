import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: agentClient, error: clientError } = await supabase
    .schema('agent_business_analyst')
    .from('clients')
    .select('id')
    .eq('source_prospect_id', params.id)
    .single();

  if (clientError || !agentClient?.id) {
    return NextResponse.json({ mission_id: null });
  }

  const { data: mission, error: missionError } = await supabase
    .schema('agent_business_analyst')
    .from('missions')
    .select('id, created_at')
    .eq('client_id', agentClient.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (missionError) {
    if (missionError.code === 'PGRST116') {
      return NextResponse.json({ mission_id: null });
    }
    console.error('Error fetching mission:', missionError);
    return NextResponse.json({ error: missionError.message }, { status: 500 });
  }

  return NextResponse.json({ mission_id: mission?.id ?? null });
}
