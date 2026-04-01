'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    type: 'perso' | 'pro' | 'formation';
    context?: string;
    objective?: string;
    activities?: string;
    deliverables?: string;
    priority?: number;
    estimatedHours?: number;
    deadline?: string;
    coverImageUrl?: string;
    color?: string;
  };
  categoryColor: string;
  categoryLabel: string;
  onEdit?: (project: any) => void;
}

export default function ProjectCard({
  project,
  categoryColor,
  categoryLabel,
  onEdit,
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Détecte si le clic est dans le quart inférieur gauche (agrandir pour meilleure UX)
    const isBottomLeftQuarter =
      x < rect.width * 0.35 && y > rect.height * 0.65;

    if (isBottomLeftQuarter) {
      setIsFlipped(!isFlipped);
      return;
    }

    if (project.id) {
      router.push(`/projets/${project.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(project);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-full cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          className="absolute w-full h-full rounded-3xl flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: project.coverImageUrl
              ? `url(${project.coverImageUrl})`
              : `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}08 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: `2px solid ${categoryColor}30`,
            padding: '24px 32px',
          }}
        >
          {/* Image overlay */}
          {project.coverImageUrl && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 1,
              }}
            />
          )}

          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="text-2xl font-bold truncate" style={{ color: project.coverImageUrl ? '#ffffff' : '#1c1c1e' }}>
              {project.name || 'Nouveau projet'}
            </h3>
          </div>

          <div className="flex items-end justify-between" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryLabel}
            </div>

            {/* Gradient circle décorateur */}
            <div
              className="w-20 h-20 rounded-full opacity-20 absolute -right-8 -bottom-8"
              style={{ background: `radial-gradient(circle, ${categoryColor}, transparent)` }}
            />
          </div>

        </div>

        {/* BACK */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden p-6"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#ffffff',
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1)`,
          }}
        >
          <div className="h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4 -mr-2">
              <h4 className="text-sm font-semibold" style={{ color: '#1c1c1e' }}>
                Informations générales
              </h4>
              <button
                onClick={handleEditClick}
                className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Modifier le projet"
              >
                <Edit2 size={18} style={{ color: categoryColor }} />
              </button>
            </div>

            <div className="space-y-3 text-xs flex-1">
              {project.context && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Contexte
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.context}
                  </p>
                </div>
              )}

              {project.objective && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Objectifs
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.objective}
                  </p>
                </div>
              )}

              {project.activities && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Activités
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.activities}
                  </p>
                </div>
              )}

              {project.deliverables && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Livrables
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.deliverables}
                  </p>
                </div>
              )}

              {project.priority && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Priorité
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.priority}/5
                  </p>
                </div>
              )}

              {project.estimatedHours && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Charge estimée
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {project.estimatedHours}h
                  </p>
                </div>
              )}

              {project.deadline && (
                <div>
                  <p style={{ color: '#8e8e93' }} className="font-medium text-xs">
                    Deadline
                  </p>
                  <p style={{ color: '#1c1c1e' }} className="text-xs">
                    {new Date(project.deadline).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
