'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink,
  Zap,
  TrendingUp,
  Cpu,
  Play,
  Layers,
  Newspaper,
  Brain,
  CalendarDays,
  Shuffle,
} from 'lucide-react';

/* ─────────────────────────────────── types ─────────────────────────────────── */

interface Article {
  id: string;
  title: string;
  category: 'business' | 'llm' | 'frontier' | 'youtube';
  source_name: string;
  article_url: string;
  published_at: string;
  summary?: string;
  featured_image_url?: string;
}

interface Digest {
  id: string;
  date: string;
  category: string;
  summary?: string;
  key_insights?: string[];
}

type Category = 'all' | 'business' | 'llm' | 'frontier' | 'youtube';

/* ──────────────────────────────── constants ─────────────────────────────────── */

const CATEGORY_META: Record<Category, { label: string; color: string; lightBg: string; icon: React.ReactNode }> = {
  all:      { label: 'Tout',     color: '#5c6bc0', lightBg: '#eef0fb', icon: <Layers size={18} /> },
  business: { label: 'Business', color: '#1e88e5', lightBg: '#e3f2fd', icon: <TrendingUp size={18} /> },
  llm:      { label: 'LLM',      color: '#8e24aa', lightBg: '#f3e5f5', icon: <Cpu size={18} /> },
  frontier: { label: 'Frontier', color: '#f4511e', lightBg: '#fbe9e7', icon: <Zap size={18} /> },
  youtube:  { label: 'YouTube',  color: '#e53935', lightBg: '#ffebee', icon: <Play size={18} /> },
};

// 2×3 grid order: main 4 categories + "Tout" + "Au hasard" at the bottom
const CAT_GRID: Array<Category | 'random'> = [
  'business', 'llm',
  'frontier', 'youtube',
  'all',      'random',
];

/* ──────────────────────────────── helpers ───────────────────────────────────── */

function timeAgo(dateString: string) {
  const s = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (s < 3600)  return `il y a ${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

function todayFR() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ──────────────────────────────── sub-components ────────────────────────────── */

/**
 * Header band (iCloud-style) for white cards.
 * headerBg overrides the band background — use for special tints (gold, etc.).
 */
function CardHeader({
  icon,
  title,
  subtitle,
  accent,
  headerBg,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: string;
  headerBg?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: headerBg ?? 'rgba(210, 228, 252, 0.42)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: accent ?? '#1e88e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="font-sans"
          style={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e', lineHeight: 1.2, margin: 0 }}
        >
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 11, color: '#999', margin: 0, marginTop: 1 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** A white card */
function WhiteCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 2px 16px rgba(70,100,160,0.10)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A transparent/frosted card */
function FrostedCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.38)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.72)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Article card content (inside a WhiteCard) */
function ArticleContent({ article }: { article: Article | undefined }) {
  const meta = article ? CATEGORY_META[article.category] : null;

  if (!article) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#bbb', fontSize: 13 }}>Aucun article disponible</p>
      </div>
    );
  }

  return (
    <a
      href={article.article_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 18px', gap: 10, textDecoration: 'none', color: 'inherit' }}
    >
      {/* Category pill */}
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 10px', borderRadius: 99,
          background: meta?.lightBg, color: meta?.color,
          alignSelf: 'flex-start',
        }}
      >
        {meta?.icon}
        {meta?.label}
      </span>

      {/* Title */}
      <p
        className="font-sans"
        style={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e', lineHeight: 1.4, margin: 0, flex: 1 }}
      >
        {article.title}
      </p>

      {/* Summary */}
      {article.summary && (
        <p style={{ fontSize: 12, color: '#777', lineHeight: 1.5, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.summary}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{article.source_name}</span>
        <span style={{ fontSize: 11, color: '#bbb' }}>{timeAgo(article.published_at)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ExternalLink size={13} style={{ color: '#ccc' }} />
      </div>
    </a>
  );
}

/* ─────────────────────────────────── page ───────────────────────────────────── */

export default function AINewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Category>('all');

  useEffect(() => {
    fetch('/api/ai-news?category=all')
      .then((r) => r.json())
      .then((d) => {
        setArticles(d.articles ?? []);
        setDigests(d.digests ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selected === 'all' ? articles : articles.filter((a) => a.category === selected);

  const today = new Date().toISOString().split('T')[0];
  const digest = digests.find((d) => d.date === today) || digests[0] || null;
  const digestMeta = digest ? (CATEGORY_META[digest.category as Category] ?? CATEGORY_META.llm) : CATEGORY_META.llm;

  const [a1, a2, a3] = filtered;
  const extra = filtered.slice(3);

  /** Open a random article from the full history */
  function openRandom() {
    if (articles.length === 0) return;
    const pick = articles[Math.floor(Math.random() * articles.length)];
    window.open(pick.article_url, '_blank');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid #1e88e5', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span className="font-sans" style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>
            Chargement des actualités…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #ddeaf8 0%, #ccddf4 35%, #b8ceee 70%, #c5d8f2 100%)',
        padding: '28px 32px 48px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Bento Grid ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: 'repeat(3, 280px)',
            gap: 16,
          }}
        >

          {/* ── [Row 1, Col 1] Image + titre — FROSTED ─────────────────── */}
          <FrostedCard>
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130,
              borderRadius: '50%', background: 'rgba(100,140,220,0.25)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100,
              borderRadius: '50%', background: 'rgba(140,180,240,0.20)', filter: 'blur(24px)', pointerEvents: 'none' }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: '24px 22px', position: 'relative', zIndex: 1 }}>
              <div>
                <p className="font-sans"
                  style={{ fontSize: 32, fontWeight: 900, color: '#1a2d5a', margin: 0, lineHeight: 1.1 }}>
                  AI News
                </p>
                <p style={{ fontSize: 12, color: '#5a7aaa', margin: '6px 0 0', fontWeight: 500 }}>
                  Intelligence artificielle
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CalendarDays size={14} style={{ color: '#7090c0' }} />
                <span style={{ fontSize: 12, color: '#6080b0', fontWeight: 600 }}>{todayFR()}</span>
              </div>
            </div>
          </FrostedCard>

          {/* ── [Row 1, Col 2] Article 1 — WHITE ──────────────────────── */}
          <WhiteCard>
            <CardHeader
              icon={<Newspaper size={18} />}
              title="Source #1"
              subtitle={a1 ? `${a1.source_name} · ${timeAgo(a1.published_at)}` : 'Aucun article'}
              accent="#1e88e5"
            />
            <ArticleContent article={a1} />
          </WhiteCard>

          {/* ── [Row 2, Col 1] Article 2 — WHITE ──────────────────────── */}
          <WhiteCard>
            <CardHeader
              icon={<Newspaper size={18} />}
              title="Source #2"
              subtitle={a2 ? `${a2.source_name} · ${timeAgo(a2.published_at)}` : 'Aucun article'}
              accent="#43a047"
            />
            <ArticleContent article={a2} />
          </WhiteCard>

          {/* ── [Row 2, Col 2] Synthèse — WHITE — teinte or ────────────── */}
          <WhiteCard>
            <CardHeader
              icon={<Brain size={18} />}
              title="Synthèse & Analyse"
              subtitle={digest
                ? new Date(digest.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                : "Aujourd'hui"}
              accent="#b8860b"
              headerBg="rgba(255, 223, 120, 0.30)"
            />

            {digest ? (
              <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p className="font-sans"
                  style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e', margin: 0, lineHeight: 1.4 }}>
                  {digest.summary}
                </p>
                {digest.key_insights && digest.key_insights.length > 0 && (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {digest.key_insights.slice(0, 4).map((insight, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                          background: '#b8860b' }} />
                        <p style={{ margin: 0, fontSize: 12, color: '#555', lineHeight: 1.5 }}>{insight}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#bbb', fontSize: 13 }}>Aucune synthèse disponible</p>
              </div>
            )}
          </WhiteCard>

          {/* ── [Row 3, Col 1] Catégories — FROSTED, no text header ─────── */}
          <FrostedCard>
            <div
              style={{
                flex: 1,
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                gap: 8,
              }}
            >
              {CAT_GRID.map((cat) => {
                if (cat === 'random') {
                  // "Au hasard" special button
                  return (
                    <button
                      key="random"
                      onClick={openRandom}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        borderRadius: 14,
                        border: '2px solid rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.55)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.80)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c4dff';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.55)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.6)';
                      }}
                    >
                      <Shuffle size={20} style={{ color: '#7c4dff' }} />
                      <span className="font-sans"
                        style={{ fontSize: 11, fontWeight: 700, color: '#7c4dff' }}>
                        Au hasard
                      </span>
                    </button>
                  );
                }

                const m = CATEGORY_META[cat as Category];
                const isActive = selected === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelected(cat as Category)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      borderRadius: 14,
                      border: isActive ? `2px solid ${m.color}` : '2px solid rgba(255,255,255,0.6)',
                      background: isActive ? m.lightBg : 'rgba(255,255,255,0.55)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? `0 2px 12px ${m.color}28` : 'none',
                    }}
                  >
                    <span style={{ color: m.color }}>{m.icon}</span>
                    <span className="font-sans"
                      style={{ fontSize: 11, fontWeight: 700, color: isActive ? m.color : '#5a7aaa' }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </FrostedCard>

          {/* ── [Row 3, Col 2] Article 3 — WHITE ──────────────────────── */}
          <WhiteCard>
            <CardHeader
              icon={<Newspaper size={18} />}
              title="Source #3"
              subtitle={a3 ? `${a3.source_name} · ${timeAgo(a3.published_at)}` : 'Aucun article'}
              accent="#fb8c00"
            />
            <ArticleContent article={a3} />
          </WhiteCard>

        </div>

        {/* ── Articles supplémentaires ──────────────────────────────────── */}
        {extra.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p className="font-sans"
              style={{ fontWeight: 800, fontSize: 16, color: '#1a2d5a', marginBottom: 14 }}>
              Plus d'articles
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {extra.map((article) => (
                <WhiteCard key={article.id} style={{ height: 200 }}>
                  <ArticleContent article={article} />
                </WhiteCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
