'use client';

import Link from 'next/link';

const cardConfigs = [
  { title: 'Prospection', href: '/prospection', description: 'Identify and engage high-potential opportunities', gradient: { start: '#0052CC', end: '#0080FF' }, shadow: 'rgba(0, 82, 204, 0.3)' },
  { title: 'Formations', href: '/planning', description: 'Develop skills and expertise continuously', gradient: { start: '#4A9B7F', end: '#5FB59F' }, shadow: 'rgba(74, 155, 127, 0.3)' },
  { title: 'Projets', href: '/projets', description: 'Deliver projects with excellence and innovation', gradient: { start: '#E8704A', end: '#F08A5D' }, shadow: 'rgba(232, 112, 74, 0.3)' },
  { title: 'Planning', href: '/planning', description: 'Organize and optimize your timeline', gradient: { start: '#D84C4C', end: '#E8696C' }, shadow: 'rgba(216, 76, 76, 0.3)' },
  { title: 'Budget', href: '/budget', description: 'Manage resources and maximize ROI', gradient: { start: '#D4A81B', end: '#FFD60A' }, shadow: 'rgba(212, 168, 27, 0.3)' },
  { title: 'AI News', href: '/ai-news', description: 'Stay informed on artificial intelligence', gradient: { start: '#2F3B7D', end: '#4A55A8' }, shadow: 'rgba(47, 59, 125, 0.3)' },
];

function renderCard(config: typeof cardConfigs[0], gridColumn: string, gridRow: string) {
  const rgbShadow = config.shadow;
  const rgbFromGradient = config.shadow.match(/\d+/g)?.slice(0, 3).join(', ') || '0, 82, 204';

  return (
    <Link
      key={config.title}
      href={config.href}
      className="rounded-3xl flex flex-col justify-between text-white overflow-hidden relative group"
      style={{
        padding: '24px 40px 40px 40px',
        background: `linear-gradient(135deg, ${config.gradient.start} 0%, ${config.gradient.end} 100%)`,
        gridColumn,
        gridRow,
        boxShadow: `0 20px 40px ${rgbShadow}, 0 0 1px rgba(255, 255, 255, 0.2) inset`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 30px 60px ${config.shadow.replace('0.3', '0.4')}, 0 0 1px rgba(255, 255, 255, 0.3) inset`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 40px ${rgbShadow}, 0 0 1px rgba(255, 255, 255, 0.2) inset`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <h2 className="text-3xl font-bold tracking-tight">
        {config.title}
      </h2>
      <div
        className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'rgba(255, 255, 255, 0.3)' }}
      />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FAFAFA' }}>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: '280px',
          maxWidth: '1400px',
          margin: '0 auto',
          gridTemplateRows: 'repeat(2, 280px)',
        }}
      >
        {renderCard(cardConfigs[0], '1 / 2', '1 / 2')}
        {renderCard(cardConfigs[1], '2 / 3', '1 / 2')}
        {renderCard(cardConfigs[2], '3 / 5', '1 / 2')}
        {renderCard(cardConfigs[3], '1 / 3', '2 / 3')}
        {renderCard(cardConfigs[4], '3 / 4', '2 / 3')}
        {renderCard(cardConfigs[5], '4 / 5', '2 / 3')}
      </div>
    </div>
  );
}
