'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Info,
  Mail,
  Pencil,
  Phone,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ContactDetailPopup from './ContactDetailPopup';
import ProspectAnalysisPanel from './ProspectAnalysisPanel';
import ProcessDiagnosticPanel from './ProcessDiagnosticPanel';
import SectorAnalysisPanel from './SectorAnalysisPanel';
import type { PhaseStatus, Prospect, ProspectContact } from './types';

type ProspectionBoardProps = {
  segments: string[];
  sectors: string[];
  segmentsBySector: Record<string, string[]>;
};

type AnalysisItem = {
  id: string;
  title: string;
  phase?: number;
  html?: string | null;
  data?: any;
  updatedAt?: string | null;
};

type AnalysisResultsStack = {
  prospect: Prospect;
  items: AnalysisItem[];
};

type AnalysisPhasePayload = {
  prospect: Prospect;
  phase: number;
  title: string;
  html?: string | null;
  data?: any;
};

export default function ProspectionBoard({
  segments,
  sectors,
  segmentsBySector,
}: ProspectionBoardProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [flippedProspectId, setFlippedProspectId] = useState<string | null>(null);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [identityDraft, setIdentityDraft] = useState('');
  const [contactCounts, setContactCounts] = useState<
    Record<string, { total: number; email: number; phone: number }>
  >({});
  const [contacts, setContacts] = useState<ProspectContact[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [activeContact, setActiveContact] = useState<ProspectContact | null>(null);
  const [phaseStatuses, setPhaseStatuses] = useState<Record<string, PhaseStatus[]>>({});
  const [phaseCounts, setPhaseCounts] = useState<Record<string, number>>({});
  const [analysisModalProspect, setAnalysisModalProspect] = useState<Prospect | null>(null);
  const [analysisPhasePayload, setAnalysisPhasePayload] = useState<AnalysisPhasePayload | null>(null);
  const [analysisResultsStack, setAnalysisResultsStack] = useState<AnalysisResultsStack | null>(null);
  const [analysisPhasePickerProspect, setAnalysisPhasePickerProspect] =
    useState<Prospect | null>(null);
  const [analysisResultsPickerProspect, setAnalysisResultsPickerProspect] =
    useState<Prospect | null>(null);

  const formatNumeric = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '-';
    const raw = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(raw)) return String(value);
    return new Intl.NumberFormat('fr-FR').format(raw);
  };

  const phaseLabels: Record<number, string> = {
    1: 'Analyse globale',
    2: 'Analyse secteur',
    3: 'Analyse phase 3',
    4: 'Analyse phase 4',
    5: 'Analyse phase 5',
  };

  const palette = {
    primaryBorder: '#1E1B4B',
  };

  const getPhaseStatus = (prospect: Prospect, phase: number) => {
    const phases = phaseStatuses[prospect.id] ?? [];
    return phases.find((p) => p.phase === phase)?.status ?? 'missing';
  };

  const getPhaseCount = (prospect: Prospect) => {
    if (phaseCounts[prospect.id] !== undefined) return phaseCounts[prospect.id];
    const phases = phaseStatuses[prospect.id] ?? [];
    return phases.filter((p) => p.status === 'done').length;
  };

  const hasRunningPhase = (prospect: Prospect) => {
    const phases = phaseStatuses[prospect.id] ?? [];
    return phases.some((p) => p.status === 'running');
  };

  const segmentOptions = useMemo(() => {
    if (!sectorFilter) return segments;
    return segmentsBySector[sectorFilter] ?? [];
  }, [sectorFilter, segments, segmentsBySector]);

  const loadProspects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sectorFilter) params.set('sector', sectorFilter);
      if (segmentFilter) params.set('segment', segmentFilter);
      const response = await fetch(`/api/prospection/prospects?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProspects(data);
        if (selectedProspect) {
          const updated = data.find((p: Prospect) => p.id === selectedProspect.id) || null;
          setSelectedProspect(updated);
        }
        if (data.length) {
          loadContactCounts(data.map((p: Prospect) => p.id));
          loadPhaseStatuses(data.map((p: Prospect) => p.id));
        } else {
          setContactCounts({});
          setPhaseStatuses({});
          setPhaseCounts({});
        }
      }
    } catch (error) {
      console.error('Erreur chargement prospects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContactCounts = async (ids: string[]) => {
    if (!ids.length) return;
    const params = new URLSearchParams();
    params.set('prospect_ids', ids.join(','));
    const response = await fetch(`/api/prospection/contacts-count?${params.toString()}`);
    if (!response.ok) return;
    const data = await response.json();
    const counts: Record<string, { total: number; email: number; phone: number }> = {};
    data.forEach(
      (entry: { prospect_id: string; count: number; email?: number; phone?: number }) => {
        counts[entry.prospect_id] = {
          total: entry.count ?? 0,
          email: entry.email ?? 0,
          phone: entry.phone ?? 0,
        };
      }
    );
    setContactCounts(counts);
  };

  const loadPhaseStatuses = async (ids: string[]) => {
    if (!ids.length) return;
    const params = new URLSearchParams();
    params.set('prospect_ids', ids.join(','));
    const response = await fetch(`/api/prospection/prospects/analysis-phases?${params.toString()}`);
    if (!response.ok) {
      console.error('Erreur chargement phases:', await response.text());
      return;
    }
    const data = await response.json();
    const next: Record<string, PhaseStatus[]> = {};
    const counts: Record<string, number> = {};
    data.forEach(
      (entry: { prospect_id: string; phases: PhaseStatus[]; completed_count?: number }) => {
        if (!entry?.prospect_id) return;
        next[entry.prospect_id] = entry.phases ?? [];
        counts[entry.prospect_id] = entry.completed_count ?? 0;
      }
    );
    setPhaseStatuses(next);
    setPhaseCounts(counts);
  };

  const loadContacts = async (prospectId: string) => {
    setIsContactsLoading(true);
    try {
      const response = await fetch(`/api/prospection/contacts?prospect_id=${prospectId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } finally {
      setIsContactsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadProspects();
    }, 250);
    return () => clearTimeout(debounce);
  }, [search, sectorFilter, segmentFilter]);

  useEffect(() => {
    if (!selectedProspect) {
      setContacts([]);
      return;
    }
    loadContacts(selectedProspect.id);
  }, [selectedProspect]);

  const handleSelectProspect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    clearAnalysisSelection();
  };

  const toggleFlip = (prospectId: string) => {
    setFlippedProspectId((prev) => (prev === prospectId ? null : prospectId));
  };

  const triggerAnalysis = async (prospectId: string) => {
    await fetch(`/api/prospection/prospects/${prospectId}/analyze`, {
      method: 'POST',
    });
    loadProspects();
  };

  const triggerPhase3 = async (prospectId: string) => {
    await fetch(`/api/prospection/prospects/${prospectId}/launch-phase3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    loadProspects();
  };

  const clearAnalysisSelection = () => {
    setAnalysisModalProspect(null);
    setAnalysisPhasePayload(null);
    setAnalysisResultsStack(null);
  };

  const isHtmlString = (value: any) =>
    typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value);

  const normalizePayload = (value: any) => {
    if (value === null || value === undefined) return { html: null, data: null };
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (isHtmlString(trimmed)) {
        return { html: trimmed, data: null };
      }
      try {
        return { html: null, data: JSON.parse(trimmed) };
      } catch {
        return { html: null, data: trimmed };
      }
    }
    if (typeof value === 'object' && value !== null) {
      if ('html' in value && typeof value.html === 'string') {
        return { html: value.html as string, data: (value as any).data ?? value };
      }
      return { html: null, data: value };
    }
    return { html: null, data: value };
  };

  const fetchPhaseResult = async (prospectId: string, phase: number) => {
    const endpoint =
      phase === 2
        ? `/api/prospection/prospects/${prospectId}/analysis-phase2-result`
        : phase === 3
          ? `/api/prospection/prospects/${prospectId}/analysis-phase3-result`
          : `/api/prospection/prospects/${prospectId}/sector-analysis?phase=${phase}`;

    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.result ?? null;
  };

  const openAnalysisForPhase = async (prospect: Prospect, phase: number) => {
    clearAnalysisSelection();
    if (phase <= 1) {
      setAnalysisModalProspect(prospect);
      return;
    }
    const payload = await fetchPhaseResult(prospect.id, phase);
    const normalized = normalizePayload(payload);
    setAnalysisPhasePayload({
      prospect,
      phase,
      title: phaseLabels[phase] ?? `Phase ${phase}`,
      html: normalized.html,
      data: normalized.data,
    });
  };

  const openResultsPicker = (prospect: Prospect) => {
    setAnalysisResultsPickerProspect(prospect);
  };

  const renderDataBlock = (data: any) => {
    if (data === null || data === undefined || data === '') {
      return <p className="text-xs text-stone-400">Aucun contenu.</p>;
    }
    if (typeof data === 'string') {
      return <p className="whitespace-pre-wrap text-sm text-stone-700">{data}</p>;
    }
    return (
      <pre className="max-h-96 overflow-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const renderAnalysisPanel = () => {
    if (analysisResultsStack) {
      return (
        <div className="flex h-full min-h-0 flex-col bg-white">
          <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#B45309] px-5 py-3 shrink-0">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Resultats d&apos;analyse
              </p>
              <p className="text-sm font-semibold text-white">
                {analysisResultsStack.prospect.company_name}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAnalysisSelection}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
            >
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {analysisResultsStack.items.length ? (
              analysisResultsStack.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                        {item.phase ? `Phase ${item.phase}` : 'Analyse'}
                      </p>
                      <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {item.html ? (
                      <div
                        className="analysis-html prose prose-sm max-w-none text-stone-700"
                        dangerouslySetInnerHTML={{ __html: item.html }}
                      />
                    ) : item.data ? (
                      renderDataBlock(item.data)
                    ) : (
                      <p className="text-xs text-stone-400">Aucun resultat disponible.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-400">Aucun resultat disponible.</p>
            )}
          </div>
        </div>
      );
    }

    if (analysisModalProspect) {
      const normalizedPhase1 = normalizePayload(analysisModalProspect.analysis_data);
      return (
        <div className="flex h-full min-h-0 flex-col bg-white">
          <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#B45309] px-5 py-3 shrink-0">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Resultat phase 1
              </p>
              <p className="text-sm font-semibold text-white">
                {analysisModalProspect.company_name}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAnalysisSelection}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
            >
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {normalizedPhase1.html ? (
              <div
                className="analysis-html prose prose-sm max-w-none text-stone-700"
                dangerouslySetInnerHTML={{ __html: normalizedPhase1.html }}
              />
            ) : normalizedPhase1.data && typeof normalizedPhase1.data === 'object' ? (
              <ProspectAnalysisPanel
                data={normalizedPhase1.data}
                companyName={analysisModalProspect.company_name}
                logoUrl={analysisModalProspect.logo_url}
                prospect={analysisModalProspect}
              />
            ) : normalizedPhase1.data ? (
              renderDataBlock(normalizedPhase1.data)
            ) : (
              <ProspectAnalysisPanel
                companyName={analysisModalProspect.company_name}
                logoUrl={analysisModalProspect.logo_url}
                prospect={analysisModalProspect}
              />
            )}
          </div>
        </div>
      );
    }

    if (analysisPhasePayload) {
      return (
        <div className="flex h-full min-h-0 flex-col bg-white">
          <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#B45309] px-5 py-3 shrink-0">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {analysisPhasePayload.title}
              </p>
              <p className="text-sm font-semibold text-white">
                {analysisPhasePayload.prospect.company_name}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAnalysisSelection}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
            >
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {analysisPhasePayload.html ? (
              <div
                className="analysis-html prose prose-sm max-w-none text-stone-700"
                dangerouslySetInnerHTML={{ __html: analysisPhasePayload.html }}
              />
            ) : analysisPhasePayload.data ? (
              analysisPhasePayload.phase === 2 && typeof analysisPhasePayload.data === 'object' ? (
                <SectorAnalysisPanel
                  data={analysisPhasePayload.data}
                  companyName={analysisPhasePayload.prospect.company_name}
                  logoUrl={analysisPhasePayload.prospect.logo_url}
                />
              ) : analysisPhasePayload.phase === 3 && typeof analysisPhasePayload.data === 'object' ? (
                <ProcessDiagnosticPanel
                  data={analysisPhasePayload.data}
                  companyName={analysisPhasePayload.prospect.company_name}
                />
              ) : (
                renderDataBlock(analysisPhasePayload.data)
              )
            ) : (
              <p className="text-xs text-stone-400">Aucun resultat disponible.</p>
            )}
          </div>
        </div>
      );
    }

      return (
        <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#B45309] px-5 py-3 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Resultats d&apos;analyse
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-2xl bg-white p-6 text-sm text-stone-400">
            Selectionnez un prospect puis choisissez une analyse a afficher.
          </div>
        </div>
      </div>
    );
  };

  const startEditingIdentity = (prospect: Prospect) => {
    setEditingIdentityId(prospect.id);
    setIdentityDraft(prospect.company_name);
  };

  const saveIdentity = async (prospectId: string) => {
    if (!identityDraft.trim()) return;
    await fetch(`/api/prospection/prospects/${prospectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: identityDraft.trim() }),
    });
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, company_name: identityDraft.trim() } : p))
    );
    if (selectedProspect?.id === prospectId) {
      setSelectedProspect({ ...selectedProspect, company_name: identityDraft.trim() });
    }
    setEditingIdentityId(null);
  };

  const handleSaveContact = async (payload: Partial<ProspectContact>) => {
    if (!activeContact) return;
    await fetch(`/api/prospection/contacts/${activeContact.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === activeContact.id ? { ...contact, ...payload } : contact
      )
    );
  };

  const renderContactsPanel = (prospect: Prospect) => (
    <div className="rounded-[28px] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em] text-blue-600">
          Contacts
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-blue-600">
          <Phone size={16} />
        </div>
      </div>
      <div className="divide-y divide-stone-100">
        {isContactsLoading ? (
          <div className="px-5 py-4 text-sm text-stone-400">Chargement...</div>
        ) : contacts.length ? (
          contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setActiveContact(contact)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-stone-50"
            >
              <div>
                <p className="text-base font-semibold text-stone-900">
                  {contact.first_name} {contact.last_name}
                </p>
                <p className="text-sm text-stone-500">
                  {contact.job_title || contact.role || 'Contact'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {contact.email && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E6F4] bg-[#F4F6FB] text-blue-600">
                    <Mail size={18} />
                  </div>
                )}
                {contact.phone && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E6F4] bg-[#F4F6FB] text-blue-600">
                    <Phone size={18} />
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="px-5 py-4 text-sm text-stone-400">Aucun contact associe.</div>
        )}
      </div>
      <div className="p-4">
        <button
          type="button"
          onClick={() => openResultsPicker(prospect)}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-yellow-400 bg-blue-700 px-5 py-3 text-white shadow-sm hover:bg-blue-800"
        >
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <FileText size={18} />
            </span>
            <span>Consulter l&apos;analyse</span>
          </div>
          <span className="text-sm font-semibold">Ouvrir →</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Prospection</h1>
            <p className="text-sm text-stone-500">
              {prospects.length} prospect{prospects.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600"
            >
              <ArrowLeftRight size={14} />
              {viewMode === 'cards' ? 'Vue liste' : 'Vue cartes'}
            </button>
            <button
              type="button"
              onClick={loadProspects}
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-2 text-xs text-white"
            >
              <Sparkles size={14} />
              Rafraichir
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un prospect"
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={sectorFilter}
              onChange={(event) => {
                setSectorFilter(event.target.value);
                setSegmentFilter('');
              }}
              className="min-w-[160px] appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-8 text-sm"
            >
              <option value="">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={segmentFilter}
              onChange={(event) => setSegmentFilter(event.target.value)}
              className="min-w-[160px] appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-8 text-sm"
            >
              <option value="">Tous les segments</option>
              {segmentOptions.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
        <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 snap-y snap-mandatory">
          {isLoading ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-400">
              Chargement des prospects...
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {prospects.map((prospect) => {
                const isSelected = selectedProspect?.id === prospect.id;
                const isFlipped = flippedProspectId === prospect.id;
                const isEditingIdentity = editingIdentityId === prospect.id;
                return (
                  <div
                    key={prospect.id}
                    className="relative flex w-full flex-col snap-start xl:max-w-[360px] xl:mx-auto"
                  >
                    <div
                      onClick={() => handleSelectProspect(prospect)}
                      data-prospect-id={prospect.id}
                      className="relative cursor-pointer rounded-lg overflow-visible"
                    >
                        <div
                          className={cn(
                          'relative h-full transition-[min-height] duration-300 [transform-style:preserve-3d] overflow-visible',
                          isFlipped
                            ? isEditingIdentity
                              ? 'min-h-[280px] sm:min-h-[260px]'
                              : 'min-h-[210px] sm:min-h-[220px]'
                            : 'min-h-[170px] sm:min-h-[180px]'
                          )}
                          style={{ perspective: '1400px' }}
                        >
                          <div
                          className="relative h-full w-full transition-transform duration-700 overflow-visible will-change-transform"
                          style={{
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transformOrigin: 'center',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          <div
                            className={cn(
                              'absolute inset-0 rounded-lg border border-stone-200 bg-white px-3 pt-2.5 pb-2 transition-all duration-200 overflow-visible',
                              isSelected ? 'border-stone-300' : 'border-stone-200'
                            )}
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(0deg) translateZ(1px)',
                            }}
                          >
                            <div className="flex h-full flex-col gap-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                      {isEditingIdentity ? (
                                        <div className="space-y-2">
                                          <input
                                            value={identityDraft}
                                            onChange={(event) => setIdentityDraft(event.target.value)}
                                            className="w-full rounded-md border border-stone-200 px-2 py-1 text-sm"
                                          />
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              saveIdentity(prospect.id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md bg-stone-900 px-2 py-1 text-xs text-white"
                                          >
                                            <Check size={12} />
                                            Sauver
                                          </button>
                                      </div>
                                    ) : (
                                      <p className="line-clamp-2 text-[17px] font-semibold text-stone-900">
                                        {prospect.company_name}
                                      </p>
                                    )}
                                    <div className="mt-2 h-px w-2/3 bg-stone-200" />
                                    {prospect.segment && (
                                      <span className="mt-4 inline-flex rounded-md bg-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                                        {prospect.segment}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex h-10 w-16 items-center justify-end">
                                    {prospect.logo_url ? (
                                      <img
                                        src={prospect.logo_url}
                                        alt={prospect.company_name}
                                        className="max-h-10 max-w-[64px] object-contain"
                                      />
                                    ) : (
                                      <div className="text-xs text-stone-300">Logo</div>
                                    )}
                                  </div>
                                  </div>

                                <div className="flex flex-1 items-center gap-4 text-[13px] text-stone-600">
                                  <div className="flex items-center gap-2">
                                    <Users size={16} className="text-blue-600" />
                                    <span>{contactCounts[prospect.id]?.total ?? 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-blue-600" />
                                    <span>{contactCounts[prospect.id]?.email ?? 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-blue-600" />
                                    <span>{contactCounts[prospect.id]?.phone ?? 0}</span>
                                  </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleFlip(prospect.id);
                                      }}
                                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-500/70 text-white"
                                    >
                                      <Info size={14} />
                                    </button>
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openResultsPicker(prospect);
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-500/70 text-white"
                                      >
                                        <Star size={14} />
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        const count = getPhaseCount(prospect);
                                        if (!count) return;
                                        const status = getPhaseStatus(prospect, count);
                                        if (status === 'missing') return;
                                        openAnalysisForPhase(prospect, count);
                                      }}
                                      className="relative flex h-7 min-w-[32px] items-center justify-center rounded-lg border border-blue-200 bg-white px-2 text-[11px] font-semibold text-blue-700/70"
                                    >
                                      ({getPhaseCount(prospect)})
                                      {hasRunningPhase(prospect) && (
                                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                                      )}
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setAnalysisPhasePickerProspect(prospect);
                                    }}
                                    className="rounded-lg border border-blue-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700/70"
                                  >
                                    Analyse
                                  </button>
                                </div>
                              </div>

                              <div
                                className="absolute inset-0 h-full text-left px-3 pt-2.5 pb-2 rounded-lg border border-stone-200 transition-all duration-200 overflow-visible bg-white flex flex-col"
                                style={{
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg) translateZ(1px)',
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white">
                                      {prospect.logo_url ? (
                                        <img
                                          src={prospect.logo_url}
                                          alt={prospect.company_name}
                                          className="max-h-8 max-w-[32px] object-contain"
                                        />
                                      ) : (
                                        <div className="text-[10px] text-stone-300">Logo</div>
                                      )}
                                    </div>
                                    <p className="text-base font-semibold text-stone-900">
                                      {prospect.company_name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        startEditingIdentity(prospect);
                                      }}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleFlip(prospect.id);
                                      }}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-2 h-px bg-stone-200" />
                                <div className="mt-2 grid grid-cols-2 gap-2.5 text-[13px] text-stone-700">
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                                      Secteur
                                    </p>
                                    <p className="mt-1 text-base text-stone-900">
                                      {prospect.sector || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                                      Metier
                                    </p>
                                    <p className="mt-1 text-base text-stone-900">
                                      {prospect.business_lines || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                                      Chiffre d&apos;affaires
                                    </p>
                                    <p className="mt-1 text-base text-stone-900">
                                      {prospect.revenue || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                                      Employes
                                    </p>
                                    <p className="mt-1 text-base text-stone-900">
                                      {formatNumeric(prospect.employee_count)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                                      Siege social
                                    </p>
                                    <p className="mt-1 text-base text-stone-900">
                                      {prospect.headquarters_address || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                                      Potentiel
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                          <span
                                            key={idx}
                                            className={cn(
                                              'h-2.5 w-7 rounded-full',
                                              idx < (prospect.potential_score ?? 0)
                                                ? 'bg-blue-600'
                                                : 'bg-stone-200'
                                            )}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-semibold text-stone-600">
                                        {prospect.potential_score ?? 0}/5
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                                    Site internet
                                  </p>
                                  <p className="mt-1 text-sm text-blue-600">
                                    {prospect.site_web || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                    {isSelected && <div className="mt-3">{renderContactsPanel(prospect)}</div>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2">
              {prospects.map((prospect) => {
                const isSelected = selectedProspect?.id === prospect.id;
                return (
                  <div
                    key={prospect.id}
                    onClick={() => handleSelectProspect(prospect)}
                    className={cn(
                      'rounded-lg border border-stone-200 bg-white p-3 transition-all',
                      isSelected ? 'border-stone-300' : 'border-stone-200'
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[180px]">
                        <p className="text-sm font-semibold text-stone-900">{prospect.company_name}</p>
                        {prospect.segment && (
                          <span className="mt-2 inline-flex rounded-md bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            {prospect.segment}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-600">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-blue-600" />
                          <span>{contactCounts[prospect.id]?.total ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-blue-600" />
                          <span>{contactCounts[prospect.id]?.email ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-blue-600" />
                          <span>{contactCounts[prospect.id]?.phone ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFlip(prospect.id);
                          }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-500/70 text-white"
                      >
                        <Info size={14} />
                      </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setAnalysisPhasePickerProspect(prospect);
                          }}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700/70"
                        >
                          Analyse
                        </button>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-3">{renderContactsPanel(prospect)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative h-[calc(100vh-200px)] min-h-0">
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-stone-200 bg-white flex flex-col">
            {renderAnalysisPanel()}
          </div>
        </div>
      </div>

      <ContactDetailPopup
        open={!!activeContact}
        contact={activeContact}
        onClose={() => setActiveContact(null)}
        onSave={handleSaveContact}
      />

      {(analysisModalProspect || analysisPhasePayload || analysisResultsStack) && (
        <div
          className="md:hidden fixed inset-0 z-[100] flex flex-col bg-black/50 backdrop-blur-sm pt-[calc(var(--app-header-height,72px)+16px)] pb-6 px-4"
          onClick={() => {
            clearAnalysisSelection();
          }}
        >
          <div
            className="flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-white flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            {renderAnalysisPanel()}
          </div>
        </div>
      )}

      {analysisPhasePickerProspect && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 pt-[calc(var(--app-header-height,72px)+16px)]"
          onClick={() => setAnalysisPhasePickerProspect(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border bg-white shadow-2xl"
            style={{ borderColor: palette.primaryBorder }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Lancez une analyse
                </p>
                <p className="text-sm font-semibold text-stone-900">
                  {analysisPhasePickerProspect.company_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisPhasePickerProspect(null)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
              >
                Fermer
              </button>
            </div>
            <div className="p-5 grid gap-3">
              {[1, 2, 3, 4, 5].map((phase) => {
                const canLaunch = phase === 1 || phase === 3;
                return (
                  <button
                    key={phase}
                    type="button"
                    disabled={!canLaunch}
                    onClick={async () => {
                      if (!analysisPhasePickerProspect) return;
                      if (phase === 1) await triggerAnalysis(analysisPhasePickerProspect.id);
                      if (phase === 3) await triggerPhase3(analysisPhasePickerProspect.id);
                      setAnalysisPhasePickerProspect(null);
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition',
                      canLaunch
                        ? 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        : 'border-stone-100 bg-stone-50 text-stone-400'
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                        Phase {phase}
                      </p>
                      <p className={cn('text-sm font-semibold', canLaunch ? 'text-stone-900' : 'text-stone-400')}>
                        {phaseLabels[phase]}
                      </p>
                    </div>
                    {canLaunch ? (
                      <ArrowUpRight size={16} className="text-blue-600" />
                    ) : (
                      <Clock size={16} className="text-stone-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {analysisResultsPickerProspect && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 pt-[calc(var(--app-header-height,72px)+16px)]"
          onClick={() => {
            setAnalysisResultsPickerProspect(null);
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border bg-white shadow-2xl"
            style={{ borderColor: palette.primaryBorder }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Consulter les resultats
                </p>
                <p className="text-sm font-semibold text-stone-900">
                  {analysisResultsPickerProspect.company_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnalysisResultsPickerProspect(null);
                }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
              >
                Fermer
              </button>
            </div>
            <div className="p-5 grid gap-3">
              {[1, 2, 3, 4, 5].map((phase) => {
                const status = getPhaseStatus(analysisResultsPickerProspect, phase);
                const isAvailable = status !== 'missing';
                return (
                  <button
                    key={phase}
                    type="button"
                    disabled={!isAvailable}
                    onClick={async () => {
                      if (!analysisResultsPickerProspect || !isAvailable) return;
                      await openAnalysisForPhase(analysisResultsPickerProspect, phase);
                      setAnalysisResultsPickerProspect(null);
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition',
                      isAvailable
                        ? 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        : 'border-stone-100 bg-stone-50 text-stone-400'
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                        Phase {phase}
                      </p>
                      <p className={cn('text-sm font-semibold', isAvailable ? 'text-stone-900' : 'text-stone-400')}>
                        {phaseLabels[phase]}
                      </p>
                    </div>
                    {isAvailable ? (
                      <ArrowUpRight size={16} className="text-blue-600" />
                    ) : (
                      <Clock size={16} className="text-stone-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
