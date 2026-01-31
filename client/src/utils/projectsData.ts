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
    /** Mark as prototype if not fully functional */
    prototype?: boolean;
}

export const projects: Project[] = [
    // ═══════════════════════════════════════════════════════════════
    // INTERNET CAFE - Production AI & Hackathon Winners (6 projects)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'assistant0',
        title: 'Assistant Zero',
        description: 'Secure AI personal assistant with Auth0',
        longDescription: 'A smart AI assistant that helps you manage your digital life with enterprise-grade security powered by Auth0. Features semantic search with pgvector, fine-grained authorization, and Step-up Auth.',
        tech: ['Next.js 15', 'React 19', 'Auth0 AI SDK', 'Mistral AI', 'PostgreSQL', 'Drizzle ORM', 'pgvector', 'Vercel'],
        links: {
            github: 'https://github.com/bO-05/assistantzero',
            demo: 'https://assistant0agent.vercel.app/',
            devPost: 'https://dev.to/asynchronope/assistant0-secure-ai-personal-assistant-l11',
        },
        buildingId: 'internet-cafe',
        award: '🏆 Won Auth0 for AI Agents Challenge',
        featured: true,
    },
    {
        id: 'epb',
        title: 'EPB: Email to Code',
        description: 'AI-powered code generation via email',
        longDescription: 'AI-powered code generation service that lets developers create code through email. Send your requirements via email and receive pull requests with working code. Powered by Mistral AI and GitHub Workflow automation.',
        tech: ['GitHub Workflow', 'Mistral AI', 'Postmark', 'Node.js'],
        links: {
            github: 'https://github.com/bO-05/epb',
            devPost: 'https://dev.to/asynchronope/epb-turn-emails-into-code-ai-powered-pull-requests-from-your-inbox-33pg',
        },
        buildingId: 'internet-cafe',
        award: '🏆 Won Postmark Challenge: Inbox Innovators',
        featured: true,
    },
    {
        id: 'wasp-clone',
        title: 'Wasp Clone OS',
        description: 'Interactive desktop OS playground for Wasp',
        longDescription: 'Interactive desktop OS playground where you can explore Wasp like you\'re using an actual operating system. Features file management, working terminal, notes app, games, and AI-powered chat assistant.',
        tech: ['Next.js 15', 'React 19', 'Turso', 'Drizzle ORM', 'Three.js', 'GSAP', 'Framer Motion', 'Better Auth'],
        links: {
            github: 'https://github.com/bO-05/wasp-clone-1',
            demo: 'https://wasp-clone-1.vercel.app/',
        },
        buildingId: 'internet-cafe',
        award: '🏆 Won Wasp Design-AI-thon',
        featured: true,
    },
    {
        id: 'ai-blog-studio',
        title: 'AI Blog Studio',
        description: 'Multimedia content generation with Storyblok',
        longDescription: 'Multimedia content generation platform combining AI technologies with Storyblok CMS. Generate blog posts with Mistral, images with Imagen4 via FAL AI, and audio with ElevenLabs TTS.',
        tech: ['React 18', 'TypeScript', 'Vite', 'Storyblok', 'Mistral AI', 'Imagen4', 'ElevenLabs', 'Netlify'],
        links: {
            demo: 'https://aiblogstudio.chronolove.app/',
            devPost: 'https://dev.to/asynchronope/ai-blog-studio-multimedia-content-generation-with-ai-storyblok-44j',
        },
        buildingId: 'internet-cafe',
    },
    {
        id: 'devbridge',
        title: 'DevBridge',
        description: 'AI-powered cross-project knowledge terminal',
        longDescription: 'AI-Powered Cross-Project Knowledge Bridge terminal designed to streamline command-line workflows. Uses Amazon Q CLI for intelligent code suggestions and cross-project knowledge sharing.',
        tech: ['Python', 'Amazon Q CLI', 'Git', 'pip'],
        links: {
            devPost: 'https://dev.to/asynchronope/devbridge-a-knowledge-bridge-4479',
        },
        buildingId: 'internet-cafe',
    },
    {
        id: 'day-planner',
        title: 'Day Planning App',
        description: 'AI-assisted scheduling for Builder.io',
        longDescription: 'AI-assisted daily scheduling application built for the Builder.io hackathon. Visual component-based planning with Builder.io\'s visual CMS.',
        tech: ['Builder.io', 'React', 'Visual CMS'],
        links: {
            demo: 'https://3607ee82fd924553bb7d912cb31334d0-main.projects.builder.my',
        },
        buildingId: 'internet-cafe',
    },

    // ═══════════════════════════════════════════════════════════════
    // WORKSHOP - Experiments & Prototypes (6 projects)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'canggu-fun',
        title: 'Canggu.fun',
        description: 'Digital nomad community platform',
        longDescription: 'A full-featured digital nomad community platform for Canggu, Bali. Your Complete Nomad Ecosystem - from finding the perfect workspace to building lasting connections in Canggu, we\'ve got you covered.',
        tech: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS 4', 'shadcn/ui', 'Zustand', 'TanStack Query', 'Supabase'],
        links: {
            demo: 'https://canggu.fun',
        },
        buildingId: 'workshop',
        featured: true,
    },
    {
        id: 'team-morph',
        title: 'TeamMorph',
        description: 'AI platform for talent development',
        longDescription: 'Simple AI-powered platform for talent development and team architecture. Built on Base44 low-code platform with AI-driven team insights.',
        tech: ['Base44', 'AI', 'Low-code'],
        links: {
            demo: 'https://team-morph.base44.app/',
        },
        buildingId: 'workshop',
    },
    {
        id: 'threadhive',
        title: 'ThreadHive',
        description: 'Transform discussions into knowledge graphs',
        longDescription: 'Transform Linear Discussions into Interactive Knowledge. Client-side SPA with dashboard tools for visualizing conversation threads as knowledge graphs.',
        tech: ['React 18', 'Vite', 'Shadcn/ui', 'Tailwind', 'Recharts', 'TanStack Query', 'React Router'],
        links: {
            demo: 'https://threadhive.chronolove.app/',
        },
        buildingId: 'workshop',
        prototype: true,
    },
    {
        id: 'zapcardify',
        title: 'ZapCardify',
        description: 'AI digital business card maker',
        longDescription: 'Digital business cards maker with Firebase backend. Features QR code generation, color customization, CSV import, and beautiful animations.',
        tech: ['Next.js 14', 'TypeScript', 'Firebase', 'Framer Motion', 'QRCode.react', 'Papa Parse', 'Radix UI'],
        links: {
            demo: 'https://zapcardify.chronolove.app/',
        },
        buildingId: 'workshop',
        prototype: true,
    },
    {
        id: 'mitra-alkasa',
        title: 'Mitra Alkasa',
        description: 'Local Indonesian aluminum door & window store',
        longDescription: 'E-commerce for Indonesian aluminum door and window store. Features Supabase auth, Zustand state management, React Query data fetching, and Resend email integration.',
        tech: ['React', 'TypeScript', 'Vite', 'Supabase', 'Zustand', 'React Query', 'Resend', 'Netlify'],
        links: {
            demo: 'https://mitra-alkasa.netlify.app/',
        },
        buildingId: 'workshop',
    },
    {
        id: 'locationscout',
        title: 'LocationScout',
        description: 'AI-powered business location analysis',
        longDescription: 'Find your next business opportunity with AI-powered location analysis. Features real-time WebSocket chat, video calls, and Supabase backend.',
        tech: ['React', 'TypeScript', 'Supabase', 'WebSocket', 'Vite', 'Tailwind', 'Netlify'],
        links: {
            demo: 'https://locationscout.chronolove.app/',
        },
        buildingId: 'workshop',
        prototype: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // LIBRARY - Tools, Templates & Documentation (8 projects)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'patent-timeline',
        title: 'PatentTimeline',
        description: 'Know when patents expire, better than Google',
        longDescription: 'Know the Exact Day a Patent Dies better than Google Patent. Uses USPTO PatentsView API and Exa AI for intelligent patent analysis with Supabase Edge Functions.',
        tech: ['React 18', 'TypeScript', 'Vite', 'Supabase Edge Functions', 'USPTO PatentsView', 'Exa AI', 'PostgreSQL'],
        links: {
            demo: 'https://patenttimeline.vercel.app/',
        },
        buildingId: 'library',
        featured: true,
    },
    {
        id: 'quakewatch',
        title: 'QuakeWatch',
        description: 'Real-time global earthquake monitoring',
        longDescription: 'Real-time global quake data via interactive map, tracking seismic patterns with filtering & clustering. Indonesia-focused earthquake monitoring with Mapbox GL.',
        tech: ['React', 'Vite', 'Mapbox GL JS', 'Tailwind', 'React Query'],
        links: {
            github: 'https://github.com/bO-05/quakewatch',
            demo: 'https://quakewatch.vercel.app/',
            devPost: 'https://devpost.com/software/quakewatch-real-time-global-earthquake-monitoring-platform',
        },
        buildingId: 'library',
        award: '🥈 Finalist - Hack for Humanity 2025',
    },
    {
        id: 'home-construction',
        title: 'Home Construction Website',
        description: 'Construction company website',
        longDescription: 'Modern construction company website with React Router 7 routing, Radix UI components, and GSAP animations.',
        tech: ['React 19', 'Vite', 'React Router 7', 'Tailwind', 'Radix UI', 'GSAP'],
        links: {
            demo: 'https://www.homeconstruction.site/',
        },
        buildingId: 'library',
    },
    {
        id: 'highschool-template',
        title: 'Highschool Website Template',
        description: 'Modern, responsive school website template',
        longDescription: 'A modern school website template with Next.js 16 Server Components, Turso edge database, 3D visuals with Three.js, and Better Auth authentication.',
        tech: ['Next.js 16', 'React 19', 'Turso', 'Drizzle ORM', 'Three.js', 'GSAP', 'Framer Motion', 'Better Auth'],
        links: {
            github: 'https://github.com/bO-05/highschool-website-template',
            demo: 'https://highschool-website-template.vercel.app/',
        },
        buildingId: 'library',
    },
    {
        id: 'propulsoor-drive',
        title: 'PropulsoorDrive',
        description: 'Scroll-linked animation showcase',
        longDescription: 'Simple modern animated landing page using Scroll-Linked Animation technique. Reference implementation for advanced Framer Motion scroll effects.',
        tech: ['Next.js', 'Framer Motion', 'Tailwind'],
        links: {
            github: 'https://github.com/bO-05/PropulsoorDrive',
            demo: 'https://propulsoor-drive.vercel.app/',
        },
        buildingId: 'library',
    },
    {
        id: 'virgil-abloh-clone',
        title: 'Virgil Abloh Clone',
        description: 'Designer portfolio study',
        longDescription: 'Virgil Abloh web clone - a design study recreating the legendary designer\'s portfolio aesthetic with Three.js 3D elements and tsparticles.',
        tech: ['Next.js', 'Tailwind', 'Three.js', 'Framer Motion', 'tsparticles'],
        links: {
            github: 'https://github.com/bO-05/virgil-abloh-web-clone',
            demo: 'https://virgil-abloh-web-clone.vercel.app/',
        },
        buildingId: 'library',
    },
    {
        id: 'v0-chrono-organic',
        title: 'Chrono-Organic Research Landing Page',
        description: 'Research firm landing page template',
        longDescription: 'Landing page template for research firms. Using advanced shader and aesthetically pleasing animation design for advanced thinking research firm.',
        tech: ['v0 AI', 'React', 'Vercel'],
        links: {
            demo: 'https://v0.app/templates/chrono-organic-research-landing-page-1MjgczG1Igb',
        },
        buildingId: 'library',
    },
    {
        id: 'v0-void-corp',
        title: 'Void Corp Landing Page',
        description: 'Corporation landing page template',
        longDescription: 'Corporation landing page template. Dark, mysterious aesthetic perfect for tech startups or creative agencies.',
        tech: ['v0 AI', 'React', 'Vercel'],
        links: {
            demo: 'https://v0.app/templates/void-corp-landing-page-F5WAnyOUfW9',
        },
        buildingId: 'library',
    },

    // ═══════════════════════════════════════════════════════════════
    // HOUSE - Personal & Life Projects (3 projects)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'chronolove',
        title: 'Chronolove',
        description: 'Micro-wedding planning app',
        longDescription: 'Modern wedding planning application for intimate weddings. Full-stack with Turso database, Autumn/Stripe payments, OpenAI recommendations, and Resend notifications.',
        tech: ['Next.js 16', 'React 19', 'Turso', 'Drizzle ORM', 'Better Auth', 'Stripe', 'OpenAI', 'Resend', 'Tailwind 4'],
        links: {
            demo: 'https://www.chronolove.app/',
        },
        buildingId: 'house',
        featured: true,
    },
    {
        id: 'bondpath',
        title: 'BondPath',
        description: 'Relationship growth with Harada Method',
        longDescription: 'A relationship growth and habit tracking app built with the Harada Method (原田メソッド). Features Turso edge database, Mistral AI insights, and Resend email notifications.',
        tech: ['Next.js 16', 'TypeScript', 'Turso', 'Drizzle ORM', 'Mistral AI', 'Better Auth', 'Resend', 'Vercel'],
        links: {
            demo: 'https://bondpath.vercel.app/',
        },
        buildingId: 'house',
        featured: true,
    },
    {
        id: 'scoutvenues',
        title: 'ScoutVenues',
        description: 'Discover local community spaces',
        longDescription: 'Find Nearby Venues - discover religious places, libraries, sports venues with React Leaflet maps. Features Sentry error tracking, PostHog analytics, and i18next localization.',
        tech: ['React 18', 'Vite', 'Supabase', 'React Leaflet', 'Tailwind', 'Sentry', 'PostHog', 'i18next'],
        links: {
            demo: 'https://scoutvenues-ebon.vercel.app/',
        },
        buildingId: 'house',
    },

    // ═══════════════════════════════════════════════════════════════
    // ARCADE - Games & Interactive (3 projects)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'lore-campsite',
        title: 'Lore Campsite (Spiritdex)',
        description: 'Pokémon for real-life spirits',
        longDescription: 'An app where you visit real places, discover and collect unique AI-generated tales inspired by each location\'s local lore and legends. Uses Gemini AI for story generation and Cloudflare R2 for asset storage.',
        tech: ['React 19', 'TypeScript', 'Vite 6', 'Google Gemini', 'Neon PostgreSQL', 'Cloudflare R2', 'Vercel Edge'],
        links: {
            demo: 'https://lorecamp.site/',
            devPost: 'https://dev.to/asynchronope/spiritdex-an-explorers-journal-43l6',
        },
        buildingId: 'arcade',
    },
    {
        id: 'ali-roboshoot',
        title: 'Ali Roboshoot',
        description: 'Fast-paced arcade shooter game',
        longDescription: 'A fast-paced, arcade shooter game with serverless architecture. Built with Phaser 3, runs on Alibaba Cloud Function Compute with serverless-http adapter.',
        tech: ['Phaser 3', 'Vite', 'Alibaba Cloud Function Compute', 'serverless-http', 'Node.js'],
        links: {
            demo: 'https://aliroboshoot.chronolove.app/',
            devPost: 'https://dev.to/asynchronope/ali-roboshoot-a-phaser-3-arcade-shooter-powered-by-alibaba-cloud-30c',
        },
        buildingId: 'arcade',
    },
    {
        id: 'jakarta-street-portfolio',
        title: 'Jakarta Street Portfolio',
        description: '3D interactive portfolio game',
        longDescription: 'This very website you are exploring! A 3D playable portfolio where you drive a bajaj (Indonesian three-wheeler) around a virtual Jakarta street to discover projects. Features physics-based driving, real-time leaderboard, AI chat assistant (Warung Chat), and immersive day/night cycle.',
        tech: ['React 19', 'TypeScript', 'React Three Fiber', 'Rapier Physics', 'Convex', 'Google Gemini', 'Vite', 'Google Cloud Run'],
        links: {
            demo: 'https://asynchronope.my.id/',
            github: 'https://github.com/bO-05/3d-portfolio',
            devPost: 'https://dev.to/asynchronope/jakarta-street-portfolio',
        },
        buildingId: 'arcade',
        featured: true,
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

/**
 * Get all featured projects
 */
export function getFeaturedProjects(): Project[] {
    return projects.filter((project) => project.featured);
}

/**
 * Get projects by award status
 */
export function getAwardedProjects(): Project[] {
    return projects.filter((project) => project.award);
}

/**
 * Get unique tech stack across all projects
 */
export function getAllTechStack(): string[] {
    const techSet = new Set<string>();
    projects.forEach((project) => {
        project.tech.forEach((t) => techSet.add(t));
    });
    return Array.from(techSet).sort();
}

/**
 * Get project count per building
 */
export function getProjectCountByBuilding(): Record<string, number> {
    return projects.reduce(
        (acc, project) => {
            acc[project.buildingId] = (acc[project.buildingId] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );
}
