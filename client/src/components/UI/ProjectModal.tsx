/**
 * Project Modal UI component
 * Shows portfolio projects when a building is clicked
 * @module components/UI/ProjectModal
 */

import { memo, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getProjectsForBuilding, type Project } from '../../utils/projectsData';
import './ProjectModal.css';

/**
 * Project card component
 */
const ProjectCard = memo(function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="project-card">
            {project.award && <div className="project-award">{project.award}</div>}
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-tech">
                {project.tech.map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                ))}
            </div>
            <p className="project-long-description">{project.longDescription}</p>
            <div className="project-links">
                {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="project-link">
                        GitHub
                    </a>
                )}
                {project.links.demo && (
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="project-link project-link-primary">
                        Live Demo
                    </a>
                )}
                {project.links.devPost && (
                    <a href={project.links.devPost} target="_blank" rel="noopener noreferrer" className="project-link">
                        Dev.to Article
                    </a>
                )}
            </div>
        </div>
    );
});

/**
 * Building name mapping
 */
const BUILDING_NAMES: Record<string, string> = {
    'internet-cafe': '🖥️ Internet Cafe',
    'house': '🏠 My Home',
    'library': '📚 Library',
    'music-studio': '🎵 Music Studio',
    'warung': '🍜 Warung',
};

/**
 * Project Modal - shows when a building is clicked
 */
export const ProjectModal = memo(function ProjectModal() {
    const insideBuilding = useGameStore((state) => state.player.insideBuilding);
    const showModal = useGameStore((state) => state.ui.showModal);
    const exitBuilding = useGameStore((state) => state.exitBuilding);

    const handleClose = useCallback(() => {
        exitBuilding();
        document.body.style.cursor = 'auto';
    }, [exitBuilding]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    // Don't render if no building selected or modal shouldn't show
    if (!insideBuilding || !showModal) return null;

    const projects = getProjectsForBuilding(insideBuilding);
    const buildingName = BUILDING_NAMES[insideBuilding] || insideBuilding;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">{buildingName}</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>
                <div className="modal-content">
                    {projects.length > 0 ? (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-projects">
                            <p>No projects here yet. Keep exploring!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ProjectModal;
