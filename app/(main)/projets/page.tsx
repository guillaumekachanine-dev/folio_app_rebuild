'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import ProjectCreateModal from '@/components/projets/ProjectCreateModal';
import ProjectCard from '@/components/projets/ProjectCard';

interface ProjectCardData {
  id: string;
  name: string;
  type: 'perso' | 'pro' | 'formation';
  context?: string;
  objective?: string;
  activities?: string;
  deliverables?: string;
  priority?: number;
  charge_hours?: number;
  deadline?: string;
  coverImageUrl?: string;
  color?: string;
  kpis?: any[];
}

export default function ProjetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectCardData | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load projects from Supabase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projets');
        if (response.ok) {
          const data = await response.json();
          setProjects(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              context: p.context,
              objective: p.objective,
              activities: p.activities,
              deliverables: p.deliverables,
              priority: p.priority,
              charge_hours: p.charge_hours,
              deadline: p.deadline,
              color: p.color,
              kpis: p.kpis || [],
              coverImageUrl: p.cover_image_url,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (projectData: ProjectCardData) => {
    setIsSaving(true);
    try {
      const method = editingProject ? 'PUT' : 'POST';
      const url = editingProject
        ? `/api/projets/${editingProject.id}`
        : '/api/projets';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const savedProject = await response.json();
        if (editingProject) {
          // Update existing project
          setProjects(
            projects.map((p) =>
              p.id === editingProject.id
                ? {
                    ...savedProject,
                    estimatedHours: savedProject.charge_hours,
                  }
                : p
            )
          );
          setEditingProject(null);
        } else {
          // Add new project
          setProjects([
            ...projects,
            {
              ...savedProject,
              estimatedHours: savedProject.charge_hours,
            },
          ]);
        }
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde du projet');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProject = (project: ProjectCardData) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const categoryColors = {
    perso: '#FF6B35',
    pro: '#4f6ef7',
    formation: '#4A9B7F',
  };

  const categoryLabels = {
    perso: 'Personnel',
    pro: 'Professionnel',
    formation: 'Formation',
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header avec bouton */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#1c1c1e' }}>
            Projets
          </h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#4f6ef7' }}
          >
            <Plus size={20} />
            <span>Nouveau projet</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={48} className="animate-spin" style={{ color: '#4f6ef7' }} />
          </div>
        ) : projects.length > 0 ? (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gridAutoRows: '320px',
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  estimatedHours: project.charge_hours,
                }}
                categoryColor={categoryColors[project.type]}
                categoryLabel={categoryLabels[project.type]}
                onEdit={handleEditProject}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed"
            style={{
              borderColor: 'rgba(0, 0, 0, 0.1)',
              height: '400px',
              color: '#8e8e93',
            }}
          >
            <Plus size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun projet créé</p>
            <p className="text-sm mt-2 opacity-75">
              Commencez par cliquer sur "Nouveau projet"
            </p>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateProject={handleCreateProject}
        editingProject={editingProject}
      />
    </div>
  );
}
