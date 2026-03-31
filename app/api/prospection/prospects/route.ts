import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function parseRevenueRange(range?: string | null) {
  if (!range) return null;
  switch (range) {
    case 'lt_100':
      return { min: null, max: 100 };
    case '100_300':
      return { min: 100, max: 300 };
    case '300_500':
      return { min: 300, max: 500 };
    case 'gt_500':
      return { min: 500, max: null };
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const search = params.get('search');
  const segment = params.get('segment');
  const sector = params.get('sector');
  const location = params.get('location');
  const hasPhone = params.get('has_phone');
  const contactRole = params.get('contact_role');
  const revenueRange = params.get('revenue_range');
  const limitParam = params.get('limit');

  let contactFilteredIds: string[] | null = null;
  if (hasPhone === 'true' || contactRole) {
    let contactsQuery = supabase
      .schema('lethia_build')
      .from('contacts')
      .select('prospect_id');

    if (hasPhone === 'true') {
      contactsQuery = contactsQuery.not('phone', 'is', null);
    }

    if (contactRole) {
      contactsQuery = contactsQuery.eq('job_title', contactRole);
    }

    const { data: contactData, error: contactError } = await contactsQuery;

    if (contactError) {
      console.error('Error filtering contacts:', contactError);
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }

    contactFilteredIds = Array.from(
      new Set((contactData || []).map((row: any) => row.prospect_id))
    ).filter(Boolean) as string[];

    if (!contactFilteredIds.length) {
      return NextResponse.json([]);
    }
  }

  let searchContactIds: string[] | null = null;
  if (search) {
    const { data: contactMatches, error: contactSearchError } = await supabase
      .schema('lethia_build')
      .from('contacts')
      .select('prospect_id')
      .or(
        `full_name.ilike.%${search}%,job_title.ilike.%${search}%,company_name.ilike.%${search}%`
      );

    if (contactSearchError) {
      console.error('Error searching contacts:', contactSearchError);
      return NextResponse.json({ error: contactSearchError.message }, { status: 500 });
    }

    searchContactIds = Array.from(
      new Set((contactMatches || []).map((row: any) => row.prospect_id))
    ).filter(Boolean) as string[];
  }

  let query = supabase.schema('lethia_build').from('prospects').select('*');

  if (segment) query = query.eq('segment', segment);
  if (sector) query = query.eq('sector', sector);
  if (location) query = query.ilike('location', `%${location}%`);

  const range = parseRevenueRange(revenueRange);
  if (range) {
    // revenue is text in lethia_build; skip numeric filter for now
  }

  if (contactFilteredIds) {
    query = query.in('id', contactFilteredIds);
  }

  if (search) {
    if (searchContactIds && searchContactIds.length) {
      query = query.or(
        `company_name.ilike.%${search}%,id.in.(${searchContactIds.join(',')})`
      );
    } else {
      query = query.ilike('company_name', `%${search}%`);
    }
  }

  if (limitParam) {
    const limit = Number(limitParam);
    if (!Number.isNaN(limit) && limit > 0) {
      query = query.limit(limit);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const prospects = (data || []).map((client: any) => ({
    id: client.id,
    company_name: client.company_name,
    sector: client.sector,
    segment: client.segment,
    location: client.location,
    business_lines: client.business_lines,
    site_web: client.site_web,
    headquarters_address: client.headquarters_address,
    revenue: client.revenue,
    employee_count: client.employee_count,
    brand_color: client.brand_color,
    potential_score: client.potential_score,
    analysis_status: client.analysis_status,
    analysis_data: client.analysis_data,
    logo_url: client.logo_url,
  }));

  return NextResponse.json(prospects);
}
