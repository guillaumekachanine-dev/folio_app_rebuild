import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET = process.env.PROSPECTION_LOGOS_BUCKET || 'prospection_logos';

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

  const contentType = request.headers.get('content-type') || '';
  const updates: Record<string, any> = {};

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();

    const companyName = formData.get('company_name');
    if (typeof companyName === 'string') updates.company_name = companyName.trim();

    const sector = formData.get('sector');
    if (typeof sector === 'string') updates.sector = sector || null;

    const segment = formData.get('segment');
    if (typeof segment === 'string') updates.segment = segment || null;

    const location = formData.get('location');
    if (typeof location === 'string') updates.location = location || null;

    const businessLines = formData.get('business_lines');
    if (typeof businessLines === 'string') updates.business_lines = businessLines || null;

    const siteWeb = formData.get('site_web');
    if (typeof siteWeb === 'string') updates.site_web = siteWeb || null;

    const headquarters = formData.get('headquarters_address');
    if (typeof headquarters === 'string') updates.headquarters_address = headquarters || null;

    const revenue = formData.get('revenue');
    if (typeof revenue === 'string') updates.revenue = revenue || null;

    const employeeCount = formData.get('employee_count');
    if (typeof employeeCount === 'string') updates.employee_count = employeeCount || null;

    const brandColor = formData.get('brand_color');
    if (typeof brandColor === 'string') updates.brand_color = brandColor || null;

    const potentialScore = formData.get('potential_score');
    if (typeof potentialScore === 'string' && potentialScore !== '') {
      const score = Number(potentialScore);
      if (score < 1 || score > 5) {
        return NextResponse.json(
          { error: 'potential_score must be between 1 and 5' },
          { status: 400 }
        );
      }
      updates.potential_score = score;
    }

    const logoFile = formData.get('logo');
    if (logoFile instanceof File) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const fileName = `${params.id}/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, buffer, { contentType: logoFile.type, upsert: true });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      updates.logo_url = publicData.publicUrl;
    }
  } else {
    const body = await request.json();

    if ('company_name' in body) updates.company_name = body.company_name || null;
    if ('sector' in body) updates.sector = body.sector || null;
    if ('segment' in body) updates.segment = body.segment || null;
    if ('location' in body) updates.location = body.location || null;
    if ('business_lines' in body) updates.business_lines = body.business_lines || null;
    if ('site_web' in body) updates.site_web = body.site_web || null;
    if ('headquarters_address' in body)
      updates.headquarters_address = body.headquarters_address || null;
    if ('revenue' in body) updates.revenue = body.revenue ?? null;
    if ('employee_count' in body) updates.employee_count = body.employee_count ?? null;
    if ('brand_color' in body) updates.brand_color = body.brand_color || null;

    if ('potential_score' in body && body.potential_score !== null) {
      const score = Number(body.potential_score);
      if (score < 1 || score > 5) {
        return NextResponse.json(
          { error: 'potential_score must be between 1 and 5' },
          { status: 400 }
        );
      }
      updates.potential_score = score;
    }
  }

  const { data, error } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prospect:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    company_name: data.company_name,
    sector: data.sector,
    segment: data.segment,
    location: data.location,
    business_lines: data.business_lines,
    site_web: data.site_web,
    headquarters_address: data.headquarters_address,
    revenue: data.revenue,
    employee_count: data.employee_count,
    brand_color: data.brand_color,
    potential_score: data.potential_score,
    analysis_status: data.analysis_status,
    analysis_data: data.analysis_data,
    logo_url: data.logo_url,
  });
}
