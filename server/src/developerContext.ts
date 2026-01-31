/**
 * Developer Context - Knowledge base for AI chat assistant
 * Contains all information the AI needs to answer questions about the developer
 * @module developerContext
 */

// ─────────────────────────────────────────────────────────────
// DEVELOPER PROFILE
// ─────────────────────────────────────────────────────────────

export const DEVELOPER_PROFILE = {
    name: 'Asynchronope',
    tagline: 'Full-Stack Developer specializing in AI-powered applications and interactive 3D experiences',

    contact: {
        github: 'https://github.com/bO-05',
        devto: 'https://dev.to/asynchronope',
        twitter: 'https://x.com/asynchronope',
        medium: 'https://medium.com/@giladam01',
        blog: 'https://asynchronope.vercel.app/',
        portfolio: 'asynchronope.my.id',
    },

    skills: {
        frontend: ['React 19', 'Next.js 15/16', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Framer Motion'],
        backend: ['Node.js', 'Express', 'Supabase', 'Turso', 'PostgreSQL', 'Drizzle ORM'],
        ai: ['Google Gemini', 'Mistral AI', 'OpenAI', 'Vercel AI SDK', 'Auth0 AI SDK'],
        cloud: ['Vercel', 'Netlify', 'Google Cloud Run', 'Alibaba Cloud', 'Cloudflare R2'],
        gamedev: ['Phaser 3', 'React Three Fiber', 'Rapier Physics'],
    },

    specializations: [
        'AI-Powered Applications',
        'Web3D and Interactive Game Development',
        'Full-Stack Application Architecture',
        'Rapid MVP Development (Hackathons)',
    ],
};

// ─────────────────────────────────────────────────────────────
// AWARDS & ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────

export const AWARDS = [
    {
        title: 'Auth0 for AI Agents Challenge Winner',
        project: 'Assistant Zero',
        icon: '🏆',
        link: 'https://dev.to/devteam/congrats-to-the-winners-of-the-auth0-for-ai-agents-challenge-2jc8',
    },
    {
        title: 'Postmark Inbox Innovators Winner',
        project: 'EPB (Email to Code)',
        icon: '🏆',
        link: 'https://dev.to/devteam/congrats-to-the-winners-of-postmark-challenge-inbox-innovators-56f2',
    },
    {
        title: 'Wasp Design-AI-thon Winner',
        project: 'Wasp Clone OS',
        icon: '🏆',
        link: 'https://wasp.sh/blog/2025/11/10/design-ai-thon-winners',
    },
    {
        title: 'Hack for Humanity 2025 Finalist',
        project: 'QuakeWatch',
        icon: '🥈',
        link: 'https://hack-for-humanity-25.devpost.com/',
    },
];

// ─────────────────────────────────────────────────────────────
// PROJECT SUMMARIES (for AI context - condensed version)
// ─────────────────────────────────────────────────────────────

interface ProjectItem {
    name: string;
    desc: string;
    award?: string;
}

interface BuildingSummary {
    name: string;
    description: string;
    projects: ProjectItem[];
}

export const PROJECT_SUMMARIES: Record<string, BuildingSummary> = {
    'internet-cafe': {
        name: 'Internet Cafe',
        description: 'Production AI apps & Hackathon Winners',
        projects: [
            { name: 'Assistant Zero', desc: 'AI assistant with Auth0 security', award: '🏆 Auth0 Winner' },
            { name: 'EPB', desc: 'Email-to-code generation with Mistral', award: '🏆 Postmark Winner' },
            { name: 'Wasp Clone OS', desc: 'Interactive OS playground', award: '🏆 Wasp Winner' },
            { name: 'AI Blog Studio', desc: 'Multimedia content generation' },
            { name: 'DevBridge', desc: 'Cross-project knowledge terminal' },
            { name: 'Day Planning App', desc: 'AI scheduling with Builder.io' },
        ],
    },
    'workshop': {
        name: 'Workshop',
        description: 'Experiments & Prototypes',
        projects: [
            { name: 'TeamMorph', desc: 'AI talent development' },
            { name: 'ThreadHive', desc: 'Knowledge graphs (prototype)' },
            { name: 'ZapCardify', desc: 'Business cards (prototype)' },
            { name: 'LocationScout', desc: 'Location analysis (prototype)' },
            { name: 'Mitra Alkasa', desc: 'Indonesian e-commerce' },
        ],
    },
    'library': {
        name: 'Library',
        description: 'Tools, Templates & Documentation',
        projects: [
            { name: 'PatentTimeline', desc: 'Patent expiration tracker' },
            { name: 'QuakeWatch', desc: 'Earthquake monitoring', award: '🥈 Finalist' },
            { name: 'Home Construction', desc: 'Construction business website' },
            { name: 'Highschool Template', desc: 'School website template' },
            { name: 'PropulsoorDrive', desc: 'Scroll animation demo' },
            { name: 'Virgil Abloh Clone', desc: 'Designer portfolio study' },
            { name: 'v0 Templates', desc: '2 landing page templates' },
        ],
    },
    'house': {
        name: 'House',
        description: 'Personal & Life Projects',
        projects: [
            { name: 'BondPath', desc: 'Relationship app with Harada Method' },
            { name: 'Chronolove', desc: 'Micro-wedding planner' },
            { name: 'ScoutVenues', desc: 'Community space finder' },
        ],
    },
    'arcade': {
        name: 'Arcade',
        description: 'Games & Interactive',
        projects: [
            { name: 'Jakarta Street Portfolio', desc: 'This 3D portfolio game!', award: '🎮 Featured' },
            { name: 'Lore Campsite', desc: 'Collect AI-generated local legends' },
            { name: 'Ali Roboshoot', desc: 'Arcade shooter on serverless' },
        ],
    },
};

// ─────────────────────────────────────────────────────────────
// FAQ KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────

export const FAQ = {
    contact: `You can reach the developer through:
- GitHub: https://github.com/bO-05
- DEV.to: https://dev.to/asynchronope  
- Twitter/X: https://x.com/asynchronope`,

    experience: `The developer has won 3 hackathons (Auth0, Postmark, Wasp) and was a finalist in Hack for Humanity 2025. They specialize in AI-powered applications, full-stack development, and interactive 3D experiences.`,

    techStack: `Primary stack: React/Next.js with TypeScript for frontend, Node.js/Express for backend, and AI services like Gemini, Mistral, and OpenAI. For databases: PostgreSQL (Neon/Supabase), Turso, with Drizzle ORM.`,

    aiExperience: `AI is a core specialization! The developer has built production AI assistants with Auth0 security, email-to-code services with Mistral, and various AI applications using Gemini and OpenAI.`,

    awardWinning: `Three hackathon wins:
1. Assistant Zero - Auth0 for AI Agents Challenge
2. EPB - Postmark Inbox Innovators
3. Wasp Clone OS - Wasp Design-AI-thon
Plus QuakeWatch was a Hack for Humanity 2025 finalist.`,

    portfolio: `This 3D portfolio is built with React Three Fiber, Rapier physics, Vite, TypeScript, and Google Gemini for this AI chat. It's a playable 3D game where you drive around a virtual Jakarta street!`,

    buildings: `Each building represents a project category:
- Internet Cafe: AI apps & hackathon winners
- Workshop: Experiments & prototypes  
- Library: Tools & templates
- House: Personal projects
- Arcade: Games
- Warung: This chat!`,
};

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT BUILDER
// ─────────────────────────────────────────────────────────────

export function buildDeveloperSystemPrompt(): string {
    const skillsList = Object.entries(DEVELOPER_PROFILE.skills)
        .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
        .join('\n');

    const awardsList = AWARDS
        .map(a => `${a.icon} ${a.title} - ${a.project}`)
        .join('\n');

    const projectsList = Object.values(PROJECT_SUMMARIES)
        .map(building => {
            const projects = building.projects
                .map(p => `  - ${p.name}: ${p.desc}${p.award ? ` (${p.award})` : ''}`)
                .join('\n');
            return `${building.name} (${building.description}):\n${projects}`;
        })
        .join('\n\n');

    return `You are the AI assistant at Warung Chat, part of a 3D portfolio website for developer "${DEVELOPER_PROFILE.name}".

ABOUT THE DEVELOPER:
${DEVELOPER_PROFILE.tagline}

SKILLS:
${skillsList}

AWARDS & ACHIEVEMENTS:
${awardsList}

PROJECTS BY BUILDING:
${projectsList}

CONTACT INFORMATION:
${FAQ.contact}

INSTRUCTIONS:
- Speak ONLY in English (this is a global portfolio)
- Be helpful, friendly, and conversational
- Keep responses concise (under 200 words)
- When asked about contact, provide the GitHub/DEV.to/Twitter links
- When asked about projects, describe them with their tech stack
- If asked something you don't know, politely say you don't have that information
- Do NOT make up information not provided in this context`;
}
