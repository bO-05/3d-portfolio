/**
 * Portfolio projects data
 * Each project is mapped to a building in the 3D scene
 * @module utils/projectsData
 */

export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    tech: string[];
    links: {
        github?: string;
        demo?: string;
        devPost?: string;
    };
    buildingId: string;
    thumbnail?: string;
    award?: string;
    featured?: boolean;
}

export const projects: Project[] = [
    {
        id: 'assistant0',
        title: 'Assistant Zero',
        description: 'Secure AI personal assistant with Auth0',
        longDescription: 'A production-ready AI assistant that uses Auth0 for authentication and OpenAI for intelligent conversations. Features include secure multi-user sessions, conversation history, and custom AI personalities.',
        tech: ['React', 'Auth0', 'OpenAI', 'Vercel'],
        links: {
            github: 'https://github.com/example/assistantzero',
            demo: 'https://assistant0.vercel.app',
            devPost: 'https://dev.to/example/assistant-zero',
        },
        buildingId: 'internet-cafe',
        award: '🏆 Won Auth0 for AI Agents Challenge',
        featured: true,
    },
    {
        id: 'portfolio3d',
        title: 'Jakarta Street Portfolio',
        description: 'Interactive 3D portfolio with driving mechanics',
        longDescription: 'This very portfolio! A Bruno Simon-inspired 3D experience where visitors drive a Bajaj through Jakarta streets to explore projects. Built with React Three Fiber, Cannon.js physics, and Gemini AI chat.',
        tech: ['React', 'Three.js', 'R3F', 'Cannon.js', 'Zustand'],
        links: {
            github: 'https://github.com/example/jakarta-portfolio',
            demo: 'https://jakarta-portfolio.vercel.app',
        },
        buildingId: 'house',
        featured: true,
    },
    {
        id: 'library-project',
        title: 'Digital Library',
        description: 'Full-stack book management system',
        longDescription: 'A comprehensive library management system with book cataloging, user management, borrowing system, and recommendation engine powered by machine learning.',
        tech: ['Next.js', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
        links: {
            github: 'https://github.com/example/digital-library',
            demo: 'https://digital-library.vercel.app',
        },
        buildingId: 'library',
    },
    {
        id: 'music-studio',
        title: 'Beat Maker Studio',
        description: 'Browser-based music production tool',
        longDescription: 'A web-based DAW (Digital Audio Workstation) that lets users create beats and music directly in the browser using Web Audio API. Features drum machine, synthesizer, and pattern sequencer.',
        tech: ['TypeScript', 'Web Audio API', 'React', 'Tone.js'],
        links: {
            github: 'https://github.com/example/beat-maker',
            demo: 'https://beat-maker.vercel.app',
        },
        buildingId: 'music-studio',
    },
    {
        id: 'warung-chat',
        title: 'Warung Chat Bot',
        description: 'AI-powered conversation assistant',
        longDescription: 'Chat with an AI assistant that knows about Indonesian culture, food, and local recommendations. Powered by Google Gemini for natural conversations.',
        tech: ['Gemini AI', 'Express', 'React', 'Node.js'],
        links: {
            github: 'https://github.com/example/warung-chat',
        },
        buildingId: 'warung',
    },
];

/**
 * Get projects for a specific building
 */
export function getProjectsForBuilding(buildingId: string): Project[] {
    return projects.filter((project) => project.buildingId === buildingId);
}

/**
 * Get a single project by ID
 */
export function getProjectById(projectId: string): Project | undefined {
    return projects.find((project) => project.id === projectId);
}
