import { createClient } from '@/lib/supabase/server';
import ProspectionBoard from '@/components/prospection/ProspectionBoard';

export default async function ProspectionPage() {
  const supabase = await createClient();

  const { data: pairs } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .select('sector, segment')
    .not('sector', 'is', null);

  const typedPairs = (pairs ?? []) as Array<{
    sector: string | null;
    segment: string | null;
  }>;

  const sectors = Array.from(
    new Set(typedPairs.map((pair) => pair.sector).filter(Boolean))
  ) as string[];

  const segments = Array.from(
    new Set(typedPairs.map((pair) => pair.segment).filter(Boolean))
  ) as string[];

  const segmentsBySector = typedPairs.reduce<Record<string, string[]>>(
    (acc, pair) => {
      const sector = pair.sector;
      const segment = pair.segment;
      if (!sector || !segment) return acc;
      if (!acc[sector]) acc[sector] = [];
      if (!acc[sector].includes(segment)) acc[sector].push(segment);
      return acc;
    },
    {}
  );

  return (
    <div className="relative min-h-screen flex-1 flex flex-col gap-3 px-4 pb-6 pt-2 md:px-6 md:pb-8 md:pt-2 lg:pt-4">
      <div className="absolute inset-0 -z-10" style={{ background: '#f2f2f2' }} />
      <ProspectionBoard
        segments={segments}
        sectors={sectors}
        segmentsBySector={segmentsBySector}
      />
    </div>
  );
}
