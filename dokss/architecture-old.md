# JAKARTA STREET PORTFOLIO - FULL ARCHITECTURE
## Timeline: 2 weeks | Stack: React Three Fiber + Cannon.js + Gemini API + Cloud Run

================================================================================
1. FILE & FOLDER STRUCTURE
================================================================================

jakarta-portfolio/
├── client/                          # Frontend (React + Three.js)
│   ├── public/
│   │   ├── models/                  # 3D assets from Spline/Meshy
│   │   │   ├── buildings/
│   │   │   │   ├── warung.glb
│   │   │   │   ├── internet-cafe.glb
│   │   │   │   ├── library.glb
│   │   │   │   ├── studio.glb
│   │   │   │   └── home.glb
│   │   │   ├── vehicles/
│   │   │   │   └── bajaj.glb       # Or motor.glb
│   │   │   ├── props/
│   │   │   │   ├── street-lamp.glb
│   │   │   │   ├── trees.glb
│   │   │   │   └── signs.glb
│   │   │   └── characters/
│   │   │       └── npc-idle.glb
│   │   ├── textures/                # From Imagen 3
│   │   │   ├── asphalt.jpg
│   │   │   ├── building-walls.jpg
│   │   │   └── sky.jpg
│   │   └── sounds/
│   │       ├── engine.mp3
│   │       ├── honk.mp3
│   │       └── ambient-jakarta.mp3
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Experience.jsx      # Main 3D scene container
│   │   │   ├── Scene/
│   │   │   │   ├── Ground.jsx      # Floor with asphalt texture
│   │   │   │   ├── Sky.jsx         # Skybox with day/night
│   │   │   │   ├── Lighting.jsx    # Directional + Ambient lights
│   │   │   │   └── Street.jsx      # Contains all buildings
│   │   │   ├── Buildings/
│   │   │   │   ├── Warung.jsx      # Clickable building
│   │   │   │   ├── InternetCafe.jsx
│   │   │   │   ├── Library.jsx
│   │   │   │   ├── Studio.jsx
│   │   │   │   └── Home.jsx
│   │   │   ├── Vehicle/
│   │   │   │   ├── Bajaj.jsx       # 3D model + physics body
│   │   │   │   └── useVehicleControls.js  # Hook for WASD/Arrow
│   │   │   ├── NPCs/
│   │   │   │   ├── NPC.jsx         # Reusable NPC component
│   │   │   │   └── useNPCDialogue.js  # Gemini-powered dialogue
│   │   │   ├── UI/
│   │   │   │   ├── HUD.jsx         # Speed, minimap, instructions
│   │   │   │   ├── ChatOverlay.jsx # Gemini chat when entering Warung
│   │   │   │   ├── ProjectModal.jsx # Shows project details
│   │   │   │   ├── MobileControls.jsx # Touch buttons
│   │   │   │   └── LoadingScreen.jsx
│   │   │   ├── Camera/
│   │   │   │   └── FollowCamera.jsx # Top-down camera that follows player
│   │   │   └── Physics/
│   │   │       └── PhysicsWorld.jsx # Cannon.js world setup
│   │   │
│   │   ├── hooks/
│   │   │   ├── useKeyboard.js      # Keyboard input handler
│   │   │   ├── useGemini.js        # Gemini API calls
│   │   │   ├── useAudio.js         # Sound effects manager
│   │   │   └── useGameLoop.js      # Physics update loop
│   │   │
│   │   ├── stores/
│   │   │   └── gameStore.js        # Zustand store (see section 3)
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js        # Game config (speed, camera distance)
│   │   │   ├── projectsData.js     # Your portfolio projects
│   │   │   └── syncPhysics.js      # Three.js ↔ Cannon.js sync
│   │   │
│   │   ├── services/
│   │   │   └── geminiService.js    # API wrapper for Gemini calls
│   │   │
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   │
│   ├── package.json
│   └── vite.config.js              # Vite bundler config
│
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── gemini.js           # Proxy Gemini API calls
│   │   │   ├── visitors.js         # Track visitor count
│   │   │   └── whispers.js         # Save/retrieve user messages
│   │   ├── middleware/
│   │   │   └── rateLimit.js        # Prevent API abuse
│   │   ├── services/
│   │   │   └── geminiClient.js     # Server-side Gemini SDK
│   │   └── server.js               # Express app
│   ├── package.json
│   └── Dockerfile                  # For Cloud Run
│
├── .env.example                     # Template for API keys
├── cloudbuild.yaml                  # Cloud Run CI/CD config
├── Dockerfile                       # Multi-stage build
└── README.md


================================================================================
2. WHAT EACH PART DOES
================================================================================

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER (React Three Fiber)                                  │
└─────────────────────────────────────────────────────────────────────┘

Experience.jsx
  └─ Main Canvas wrapper
  └─ Contains all 3D components
  └─ Provides <Canvas> from @react-three/fiber

Scene/
  ├─ Ground.jsx: Plane with asphalt texture, receives shadows
  ├─ Sky.jsx: Skybox that changes color based on time (day/night cycle)
  ├─ Lighting.jsx: DirectionalLight (sun) + AmbientLight
  └─ Street.jsx: Parent component that positions all buildings

Buildings/
  Each building is:
  ├─ A <primitive> component wrapping a useGLTF() loaded model
  ├─ A <RigidBody> from @react-three/rapier (or Cannon body)
  ├─ onClick handler that dispatches "enterBuilding(buildingId)" to store
  └─ Hover effect (scale up slightly, glow shader)

Vehicle/Bajaj.jsx
  ├─ Loads 3D model with useGLTF()
  ├─ Creates Cannon.js RaycastVehicle body
  ├─ Reads input from useVehicleControls() hook
  ├─ Updates physics body forces (forward/backward/steering)
  └─ useFrame() syncs Three.js mesh with Cannon.js body position

useVehicleControls.js
  ├─ Reads keyboard (useKeyboard hook) or touch events
  ├─ Maps WASD/Arrows to {forward, backward, left, right} booleans
  └─ Returns control state object

NPCs/NPC.jsx
  ├─ Loads character model
  ├─ Idle animation loop
  ├─ onPointerOver: Shows dialogue bubble (fetched from Gemini)
  └─ Position is randomly set near buildings

UI/HUD.jsx
  ├─ Shows speed (from gameStore)
  ├─ Minimap (2D canvas overlay)
  ├─ Instructions ("Press E to enter")
  └─ Visitor counter (from backend API)

UI/ChatOverlay.jsx
  ├─ Opens when player enters Warung building
  ├─ Chat input field
  ├─ Sends message to useGemini() hook
  ├─ Displays AI response (streamed)
  └─ Close button returns to game

UI/ProjectModal.jsx
  ├─ Opens when player enters Internet Cafe
  ├─ Displays project cards (from projectsData.js)
  ├─ Each card: Title, description, tech stack, GitHub link, demo
  └─ Gallery view with screenshots

Camera/FollowCamera.jsx
  ├─ Custom hook or component
  ├─ Reads player position from gameStore
  ├─ Sets camera.position.x = player.x, camera.position.z = player.z
  ├─ camera.position.y = CAMERA_HEIGHT (constant ~15 units)
  ├─ camera.lookAt(player.position)
  └─ Optional: Mouse drag rotates around player

Physics/PhysicsWorld.jsx
  ├─ Initializes Cannon.World with gravity
  ├─ Adds ground plane (static body)
  ├─ Wraps children in <Physics> provider
  └─ useFrame() steps physics world forward


┌─────────────────────────────────────────────────────────────────────┐
│ HOOKS LAYER (Reusable Logic)                                        │
└─────────────────────────────────────────────────────────────────────┘

useKeyboard.js
  ├─ useEffect with window.addEventListener('keydown/keyup')
  ├─ Returns object: { forward: bool, back: bool, left: bool, right: bool }
  └─ Updates on every keypress

useGemini.js
  ├─ Sends fetch() to backend /api/gemini
  ├─ Accepts { prompt, context } (context = current building, projects)
  ├─ Returns { response, loading, error }
  └─ Handles streaming responses (SSE or chunks)

useAudio.js
  ├─ Creates Howler.js instances for sounds
  ├─ playEngine(speed): Adjusts engine sound pitch based on speed
  ├─ playHonk(): Plays honk.mp3
  └─ Cleanup on unmount

useGameLoop.js
  ├─ useFrame() from R3F
  ├─ Steps Cannon.js world: world.step(1/60, deltaTime, 3)
  ├─ Syncs all physics bodies to Three.js meshes
  └─ Updates gameStore (speed, position)


┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND LAYER (Node.js + Express)                                   │
└─────────────────────────────────────────────────────────────────────┘

server/src/server.js
  ├─ Express app setup
  ├─ CORS middleware (allow dev.to embedding)
  ├─ Rate limiting (10 requests/minute per IP)
  ├─ Routes: /api/gemini, /api/visitors, /api/whispers
  └─ Listens on PORT (Cloud Run provides this)

routes/gemini.js
  ├─ POST /api/gemini/chat
  ├─ Receives { prompt, context } from frontend
  ├─ Calls Gemini 3 Flash API with system prompt:
      "You are a friendly AI representing an Indonesian developer..."
  ├─ Streams response back to client
  └─ Logs queries for analytics

routes/visitors.js
  ├─ GET /api/visitors/count
  ├─ Tracks unique IPs (simple in-memory Set or Redis)
  └─ Returns { count: number }

routes/whispers.js
  ├─ POST /api/whispers (save message + location)
  ├─ GET /api/whispers?location=warung (retrieve messages)
  ├─ Stores in JSON file or Firestore
  └─ Max 30 whispers total (FIFO queue)

middleware/rateLimit.js
  ├─ Uses express-rate-limit
  └─ Prevents abuse of Gemini API


┌─────────────────────────────────────────────────────────────────────┐
│ DATA & ASSETS LAYER                                                 │
└─────────────────────────────────────────────────────────────────────┘

utils/projectsData.js
  ├─ Array of objects:
      {
        id: 'assistant0',
        title: 'assistant0',
        description: 'Secure AI personal assistant',
        tech: ['React', 'Auth0', 'OpenAI'],
        github: 'https://github.com/bO-05/assistantzero',
        demo: 'https://assistant0agent.vercel.app',
        building: 'internet-cafe',  // Which building shows this
        thumbnail: '/thumbnails/assistant0.jpg'
      }
  └─ Imported by ProjectModal and Gemini context

utils/constants.js
  ├─ VEHICLE_MAX_SPEED = 20
  ├─ CAMERA_HEIGHT = 15
  ├─ CAMERA_DISTANCE = 12
  ├─ BUILDING_POSITIONS = { warung: [10, 0, -5], ... }
  └─ NPC_COUNT = 5

services/geminiService.js
  ├─ Wrapper functions: askQuestion(), generateNPCDialogue()
  ├─ Adds rate limiting client-side
  └─ Error handling + retry logic


================================================================================
3. STATE MANAGEMENT (Zustand Store)
================================================================================

stores/gameStore.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import create from 'zustand'

export const useGameStore = create((set, get) => ({
  
  // ─────────────────────────────────────────────────────────────
  // PLAYER STATE
  // ─────────────────────────────────────────────────────────────
  player: {
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    speed: 0,
    health: 100,
    insideBuilding: null,  // null | 'warung' | 'internet-cafe' | etc
  },
  
  setPlayerPosition: (pos) => set(state => ({
    player: { ...state.player, position: pos }
  })),
  
  setPlayerSpeed: (speed) => set(state => ({
    player: { ...state.player, speed }
  })),
  
  enterBuilding: (buildingId) => set(state => ({
    player: { ...state.player, insideBuilding: buildingId },
    ui: { ...state.ui, showModal: true }
  })),
  
  exitBuilding: () => set(state => ({
    player: { ...state.player, insideBuilding: null },
    ui: { ...state.ui, showModal: false, showChat: false }
  })),
  
  
  // ─────────────────────────────────────────────────────────────
  // GAME STATE
  // ─────────────────────────────────────────────────────────────
  game: {
    isLoading: true,
    isPaused: false,
    timeOfDay: 'day',  // 'day' | 'evening' | 'night'
    visitedBuildings: [],  // Track which buildings user explored
    secretsFound: 0,
    totalSecrets: 5,
  },
  
  setLoading: (isLoading) => set(state => ({
    game: { ...state.game, isLoading }
  })),
  
  togglePause: () => set(state => ({
    game: { ...state.game, isPaused: !state.game.isPaused }
  })),
  
  setTimeOfDay: (time) => set(state => ({
    game: { ...state.game, timeOfDay: time }
  })),
  
  markBuildingVisited: (buildingId) => set(state => ({
    game: {
      ...state.game,
      visitedBuildings: [...new Set([...state.game.visitedBuildings, buildingId])]
    }
  })),
  
  foundSecret: () => set(state => ({
    game: { ...state.game, secretsFound: state.game.secretsFound + 1 }
  })),
  
  
  // ─────────────────────────────────────────────────────────────
  // UI STATE
  // ─────────────────────────────────────────────────────────────
  ui: {
    showHUD: true,
    showMinimap: true,
    showChat: false,
    showModal: false,
    showMobileControls: false,  // Auto-detect on mount
    currentDialogue: null,  // For NPC speech bubbles
  },
  
  openChat: () => set(state => ({
    ui: { ...state.ui, showChat: true }
  })),
  
  closeChat: () => set(state => ({
    ui: { ...state.ui, showChat: false }
  })),
  
  setDialogue: (dialogue) => set(state => ({
    ui: { ...state.ui, currentDialogue: dialogue }
  })),
  
  clearDialogue: () => set(state => ({
    ui: { ...state.ui, currentDialogue: null }
  })),
  
  
  // ─────────────────────────────────────────────────────────────
  // SOCIAL STATE (Whispers)
  // ─────────────────────────────────────────────────────────────
  whispers: [],
  visitorCount: 0,
  
  setWhispers: (whispers) => set({ whispers }),
  setVisitorCount: (count) => set({ visitorCount: count }),
  
  
  // ─────────────────────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────────────────────
  settings: {
    soundEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    graphicsQuality: 'high',  // 'low' | 'medium' | 'high'
  },
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
}))


STATE FLOW EXAMPLE:
───────────────────
1. User presses 'W' key
   → useKeyboard.js updates internal state
   → Bajaj.jsx reads control state
   → Applies force to Cannon.js vehicle body
   → useGameLoop.js syncs position to Three.js mesh
   → useGameLoop.js calls gameStore.setPlayerPosition()
   → HUD.jsx reads gameStore.player.speed and displays it

2. User clicks on Warung building
   → Warung.jsx onClick → gameStore.enterBuilding('warung')
   → gameStore updates player.insideBuilding and ui.showChat = true
   → ChatOverlay.jsx reads gameStore.ui.showChat → renders
   → User types message → useGemini.js sends to backend
   → Backend proxies to Gemini API → returns response
   → ChatOverlay displays AI message


================================================================================
4. SERVICE CONNECTIONS & DATA FLOW
================================================================================

┌──────────────┐
│   Browser    │
│  (Frontend)  │
└───────┬──────┘
        │
        │ 1. Initial load: Fetch 3D models, textures, sounds
        ├─────────────► /models/buildings/*.glb
        │               /textures/*.jpg
        │               /sounds/*.mp3
        │
        │ 2. User enters Warung building
        ├─────────────► gameStore.enterBuilding('warung')
        │               → ui.showChat = true
        │
        │ 3. User types in chat: "Tell me about assistant0"
        │
        ↓
┌────────────────────────────────────────────────────────────┐
│  useGemini.js                                              │
│  ──────────────────────────────────────────────────────────│
│  const response = await fetch('/api/gemini/chat', {       │
│    method: 'POST',                                         │
│    body: JSON.stringify({                                 │
│      prompt: "Tell me about assistant0",                  │
│      context: {                                           │
│        projects: projectsData,                            │
│        currentLocation: 'warung',                         │
│        playerName: 'Anonymous'                            │
│      }                                                     │
│    })                                                      │
│  })                                                        │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ HTTP POST
                         ↓
┌──────────────────────────────────────────────────────────┐
│  Backend (Node.js on Cloud Run)                          │
│  PORT = process.env.PORT || 8080                         │
└────────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ↓                                  ↓
┌────────────────┐              ┌──────────────────┐
│ Rate Limiter   │              │  CORS Middleware │
│ (10 req/min)   │              │  (allow dev.to)  │
└────────┬───────┘              └────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────────┐
│  routes/gemini.js                                          │
│  ────────────────────────────────────────────────────────  │
│  const { prompt, context } = req.body                      │
│  const systemPrompt = `You are an AI assistant for an     │
│    Indonesian developer. Context: ${context}...`           │
│  const response = await geminiClient.generateContent({     │
│    model: 'gemini-3-flash',                               │
│    prompt: systemPrompt + prompt                          │
│  })                                                        │
│  res.json({ text: response.text })                        │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ API Call (with API key from env)
                         ↓
┌────────────────────────────────────────────────────────────┐
│  Gemini 3 Flash API (ai.google.dev)                       │
│  ────────────────────────────────────────────────────────  │
│  - Processes prompt with context                           │
│  - Returns: "assistant0 is a secure AI personal assistant │
│    built with React and Auth0. It won the Auth0 for AI    │
│    Agents Challenge..."                                    │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ Response
                         ↓
                    [Backend]
                         │
                         │ JSON response
                         ↓
                  [Frontend useGemini.js]
                         │
                         │ Update state
                         ↓
                  [ChatOverlay.jsx]
                         │
                         │ Display message
                         ↓
                      [User sees AI response]


PARALLEL FLOW (Visitor Counter):
─────────────────────────────────
On component mount (App.jsx):
  useEffect(() => {
    fetch('/api/visitors/count')
      .then(res => res.json())
      .then(data => gameStore.setVisitorCount(data.count))
  }, [])

Backend tracks unique IPs in Redis/Memory:
  const visitors = new Set()
  app.get('/api/visitors/count', (req, res) => {
    visitors.add(req.ip)
    res.json({ count: visitors.size })
  })


WHISPERS FLOW:
──────────────
User presses 'T' key → Opens whisper input
  → User types "Great portfolio!" + selects location
  → POST /api/whispers { text: "Great portfolio!", location: "warung" }
  → Backend saves to whispers.json (max 30, FIFO)
  → Other users enter that location
  → GET /api/whispers?location=warung
  → Frontend shows floating text bubbles in 3D space


================================================================================
5. DEPLOYMENT ARCHITECTURE (Google Cloud Run)
================================================================================

┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                                          │
│  ──────────────────────────────────────────────────────────  │
│  Terminal 1: cd client && npm run dev  (Vite dev server)   │
│  Terminal 2: cd server && npm run dev  (Nodemon)           │
│  Frontend: localhost:5173                                   │
│  Backend:  localhost:8080                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Build for production
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  DOCKER BUILD (Multi-stage)                                 │
│  ──────────────────────────────────────────────────────────  │
│  Stage 1: Build frontend                                    │
│    FROM node:20 as frontend-build                           │
│    WORKDIR /app/client                                      │
│    COPY client/package*.json ./                             │
│    RUN npm ci                                               │
│    COPY client/ ./                                          │
│    RUN npm run build  → Outputs to client/dist/            │
│                                                             │
│  Stage 2: Setup backend                                     │
│    FROM node:20-slim                                        │
│    WORKDIR /app                                             │
│    COPY server/package*.json ./                             │
│    RUN npm ci --production                                  │
│    COPY server/ ./                                          │
│    COPY --from=frontend-build /app/client/dist ./public    │
│    EXPOSE 8080                                              │
│    CMD ["node", "src/server.js"]                            │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Push image
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Google Artifact Registry                                   │
│  us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:latest│
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Deploy
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Google Cloud Run                                           │
│  ──────────────────────────────────────────────────────────  │
│  Service: jakarta-portfolio                                 │
│  Region: us-central1                                        │
│  Min instances: 0 (scale to zero when idle)                 │
│  Max instances: 10                                          │
│  Memory: 2GB                                                │
│  CPU: 2                                                     │
│  Env vars:                                                  │
│    GEMINI_API_KEY=***                                       │
│    NODE_ENV=production                                      │
│  Allow unauthenticated: Yes (public access)                 │
│  URL: https://jakarta-portfolio-xxx.run.app                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Embed in DEV.to post
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  DEV.to Submission Post                                     │
│  ──────────────────────────────────────────────────────────  │
│  {% cloudrun https://jakarta-portfolio-xxx.run.app          │
│     --labels dev-tutorial,devnewyear2026 %}                 │
└─────────────────────────────────────────────────────────────┘


IMPORTANT: Cloud Run Embedding Config
──────────────────────────────────────
In server.js, add these headers:

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL')
  res.setHeader('Content-Security-Policy', 
    "frame-ancestors 'self' https://dev.to")
  next()
})

This allows DEV.to to embed your site in an iframe.


================================================================================
6. CRITICAL PATHS (User Journey → Code)
================================================================================

PATH 1: First Load
──────────────────
User visits DEV.to post
  → Iframe loads Cloud Run URL
  → server.js serves public/index.html
  → React app loads
  → <LoadingScreen> shows
  → useGLTF preloads 5 building models (Suspense)
  → Once loaded: gameStore.setLoading(false)
  → <Experience> renders
  → <FollowCamera> positions above player
  → <Bajaj> spawns at origin
  → User sees scene, can start driving

PATH 2: Explore & Enter Building
─────────────────────────────────
User drives near Warung
  → Collision detection (Cannon.js sensor body)
  → HUD.jsx shows "Press E to enter"
  → User presses 'E'
  → gameStore.enterBuilding('warung')
  → gameStore.markBuildingVisited('warung')
  → <ChatOverlay> renders
  → User types "What projects have you built?"
  → useGemini() calls backend
  → Backend calls Gemini API with projectsData context
  → Response rendered in chat
  → User clicks X to close
  → gameStore.exitBuilding()
  → Back to driving

PATH 3: NPC Interaction
────────────────────────
User drives near NPC
  → onPointerOver triggers
  → useNPCDialogue() calls useGemini({ 
      prompt: "Generate a short greeting in Indonesian" 
    })
  → Gemini returns: "Halo! Selamat datang di Jakarta!"
  → gameStore.setDialogue({ text: "...", position: npc.position })
  → <DialogueBubble> renders above NPC (HTML overlay)
  → After 3 seconds: gameStore.clearDialogue()

PATH 4: Day/Night Cycle
────────────────────────
useEffect in App.jsx:
  setInterval(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 18) gameStore.setTimeOfDay('day')
    else if (hour >= 18 && hour < 20) gameStore.setTimeOfDay('evening')
    else gameStore.setTimeOfDay('night')
  }, 60000)  // Check every minute

<Sky> component reads gameStore.game.timeOfDay:
  - day: Clear blue gradient
  - evening: Orange/pink gradient
  - night: Dark blue with stars (star field particle system)

<Lighting> component adjusts:
  - day: DirectionalLight intensity = 1.0
  - evening: DirectionalLight intensity = 0.6, color = orange
  - night: DirectionalLight intensity = 0.3, add point lights (street lamps)


================================================================================
7. PERFORMANCE OPTIMIZATIONS
================================================================================

✓ Lazy load distant buildings (LOD system)
✓ Use Draco compressed .glb files (smaller size)
✓ Texture atlases (combine multiple textures into one)
✓ GPU instancing for repeated props (trees, lamps)
✓ Frustum culling (Three.js does this automatically)
✓ Physics optimization: Static buildings don't need RigidBody, just colliders
✓ Code splitting: Lazy load ProjectModal only when needed
✓ Service Worker: Cache 3D models after first load
✓ Cloud Run auto-scaling: Starts new instances if traffic spikes


================================================================================
8. TESTING CHECKLIST
================================================================================

□ Desktop: Chrome, Firefox, Safari
□ Mobile: iOS Safari, Chrome Android
□ Keyboard controls work (WASD/Arrows)
□ Touch controls work (mobile)
□ Gamepad works (optional but nice)
□ All 5 buildings are clickable
□ Gemini chat responds in <3 seconds
□ NPC dialogue generates correctly
□ Day/night cycle transitions smoothly
□ Sounds play (engine, honk, ambient)
□ Embeds correctly in DEV.to iframe
□ Loads in <5 seconds on 4G
□ Runs at 60 FPS on mid-range hardware


================================================================================
9. DEPLOYMENT COMMANDS
================================================================================

# 1. Build locally
cd client && npm run build
cd ../server && npm install

# 2. Test Docker build
docker build -t jakarta-portfolio .
docker run -p 8080:8080 jakarta-portfolio

# 3. Push to Google Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker tag jakarta-portfolio us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:latest
docker push us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:latest

# 4. Deploy to Cloud Run
gcloud run deploy jakarta-portfolio \\
  --image us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:latest \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars GEMINI_API_KEY=YOUR_KEY

# 5. Get URL
gcloud run services describe jakarta-portfolio --region us-central1 --format 'value(status.url)'


================================================================================
10. CRITICAL SUCCESS FACTORS
================================================================================

✓ Physics feels good (arcade style, not floaty)
✓ Camera never gets stuck or jittery
✓ Loads fast (< 5 seconds even on slow connection)
✓ Mobile works perfectly (50% of judges might use phone)
✓ AI chat is responsive and contextual
✓ Buildings are clearly labeled (signs, icons)
✓ Easter eggs reward exploration (boost score)
✓ DEV.to embed works flawlessly
✓ Clear CTA to GitHub/LinkedIn/Resume


End of Architecture Document.
Ready to build. 🚀