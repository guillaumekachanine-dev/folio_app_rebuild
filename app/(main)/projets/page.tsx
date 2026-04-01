'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Grid3x3, List, Sparkles, Search } from 'lucide-react';
import ProjectCreateModal from '@/components/projets/ProjectCreateModal';
import ProjectCard from '@/components/projets/ProjectCard';

type DisplayMode = 'cards' | 'list' | 'wild';

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projets/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
        setIsModalOpen(false);
        setEditingProject(null);
      } else {
        alert('Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erreur lors de la suppression du projet');
    }
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

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Controls: Search + New Button + Display Mode Toggle */}
        <div className="flex items-center gap-4" style={{ marginBottom: '40px' }}>
          {/* Search Bar */}
          <div className="flex-1 max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-gray-200">
            <Search size={18} style={{ color: '#8e8e93' }} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#1c1c1e' }}
            />
          </div>

          {/* New Project Button */}
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#4A9B7F' }}
          >
            <Plus size={20} />
            <span>Nouveau projet</span>
          </button>

          {/* Display Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1 border border-gray-200">
            <button
              onClick={() => setDisplayMode('cards')}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: displayMode === 'cards' ? '#4A9B7F' : 'transparent',
                color: displayMode === 'cards' ? '#ffffff' : '#8e8e93'
              }}
              title="Mode Cartes"
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: displayMode === 'list' ? '#4A9B7F' : 'transparent',
                color: displayMode === 'list' ? '#ffffff' : '#8e8e93'
              }}
              title="Mode Liste"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setDisplayMode('wild')}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: displayMode === 'wild' ? '#4A9B7F' : 'transparent',
                color: displayMode === 'wild' ? '#ffffff' : '#8e8e93'
              }}
              title="Mode Wild"
            >
              <Sparkles size={20} />
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={48} className="animate-spin" style={{ color: '#4A9B7F' }} />
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            {displayMode === 'cards' && (
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gridAutoRows: '320px',
                }}
              >
                {filteredProjects.map((project) => (
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
            )}

            {displayMode === 'list' && (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setEditingProject(null)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: categoryColors[project.type] }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" style={{ color: '#1c1c1e' }}>
                        {project.name}
                      </h3>
                      <p className="text-xs" style={{ color: '#8e8e93' }}>
                        {categoryLabels[project.type]}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <Plus size={18} style={{ color: categoryColors[project.type] }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {displayMode === 'wild' && (
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gridAutoRows: 'auto',
                }}
              >
                {filteredProjects.map((project, idx) => {
                  const spans = [1, 1.5, 1, 1.2, 1.3, 1][idx % 6];
                  return (
                    <div
                      key={project.id}
                      style={{
                        gridColumn: `span ${Math.ceil(spans)}`,
                        minHeight: `${200 + (idx % 3) * 50}px`,
                      }}
                    >
                      <ProjectCard
                        project={{
                          ...project,
                          estimatedHours: project.charge_hours,
                        }}
                        categoryColor={categoryColors[project.type]}
                        categoryLabel={categoryLabels[project.type]}
                        onEdit={handleEditProject}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
            <p className="text-lg font-medium">Aucun projet trouvé</p>
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
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
