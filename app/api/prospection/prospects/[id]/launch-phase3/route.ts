import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.N8N_PHASE3_WEBHOOK_URL;

export async function POST(
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

  if (!WEBHOOK_URL) {
    return NextResponse.json({ error: 'Missing N8N_PHASE3_WEBHOOK_URL' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  const { data: agentClient, error: clientError } = await supabase
    .schema('agent_business_analyst')
    .from('clients')
    .select('id')
    .eq('source_prospect_id', id)
    .single();

  if (clientError || !agentClient?.id) {
    return NextResponse.json({ error: 'Agent client not found' }, { status: 404 });
  }

  const { data: missionData, error: missionError } = await supabase
    .schema('agent_business_analyst')
    .from('missions')
    .select('id')
    .eq('client_id', agentClient.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (missionError || !missionData?.id) {
    return NextResponse.json({ error: 'Mission ID not found' }, { status: 404 });
  }

  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prospect_id: id,
      mission_id: missionData.id,
      callback_url: body.callback_url,
    }),
  });

  return NextResponse.json({ success: true });
}
