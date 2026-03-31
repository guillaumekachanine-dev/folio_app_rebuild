import { createClient } from '@/lib/supabase/server';
import ProspectionBoard from '@/components/prospection/ProspectionBoard';

export default async function ProspectionPage() {
  const supabase = await createClient();

  const { data: pairs } = await supabase
    .schema('lethia_build')
    .from('prospects')
    .select('sector, segment')
    .not('sector', 'is', null);

  const sectors = Array.from(
    new Set((pairs || []).map((pair) => pair.sector).filter(Boolean))
  ) as string[];

  const segments = Array.from(
    new Set((pairs || []).map((pair) => pair.segment).filter(Boolean))
  ) as string[];

  const segmentsBySector = (pairs || []).reduce<Record<string, string[]>>(
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
    <div className="flex-1 flex flex-col gap-3 px-4 pb-4 pt-0 -mt-4 md:px-6 md:pb-6 md:pt-0 md:-mt-4 lg:-mt-6">
      <ProspectionBoard
        segments={segments}
        sectors={sectors}
        segmentsBySector={segmentsBySector}
      />
    </div>
  );
}
