import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PHASES = [2, 3, 4, 5];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const service = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idsParam = request.nextUrl.searchParams.get('prospect_ids') || '';
  const prospectIds = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!prospectIds.length) {
    return NextResponse.json([]);
  }

  const { data: agentClients, error: clientError } = await service
    .schema('agent_business_analyst')
    .from('clients')
    .select('id, source_prospect_id, data, nom');

  if (clientError) {
    console.error('Error fetching agent clients:', clientError);
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  const normalizeName = (value?: string | null) =>
    value
      ? value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase()
      : '';

  const clientByProspect: Record<string, string> = {};
  const clientDataByProspect: Record<string, any> = {};
  const prospectByClient: Record<string, string> = {};
  const clientByName = new Map<string, { id: string; data: any }>();

  agentClients?.forEach((row: { id: string; nom: string | null; data: any; source_prospect_id: string | null }) => {
    if (row?.nom) {
      clientByName.set(normalizeName(row.nom), { id: row.id, data: row.data });
    }
    if (row.source_prospect_id && prospectIds.includes(row.source_prospect_id)) {
      clientByProspect[row.source_prospect_id] = row.id;
      prospectByClient[row.id] = row.source_prospect_id;
      clientDataByProspect[row.source_prospect_id] = row.data;
    }
  });

  const missingProspects = prospectIds.filter((id) => !clientByProspect[id]);
  if (missingProspects.length) {
    const { data: prospects, error: prospectError } = await supabase
      .schema('lethia_build')
      .from('prospects')
      .select('id, company_name')
      .in('id', missingProspects);

    if (prospectError) {
      console.error('Error fetching prospects for client mapping:', prospectError);
      return NextResponse.json({ error: prospectError.message }, { status: 500 });
    }

    const names = (prospects || [])
      .map((row: any) => row.company_name?.trim())
      .filter(Boolean) as string[];

    if (names.length) {
      (prospects || []).forEach((row: any) => {
        if (row.id && row.company_name && !clientByProspect[row.id]) {
          const match = clientByName.get(normalizeName(row.company_name));
          if (match) {
            clientByProspect[row.id] = match.id;
            prospectByClient[match.id] = row.id;
            clientDataByProspect[row.id] = match.data;
          }
        }
      });
    }
  }

  const clientIds = Array.from(new Set(Object.values(clientByProspect)));

  let missionByProspect: Record<string, string> = {};
  if (clientIds.length) {
    const { data: missions, error: missionError } = await service
      .schema('agent_business_analyst')
      .from('missions')
      .select('id, client_id, created_at')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });

    if (missionError) {
      console.error('Error fetching missions:', missionError);
      return NextResponse.json({ error: missionError.message }, { status: 500 });
    }

    const seenClient: Record<string, boolean> = {};
    missions?.forEach((row: { id: string; client_id: string }) => {
      if (seenClient[row.client_id]) return;
      seenClient[row.client_id] = true;
      const prospectId = prospectByClient[row.client_id];
      if (prospectId) {
        missionByProspect[prospectId] = row.id;
      }
    });
  }

  const missionIds = Array.from(new Set(Object.values(missionByProspect)));

  // Phase 2 is stored in `analyses` table (written by external agent)
  // Phases 3-5 are stored in `resultats_phases` (written by the app)
  let phaseRows: Array<{
    mission_id: string;
    phase: number;
    statut: string | null;
    updated_at: string | null;
    completed_at: string | null;
  }> = [];

  const phase2ByMission: Record<string, { status: string; updated_at: string | null }> = {};

  if (missionIds.length) {
    const [phasesResult, analysesResult] = await Promise.all([
      service
        .schema('agent_business_analyst')
        .from('resultats_phases')
        .select('mission_id, phase, statut, updated_at, completed_at')
        .in('mission_id', missionIds)
        .in('phase', [3, 4, 5]),
      service
        .schema('agent_business_analyst')
        .from('analyses')
        .select('mission_id, statut, updated_at')
        .in('mission_id', missionIds)
        .eq('phase', 2)
        .eq('statut', 'generated')
        .not('contenu', 'is', null),
    ]);

    if (phasesResult.error) {
      console.error('Error fetching analysis phases:', phasesResult.error);
      return NextResponse.json({ error: phasesResult.error.message }, { status: 500 });
    }

    phaseRows = phasesResult.data || [];

    // Build phase 2 status map — presence of a row in analyses means the analysis is done
    (analysesResult.data || []).forEach((row: { mission_id: string; statut: string | null; updated_at: string | null }) => {
      if (!phase2ByMission[row.mission_id]) {
        phase2ByMission[row.mission_id] = { status: 'done', updated_at: row.updated_at };
      }
    });
  }

  const grouped: Record<string, Record<number, { status: string; updated_at: string | null }>> = {};
  phaseRows.forEach((row) => {
    const status =
      row.statut === 'running'
        ? 'running'
        : row.completed_at ||
            row.statut === 'generated' ||
            row.statut === 'done' ||
            row.statut === 'completed'
          ? 'done'
          : 'ready';
    if (!grouped[row.mission_id]) grouped[row.mission_id] = {};
    grouped[row.mission_id][row.phase] = { status, updated_at: row.updated_at };
  });

  const response = prospectIds.map((id) => {
    const missionId = missionByProspect[id];
    const phase1Status = clientDataByProspect[id] ? 'done' : 'missing';
    const phases = [
      { phase: 1, status: phase1Status, updated_at: null },
      ...DEFAULT_PHASES.map((phase) => {
        if (phase === 2) {
          const entry = missionId ? phase2ByMission[missionId] : null;
          return { phase: 2, status: entry ? entry.status : 'missing', updated_at: entry?.updated_at ?? null };
        }
        const entry = missionId ? grouped[missionId]?.[phase] : null;
        return { phase, status: entry ? entry.status : 'missing', updated_at: entry?.updated_at ?? null };
      }),
    ];
    const completed_count = phases.filter((phase) => phase.status === 'done').length;
    return { prospect_id: id, mission_id: missionId ?? null, phases, completed_count };
  });

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
    },
  });
}
