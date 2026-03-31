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

  const analysisStatus = body.analysis_status ?? 'done';
  const analysisData = body.analysis_data ?? body.result ?? null;

  const { data, error } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .update({ analysis_status: analysisStatus, analysis_data: analysisData })
    .eq('id', id)
    .select('analysis_status, analysis_data')
    .single();

  if (error) {
    console.error('Error saving analysis result:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: agentClient } = await supabase
    .schema('agent_business_analyst')
    .from('clients')
    .select('id')
    .eq('source_prospect_id', id)
    .single();

  if (agentClient?.id) {
    await supabase
      .schema('agent_business_analyst')
      .from('missions')
      .update({ statut_phase_1: analysisStatus || 'completed' })
      .eq('client_id', agentClient.id);
  }

  return NextResponse.json({
    analysis_status: data?.analysis_status ?? analysisStatus,
    analysis_data: data?.analysis_data ?? analysisData,
  });
}
