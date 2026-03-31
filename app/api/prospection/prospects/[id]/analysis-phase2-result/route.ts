import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const SHARED_SECRET = process.env.N8N_SHARED_SECRET;

async function isAuthorized(request: NextRequest) {
  const secret = request.headers.get('x-n8n-secret');
  if (secret && SHARED_SECRET && secret === SHARED_SECRET) return true;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const result = body.result ?? body.analysis_result ?? body;

  let missionId = body.mission_id;
  if (!missionId) {
    const { data: agentClient } = await supabase
      .schema('agent_business_analyst')
      .from('clients')
      .select('id')
      .eq('source_prospect_id', id)
      .single();

    if (agentClient?.id) {
      const { data: mission } = await supabase
        .schema('agent_business_analyst')
        .from('missions')
        .select('id')
        .eq('client_id', agentClient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      missionId = mission?.id;
    }
  }

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID not found' }, { status: 404 });
  }

  // Optional: keep a local mapping for fast lookups
  await supabase
    .schema('lethia_build')
    .from('prospect_missions')
    .upsert(
      {
        prospect_id: id,
        mission_id: missionId,
      },
      { onConflict: 'prospect_id,mission_id' }
    );

  const { data, error } = await supabase
    .schema('agent_business_analyst')
    .from('resultats_phases')
    .upsert(
      {
        mission_id: missionId,
        phase: 2,
        titre: body.titre || 'Phase 2',
        contenu_json: result,
        statut: body.statut || 'completed',
      },
      { onConflict: 'mission_id,phase' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving phase 2 result:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .schema('agent_business_analyst')
    .from('missions')
    .update({ statut_phase_2: body.statut || 'completed' })
    .eq('id', missionId);

  return NextResponse.json({ result: data?.contenu_json ?? result });
}

export async function GET(
  _request: NextRequest,
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

  let missionId: string | null = null;

  const { data: mapping } = await supabase
    .schema('lethia_build')
    .from('prospect_missions')
    .select('mission_id, created_at')
    .eq('prospect_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  missionId = mapping?.mission_id ?? null;

  if (!missionId) {
    const { data: agentClient } = await supabase
      .schema('agent_business_analyst')
      .from('clients')
      .select('id')
      .eq('source_prospect_id', id)
      .single();

    if (agentClient?.id) {
      const { data: mission } = await supabase
        .schema('agent_business_analyst')
        .from('missions')
        .select('id')
        .eq('client_id', agentClient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      missionId = mission?.id ?? null;
    }
  }

  if (!missionId) {
    return NextResponse.json({ result: null });
  }

  const { data, error } = await supabase
    .schema('agent_business_analyst')
    .from('resultats_phases')
    .select('contenu_json')
    .eq('mission_id', missionId)
    .eq('phase', 2)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ result: null });
    }
    console.error('Error fetching phase 2 result:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ result: data?.contenu_json ?? null });
}
