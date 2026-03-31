import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, any> = {};

  if ('linkedin_url' in body) updates.linkedin_url = body.linkedin_url || null;
  if ('email' in body) updates.email = body.email || null;
  if ('phone' in body) updates.phone = body.phone || null;
  if ('notes' in body) updates.notes = body.notes || null;
  if ('last_activity' in body) updates.last_activity = body.last_activity || null;
  if ('activity_note' in body) updates.activity_note = body.activity_note || null;
  if ('job_title' in body) updates.job_title = body.job_title || null;

  const { data, error } = await supabase
    .schema('lethia_build')
    .from('contacts')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
