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
  const idsParam = params.get('prospect_ids') || '';
  const contactRole = params.get('contact_role');

  const prospectIds = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!prospectIds.length) {
    return NextResponse.json([]);
  }

  let query = supabase
    .schema('lethia_build')
    .from('contacts')
    .select('prospect_id,email,phone')
    .in('prospect_id', prospectIds);

  if (contactRole) {
    query = query.eq('role', contactRole);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error counting contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts: Record<
    string,
    { total: number; email: number; phone: number }
  > = {};
  for (const id of prospectIds) counts[id] = { total: 0, email: 0, phone: 0 };
  data?.forEach((row: any) => {
    if (!row.prospect_id) return;
    const entry = counts[row.prospect_id] ?? { total: 0, email: 0, phone: 0 };
    entry.total += 1;
    if (row.email) entry.email += 1;
    if (row.phone) entry.phone += 1;
    counts[row.prospect_id] = entry;
  });

  const response = prospectIds.map((id) => ({
    prospect_id: id,
    count: counts[id]?.total ?? 0,
    email: counts[id]?.email ?? 0,
    phone: counts[id]?.phone ?? 0,
  }));

  return NextResponse.json(response);
}
