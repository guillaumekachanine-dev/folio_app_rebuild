import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const prospectId = params.get('prospect_id');
  const prospectIdsParam = params.get('prospect_ids');
  const hasEmail = params.get('has_email');
  const hasPhone = params.get('has_phone');
  const contactRole = params.get('contact_role');
  const recentActivity = params.get('recent_activity');
  const limitParam = params.get('limit');

  let query = supabase.schema('lethia_build').from('contacts').select('*');

  if (prospectId) {
    query = query.eq('prospect_id', prospectId);
  }

  if (prospectIdsParam) {
    const ids = prospectIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length) {
      query = query.in('prospect_id', ids);
    }
  }

  if (contactRole) {
    query = query.eq('job_title', contactRole);
  }

  if (hasEmail === 'true') {
    query = query.not('email', 'is', null);
  }

  if (hasPhone === 'true') {
    query = query.not('phone', 'is', null);
  }

  if (recentActivity === 'true') {
    query = query.order('last_activity', { ascending: false });
  } else {
    query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });
  }

  if (limitParam) {
    const limit = Number(limitParam);
    if (!Number.isNaN(limit) && limit > 0) {
      query = query.limit(limit);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contacts = (data || []).map((contact: any) => ({
    id: contact.id,
    prospect_id: contact.prospect_id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    full_name: contact.full_name,
    company_name: contact.company_name,
    gender: contact.gender,
    role: contact.job_title,
    job_title: contact.job_title,
    email: contact.email,
    phone: contact.phone,
    linkedin_url: contact.linkedin_url,
    notes: contact.notes,
    last_activity: contact.last_activity,
    activity_note: contact.activity_note,
  }));

  return NextResponse.json(contacts);
}
