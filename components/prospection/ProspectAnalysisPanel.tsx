'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Building2, Newspaper, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prospect } from './types';

type ProspectAnalysisPanelProps = {
  data?: any;
  companyName?: string | null;
  logoUrl?: string | null;
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
  icon: typeof Building2;
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

export default function ProspectAnalysisPanel({
  data,
  companyName,
  logoUrl,
  prospect,
}: ProspectAnalysisPanelProps) {
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
        const res = await fetch(`/api/prospection/prospects/${prospect.id}/analyze`);
        if (res.ok) {
          const result = await res.json();
          setPayload(result.analysis_data ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [data, prospect]);

  const content = payload ?? null;
  const synthese = useMemo(() => {
    if (!content || typeof content !== 'object') return null;
    return (
      content.synthese ??
      content.synthesis ??
      content.summary ??
      content.resume ??
      content.overview ??
      null
    );
  }, [content]);

  const pickSection = (keys: string[]) => {
    if (!content || typeof content !== 'object') return null;
    for (const key of keys) {
      if (content[key] !== undefined && content[key] !== null) return content[key];
    }
    return null;
  };

  const identity = pickSection(['identite', 'identity', 'profil', 'profil_entreprise']);
  const positioning = pickSection(['positionnement', 'positioning', 'position']);
  const signals = pickSection(['signaux', 'signals', 'indicateurs']);
  const sector = pickSection(['secteur', 'sector', 'industrie']);
  const resolvedName = companyName ?? prospect?.company_name ?? 'Prospect';
  const resolvedLogo = logoUrl ?? prospect?.logo_url ?? null;

  if (isLoading) {
    return <p className="text-xs text-stone-400">Chargement...</p>;
  }

  if (!content) {
    return <p className="text-xs text-stone-400">Aucune analyse disponible.</p>;
  }

  const hasSynthese = !!synthese;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Analyse globale
          </p>
          <p className="text-base font-semibold text-stone-900">{resolvedName}</p>
        </div>
        {resolvedLogo ? (
          <img src={resolvedLogo} alt={resolvedName} className="h-10 w-auto object-contain" />
        ) : null}
      </div>

      {hasSynthese && (
        <Section title="Synthese" icon={TrendingUp} accent>
          {renderValue(synthese)}
        </Section>
      )}

      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2', hasSynthese && 'mt-4')}>
        <Section icon={Building2} title="Identite">
          {renderValue(identity)}
        </Section>
        <Section icon={Users} title="Positionnement">
          {renderValue(positioning)}
        </Section>
        <Section icon={TrendingUp} title="Signaux">
          {renderValue(signals)}
        </Section>
        <Section icon={Newspaper} title="Secteur">
          {renderValue(sector)}
        </Section>
      </div>
    </div>
  );
}
