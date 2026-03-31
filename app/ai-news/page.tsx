'use client';

import { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: 'business' | 'llm' | 'frontier' | 'youtube';
  source_name: string;
  source_url?: string;
  article_url: string;
  published_at: string;
  selection_date: string;
  rank: number;
  summary?: string;
  featured_image_url?: string;
  ingested_at: string;
}

interface Digest {
  id: string;
  date: string;
  category: string;
  summary?: string;
  key_insights?: string[];
}

const CATEGORY_META = {
  business: {
    label: 'Business',
    color: '#3B82F6',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-500/5',
  },
  llm: {
    label: 'LLM',
    color: '#A855F7',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-500',
    dotColor: 'bg-purple-500',
    hoverBg: 'hover:bg-purple-500/5',
  },
  frontier: {
    label: 'Frontier',
    color: '#F97316',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    dotColor: 'bg-orange-500',
    hoverBg: 'hover:bg-orange-500/5',
  },
  youtube: {
    label: 'YouTube',
    color: '#DC2626',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    dotColor: 'bg-red-500',
    hoverBg: 'hover:bg-red-500/5',
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function AINewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai-news')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setDigests(data.digests || []);
        setLoading(false);
      });
  }, []);

  const articlesByCategory = {
    business: articles.filter((a) => a.category === 'business'),
    llm: articles.filter((a) => a.category === 'llm'),
    frontier: articles.filter((a) => a.category === 'frontier'),
    youtube: articles.filter((a) => a.category === 'youtube'),
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysDigest = digests.find((d) => d.date === today);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading AI News...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-20 pb-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">
                AI News
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl font-light">
                Real-time intelligence on artificial intelligence developments, breakthroughs, and market movements.
              </p>
            </div>
          </div>
        </header>

        {/* Today's Digest */}
        {todaysDigest && (
          <section className="px-6 md:px-12 py-8">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div
                className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br backdrop-blur-sm p-12 md:p-16 transition-all duration-300 hover:border-slate-700"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${CATEGORY_META[todaysDigest.category as keyof typeof CATEGORY_META]?.color}10 0%, transparent 100%)`,
                }}
              >
                {/* Accent dot */}
                <div
                  className="absolute top-8 right-8 w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: CATEGORY_META[todaysDigest.category as keyof typeof CATEGORY_META]?.color }}
                />

                <div className="space-y-8">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-slate-400 mb-3">Today's Digest</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white">
                      {todaysDigest.summary || 'AI News Summary'}
                    </h2>
                  </div>

                  {todaysDigest.key_insights && todaysDigest.key_insights.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {todaysDigest.key_insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div
                            className="w-1 h-full rounded-full"
                            style={{ backgroundColor: CATEGORY_META[todaysDigest.category as keyof typeof CATEGORY_META]?.color }}
                          />
                          <p className="text-slate-300 font-light leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles Section */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-7xl mx-auto">
            {/* Category Navigation */}
            <div className="flex gap-3 mb-16 overflow-x-auto pb-2">
              {(Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>).map((category) => (
                <a
                  key={category}
                  href={`#${category}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all duration-300 whitespace-nowrap text-sm font-medium"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[category].color }}
                  />
                  {CATEGORY_META[category].label}
                </a>
              ))}
            </div>

            {/* Articles by Category */}
            {(Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>).map((category) => (
              <div key={category} id={category} className="mb-24 last:mb-0">
                <h3 className="text-3xl font-black text-white mb-12">{CATEGORY_META[category].label}</h3>

                {articlesByCategory[category].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articlesByCategory[category].map((article, idx) => (
                      <a
                        key={article.id}
                        href={article.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur transition-all duration-300 p-6 flex flex-col h-full hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700"
                        style={{
                          animationDelay: `${idx * 50}ms`,
                        }}
                      >
                        {/* Left border accent */}
                        <div
                          className="absolute left-0 top-0 w-1 h-0 group-hover:h-full transition-all duration-300"
                          style={{ backgroundColor: CATEGORY_META[category].color }}
                        />

                        <div className="relative z-10 flex flex-col h-full">
                          {/* Category badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: CATEGORY_META[category].color }}
                            />
                            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                              {CATEGORY_META[category].label}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-lg font-black text-white mb-3 group-hover:text-slate-100 transition-colors line-clamp-2">
                            {article.title}
                          </h4>

                          {/* Summary */}
                          {article.summary && (
                            <p className="text-sm text-slate-400 mb-6 line-clamp-2 group-hover:text-slate-300 transition-colors flex-grow">
                              {article.summary}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                            <span className="font-medium">{article.source_name}</span>
                            <span className="text-slate-600">{getTimeAgo(article.published_at)} ago</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500 font-light">No articles in this category yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Digest History */}
        <section className="px-6 md:px-12 py-20 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-12">Digest History</h3>

            {digests.length > 0 ? (
              <div className="space-y-4">
                {digests.slice(0, 12).map((digest, idx) => (
                  <div
                    key={digest.id}
                    className="group relative border-l-2 pl-6 py-4 hover:border-slate-500 transition-colors duration-300 cursor-pointer animate-in fade-in slide-in-from-left-4 duration-700"
                    style={{
                      borderLeftColor: CATEGORY_META[digest.category as keyof typeof CATEGORY_META]?.color,
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                          {formatDate(digest.date)}
                        </p>
                        {digest.summary && (
                          <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
                            {digest.summary}
                          </p>
                        )}
                      </div>
                      <span
                        className="ml-4 px-2 py-1 rounded text-xs font-semibold text-white"
                        style={{
                          backgroundColor: `${CATEGORY_META[digest.category as keyof typeof CATEGORY_META]?.color}20`,
                          color: CATEGORY_META[digest.category as keyof typeof CATEGORY_META]?.color,
                        }}
                      >
                        {CATEGORY_META[digest.category as keyof typeof CATEGORY_META]?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-light">No digests available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
