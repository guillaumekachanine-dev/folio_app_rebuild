'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Activity, AlertTriangle, Cpu, TrendingUp, Wrench, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prospect } from './types';

type ProcessDiagnosticPanelProps = {
  data?: any;
  companyName?: string | null;
  prospect?: Prospect | null;
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
  accent,
  children,
}: {
  title: string;
  icon: typeof Activity;
  accent?: boolean;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'rounded-xl border bg-white p-4 shadow-sm',
      accent ? 'border-blue-200 bg-blue-50' : 'border-stone-200'
    )}
  >
    <div className="flex items-center gap-2">
      <Icon size={16} className={accent ? 'text-blue-600' : 'text-stone-500'} />
      <p className="text-sm font-semibold text-stone-900">{title}</p>
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

export default function ProcessDiagnosticPanel({
  data,
  companyName,
  prospect,
}: ProcessDiagnosticPanelProps) {
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
          `/api/prospection/prospects/${prospect.id}/sector-analysis?phase=3`
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
  }, [data, prospect]);

  const content = payload ?? null;

  const pickSection = (keys: string[]) => {
    if (!content || typeof content !== 'object') return null;
    for (const key of keys) {
      if (content[key] !== undefined && content[key] !== null) return content[key];
    }
    return null;
  };

  const eligible = pickSection([
    'processus_eligibles',
    'eligible',
    'processus_automatisation',
    'processus_eligibles_automatisation',
  ]);
  const quickWins = pickSection(['quick_wins', 'quickwins', 'wins']);
  const priorites = pickSection(['priorites', 'priorities', 'priorites_transformation']);
  const patterns = pickSection(['patterns', 'patternes', 'patterns_identifies']);
  const carto = pickSection(['cartographie', 'cartographie_technique', 'architecture']);
  const nonEligible = pickSection(['processus_non_eligibles', 'non_eligibles', 'ineligible']);
  const resolvedName = companyName ?? prospect?.company_name ?? 'Prospect';

  if (isLoading) {
    return <p className="text-xs text-stone-400">Chargement...</p>;
  }

  if (!content) {
    return <p className="text-xs text-stone-400">Aucun resultat disponible.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Diagnostic processus
        </p>
        <p className="text-base font-semibold text-stone-900">{resolvedName}</p>
      </div>

      {eligible && (
        <Section icon={Activity} title="Processus eligibles a l'automatisation">
          {renderValue(eligible)}
        </Section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickWins && (
          <Section icon={Zap} title="Quick wins" accent>
            {renderValue(quickWins)}
          </Section>
        )}
        {priorites && (
          <Section icon={TrendingUp} title="Priorites de transformation">
            {renderValue(priorites)}
          </Section>
        )}
        {patterns && (
          <Section icon={AlertTriangle} title="Patterns identifies">
            {renderValue(patterns)}
          </Section>
        )}
        {carto && (
          <Section icon={Wrench} title="Cartographie technique">
            {renderValue(carto)}
          </Section>
        )}
        {nonEligible && (
          <Section icon={Cpu} title="Processus non eligibles">
            {renderValue(nonEligible)}
          </Section>
        )}
      </div>
    </div>
  );
}
