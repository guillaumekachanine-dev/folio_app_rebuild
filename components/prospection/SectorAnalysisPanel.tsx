'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BarChart2, Link2, Shield, Swords, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prospect } from './types';

type SectorAnalysisPanelProps = {
  data?: any;
  companyName?: string | null;
  logoUrl?: string | null;
  prospect?: Prospect | null;
  phase?: number;
};

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const renderValue = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return <p className="text-sm text-stone-400">Aucune information.</p>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-4 space-y-1 text-sm text-stone-700">
        {value.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="space-y-1 text-sm text-stone-700">
        {Object.entries(value).map(([key, entry]) => (
          <div key={key} className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              {titleCase(key)}
            </span>
            <span className="text-sm text-stone-700">
              {entry === null || entry === undefined ? '-' : String(entry)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-stone-700 whitespace-pre-wrap">{String(value)}</p>;
};

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BarChart2;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-stone-500" />
      <p className="text-sm font-semibold text-stone-900">{title}</p>
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

export default function SectorAnalysisPanel({
  data,
  companyName,
  logoUrl,
  prospect,
  phase = 2,
}: SectorAnalysisPanelProps) {
  const [payload, setPayload] = useState<any>(data ?? null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPayload(data ?? null);
  }, [data]);

  useEffect(() => {
    if (data || !prospect) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/prospection/prospects/${prospect.id}/sector-analysis?phase=${phase}`
        );
        if (res.ok) {
          const result = await res.json();
          setPayload(result.result ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [data, phase, prospect]);

  const content = payload ?? null;

  const pickSection = (keys: string[]) => {
    if (!content || typeof content !== 'object') return null;
    for (const key of keys) {
      if (content[key] !== undefined && content[key] !== null) return content[key];
    }
    return null;
  };

  const market = pickSection(['marche', 'market', 'marche_cible']);
  const actors = pickSection(['acteurs', 'actors', 'participants']);
  const valueChain = pickSection(['chaine_de_valeur', 'value_chain', 'chaine_valeur']);
  const regulation = pickSection(['reglementation', 'regulation', 'regles']);
  const competition = pickSection(['concurrence', 'competition']);
  const clientele = pickSection(['clientele', 'clients', 'customer']);
  const resolvedName = companyName ?? prospect?.company_name ?? 'Prospect';
  const resolvedLogo = logoUrl ?? prospect?.logo_url ?? null;

  if (isLoading) {
    return <p className="text-xs text-stone-400">Chargement...</p>;
  }

  if (!content) {
    return <p className="text-xs text-stone-400">Aucun resultat disponible.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Analyse secteur
          </p>
          <p className="text-base font-semibold text-stone-900">{resolvedName}</p>
        </div>
        {resolvedLogo ? (
          <img src={resolvedLogo} alt={resolvedName} className="h-10 w-auto object-contain" />
        ) : null}
      </div>

      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2')}>
        <Section icon={BarChart2} title="Marche">
          {renderValue(market)}
        </Section>
        <Section icon={Users} title="Acteurs">
          {renderValue(actors)}
        </Section>
        <Section icon={Link2} title="Chaine de valeur">
          {renderValue(valueChain)}
        </Section>
        <Section icon={Shield} title="Reglementation">
          {renderValue(regulation)}
        </Section>
        <Section icon={Swords} title="Concurrence">
          {renderValue(competition)}
        </Section>
        <Section icon={Target} title="Clientele">
          {renderValue(clientele)}
        </Section>
      </div>
    </div>
  );
}
