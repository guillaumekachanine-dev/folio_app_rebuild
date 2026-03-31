import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.N8N_PHASE1_WEBHOOK_URL;

export async function GET(
  _request: Request,
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

  const { data, error } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .select('analysis_status, analysis_data')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching analysis status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let missionPayload: Record<string, any> = {};
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
      .select(
        'id, phase_courante, statut_phase_1, statut_phase_2, statut_phase_3, statut_phase_4, statut_phase_5, document_url'
      )
      .eq('client_id', agentClient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (mission) {
      missionPayload = {
        mission_id: mission.id,
        phase_courante: mission.phase_courante,
        statut_phase_1: mission.statut_phase_1,
        statut_phase_2: mission.statut_phase_2,
        statut_phase_3: mission.statut_phase_3,
        statut_phase_4: mission.statut_phase_4,
        statut_phase_5: mission.statut_phase_5,
        document_url: mission.document_url,
      };
    }
  }

  return NextResponse.json({
    analysis_status: data?.analysis_status ?? 'idle',
    analysis_data: data?.analysis_data ?? null,
    ...missionPayload,
  });
}

export async function POST(
  _request: Request,
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

  await supabase
    .schema('lethia_build')
    .from('prospects')
    .update({ analysis_status: 'running' })
    .eq('id', id);

  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_id: id }),
      });
    } catch (error) {
      console.error('Error triggering analysis webhook:', error);
    }
  }

  return NextResponse.json({ analysis_status: 'running' });
}

export async function DELETE(
  _request: Request,
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

  const { data, error } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .update({ analysis_status: 'idle', analysis_data: null })
    .eq('id', id)
    .select('analysis_status, analysis_data')
    .single();

  if (error) {
    console.error('Error resetting analysis:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    analysis_status: data?.analysis_status ?? 'idle',
    analysis_data: data?.analysis_data ?? null,
  });
}
