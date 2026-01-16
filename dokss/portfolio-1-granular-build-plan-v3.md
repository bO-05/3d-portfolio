# Jakarta Street Portfolio — Outcome-Driven Build Plan (V3)

**Philosophy:** Ship fast, measure everything, optimize based on data, not guesses.

Each phase has **Performance Gates** you must pass before moving to next phase.

***

## 🎯 Success Metrics (The Real Goals)

### Must Have (98% Win Threshold):
- **Load Time**: First Contentful Paint < 2.5s on 4G
- **FPS**: Consistent 30+ FPS on mid-range mobile (tested via PostHog)
- **Error Rate**: <1% sessions with errors (tracked via Sentry)
- **Engagement**: >2 minutes average session, 3+ buildings visited
- **Mobile**: 40%+ of visitors complete on mobile device
- **Bundle**: Total < 5MB transferred, main chunk < 1.5MB
- **Lighthouse**: Performance score >80 on mobile

### Nice to Have (Bonus Points):
- **Virality**: 10+ reactions on DEV.to in first 24 hours
- **Completion**: 20%+ visitors see all 5 buildings
- **AI Engagement**: 30%+ interact with Gemini chat
- **Speed Run**: Someone completes exploration in <60 seconds

***

## Pre-Phase 0: AI-Assisted Development Setup

### Task 0.1 — Configure Antigravity IDE for Max Efficiency
```
START: Downloaded Google Antigravity IDE
DO:
- Open Antigravity, create new workspace for jakarta-portfolio
- Create Custom Rule: "Always use TypeScript strict mode, React best practices, optimize for bundle size"
- Create Custom Rule: "For Three.js code: prefer @react-three/drei abstractions, use instancing for repeated objects"
- Create Custom Rule: "Always add JSDoc comments for exported functions"
- Create Workflow: "Test & Review" → Runs tests, checks bundle size, runs Lighthouse
- Create Workflow: "Component Scaffolder" → Generates React component + test file + story
- Test by prompting: "Create a basic React Three Fiber scene with a cube"
END: Antigravity generates working code in <30 seconds
TEST: Run generated code, verify cube renders, no console errors

WHY: Antigravity's Rules ensure consistent code quality throughout project.
     Workflows automate repetitive tasks (testing, optimization checks).
     You'll build 2-3x faster with agentic assistance [web:129][web:130][web:132].
```

### Task 0.2 — Initialize Project with Monitoring from Day 1
```
START: Empty directory
DO:
- Prompt Antigravity: "Create Vite React TypeScript project with React Three Fiber, Cannon.js, Zustand. 
  Add PostHog analytics and Sentry error tracking. Configure properly."
- AI will generate:
  - package.json with all dependencies
  - vite.config.ts with bundle analyzer
  - .env.example with POSTHOG_KEY, SENTRY_DSN
  - src/lib/posthog.ts (PostHog init)
  - src/lib/sentry.ts (Sentry init with React error boundary)
  - Basic folder structure
- Add your PostHog API key and Sentry DSN to .env
- Run npm install && npm run dev
END: Dev server runs with analytics + error tracking active
TEST: 
- Visit localhost:5173
- Open PostHog dashboard → verify session recorded
- Trigger an error (throw new Error('test')) → verify appears in Sentry

WHY: You want data from the first build, not after launch. PostHog will show you 
     which buildings users visit, how long they drive, where they drop off [web:110][web:113].
     Sentry catches errors you'd never see in your own testing [web:114].
```

### Task 0.3 — Add Performance Monitoring Components
```
START: Project initialized with analytics
DO:
- Install: npm install r3f-perf stats-gl
- Create src/components/Debug/PerformanceMonitor.tsx:
  - Import { Perf } from 'r3f-perf'
  - Import Stats from 'stats-gl'
  - Add both to Canvas (only if ?debug=true in URL)
  - Add FPS tracking that sends to PostHog every 10 seconds:
    posthog.capture('fps_sample', { fps, drawCalls, triangles })
- Create src/hooks/usePerformanceGate.ts:
  - Monitors FPS for 5 seconds
  - If avgFPS < 25, automatically reduce quality (disable shadows, reduce draw distance)
  - Sends 'performance_degraded' event to PostHog with device info
END: Performance monitoring active, auto-adapts to device
TEST: 
- Run app with ?debug=true → see FPS counter
- Throttle CPU in Chrome DevTools → verify quality auto-reduces
- Check PostHog events → verify fps_sample events arriving

WHY: React Three Fiber's <PerformanceMonitor> lets you adapt to device capabilities [web:119][web:123].
     You'll know immediately if mobile performance degrades.
     Stats-gl shows real-time rendering metrics (draw calls, memory) [web:126].
```

***

## Phase 1: Foundation (Goal: Driveable Vehicle in 3D Scene)

**Performance Gate to Pass:** 
✅ Vehicle moves in empty scene at 60 FPS on desktop
✅ Bundle size < 500KB (no assets yet)
✅ Zero console errors
✅ PostHog tracking pageview

### Task 1.1 — Generate Complete Scene Foundation with AI
```
START: Project with monitoring ready
DO: Prompt Antigravity (use parallel agents for speed):
- Agent 1: "Create React Three Fiber Canvas with Ground plane (100x100), top-down camera at y=15, OrbitControls for testing"
- Agent 2: "Create Zustand store with player state (position, speed, insideBuilding), game state (isLoading, timeOfDay), UI state (showChat, showModal)"
- Agent 3: "Create TypeScript types file for all store interfaces and prop types"
- Review AI-generated code, approve all 3 plans
- AI builds all components in parallel
END: Basic 3D scene renders with ground plane
TEST:
- Scene renders at 60 FPS (check Stats)
- Can orbit camera with mouse
- gameStore accessible in console
- PostHog dashboard shows session with "scene_loaded" event

TIME: ~20 minutes (vs 1-2 hours manual)
```

### Task 1.2 — Add Vehicle with Physics (AI-Assisted)
**CRITICAL UPDATE: SPECIFIC PHYSICS LOGIC**
```
START: Ground plane scene working
DO: Prompt Antigravity with these SPECIFIC constraints to avoid "ice-skating" physics:

"Create a vehicle component that:
- Loads a simple box geometry as placeholder
- Uses @react-three/cannon useBox for physics body (mass: 500, args: [2,1,3])
- Has keyboard controls (W/S forward/back, A/D turn) using custom useKeyboard hook
- Syncs position to gameStore every frame

CRITICAL PHYSICS LOGIC:
- Do NOT mutate position directly.
- For Forward/Back: Apply 'api.applyForce' on the local Z-axis relative to the vehicle's rotation.
- For Turning: Apply 'api.applyTorque' to the Y-axis.
- Add damping (linearDamping: 0.5) so it doesn't slide forever.

Generate: Vehicle/Bajaj.tsx, hooks/useKeyboard.ts, and Physics/PhysicsWorld.tsx wrapper"

- Review generated code
- Fix if AI used wrong physics API
- Test manually
END: Box on screen, moves with weight and momentum
TEST:
- W accelerates forward smoothly
- S brakes/reverses
- A/D turn (not instant rotation, uses torque)
- Collides with ground (doesn't fall through)
- Speed shows in console (gameStore.player.speed updates)

MEASURE: Capture 'vehicle_moved' event in PostHog when speed > 0 first time
```

### Task 1.3 — Replace OrbitControls with Follow Camera
```
START: Vehicle moves with keyboard
DO: Prompt Antigravity:
"Create FollowCamera component that:
- Reads player position from gameStore
- Positions camera at (playerX, 15, playerZ + 12)
- Uses smooth lerp (factor 0.1) so camera lags slightly behind
- Always looks at player position
Remove OrbitControls from Canvas"

END: Camera follows vehicle from behind/above, Bruno Simon style
TEST:
- Drive in circles, camera smoothly follows
- No jitter or sudden jumps
- Can't manually rotate camera (that's correct for now)

TIME: ~10 minutes with AI vs 30 minutes manual

PERFORMANCE CHECK:
- Run Lighthouse (npm run build, serve dist/)
- Should score >95 on Performance (it's just a box and ground)
- If not, check bundle size with vite-bundle-visualizer
```

**🚦 Phase 1 Gate:** 
- [ ] Vehicle drives smoothly at 60 FPS
- [ ] Bundle < 500KB
- [ ] PostHog shows 'vehicle_moved' events
- [ ] Camera follows correctly
- [ ] Zero Sentry errors logged

***

## Phase 2: Asset Pipeline (Goal: Beautiful Jakarta Street Scene)

**Performance Gate:**
✅ 5 buildings load and render at 30+ FPS on mobile
✅ Bundle < 5MB total
✅ Loading screen appears while assets load
✅ No missing textures or broken models

### Task 2.1 — Generate 3D Assets with AI
```
START: Phase 1 complete
DO: Make Assets

ASSETS - Hunyuan 3d-v3 via FAL.ai (Buildings):
- Go to (Hunyuan 3d-v3 model)[https://fal.ai/models/fal-ai/hunyuan3d-v3/text-to-3d], use `LowPoly` type,  `40000` as Face Count, and 'triangle' as Polygon Type
- Generate 5 buildings & 1 vehicle in separate tabs simultaneously:
  1. `warung.glb`: "low poly Indonesian warung, orange roof, food stall, game asset style"
  2. `internet-cafe.glb`: "low poly internet cafe, neon sign 'NET', blue colors, game asset, simple geometry"
  3. `library.glb`: "low poly library building, modern architecture, books visible, game asset, minimal"
  4. `music-studio.glb`: "low poly music studio, colorful, artsy walls motif, Indonesian flag framed on wall, game asset"
  5. `house.glb`: "low poly house, traditional Indonesian javanese architecture, small, game asset style"
  6. `bajaj.glb`: "low poly bajaj auto rickshaw, Indonesian style, orange and black, game asset"
  7. `TJ.glb`: "low poly transjakarta bus, Indonesian style, orange and black, game asset" -> this is for easter egg where user press konami buttons and vehicle turns into Transjakarta bus
- Download all 7 as .glb when generated (~5 minutes each)
- Save in public/models/buildings/ for buildings and public/models/vehicles/ for vehicle

SESSION 3 - Imagen 4 via Fal.ai (Textures):
- While models generate, create textures:
- Go to (Imagen 4)[https://fal.ai/models/fal-ai/imagen4/preview]
- Prompt below in the input box with `1:1` as aspect ratio, `.webp` as file format, and `1k` as resolution:
  1. road: "Seamless interlocking paving block texture, top-down view, game texture"
  2. sky: "Seamless interlocking sky, tropical, blue with some clouds, game texture"
  3. grass: "Seamless interlocking grass texture, simple, flat lighting, game texture"
- Save as '.webp' in public/textures/

END: 6 .glb files (5 buildings + 2 vehicle), 3 textures ready
TEST:
- Open each .glb in https://gltf-viewer.donmccurdy.com/
- Verify: <15MB each, textures embedded, no broken materials
- Check polygon count: ~40k triangles per building & vehicle

<!-- OPTIONAL OPTIMIZATION:
- If any model >2MB, use gltf-pipeline to compress:
  npx gltf-pipeline -i model.glb -o model-compressed.glb -d -->

TIME: ~20-30 minutes for all 7 models
COST (as defined in their fal playground page): 
  - Hunyuan 3d-v3: 
    ````
    Your request will cost $0.375 per generation. For $1.00, you can run this model 2 times. Generation types: Normal costs $0.375, LowPoly costs $0.45, Geometry costs $0.225. Enabling PBR materials adds $0.15. Using multi-view images (back/left/right) adds $0.15. Custom face count adds $0.15.
    ````
  - Imagen 4: 
    ````
    Your request will cost $0.04 per image.
    ```
```

### Task 2.2 — Load Assets with Progress Tracking
```
START: Assets generated and compressed
DO: Prompt Antigravity:
"Create asset loading system:
- components/Buildings/ folder with Warung.tsx, InternetCafe.tsx, Library.tsx, MusicStudio.tsx, House.tsx
- Each uses useGLTF('/models/buildings/{name}.glb')
- Position buildings in a circle (radius 20 units) around origin
- Vehicle/Bajaj.tsx updated to load /models/vehicles/bajaj.glb instead of box
- LoadingScreen.tsx that shows progress (uses Suspense + useProgress from drei)
- Ground.jsx updated to use asphalt texture from /textures/asphalt.jpg

Optimize all components for performance."

- Place .glb files in public/models/buildings/ and public/models/vehicles/
- Place textures in public/textures/
- Review AI code, ensure useGLTF() calls are correct
- Add preload hints to all models

END: Loading screen → 5 buildings + vehicle visible in scene
TEST:
- Loading screen shows percentage
- All 5 buildings appear at correct positions
- Vehicle model replaces box
- Ground has road texture
- Can drive around buildings

MEASURE:
- Add PostHog event: 'assets_loaded' with timing data
  const loadTime = performance.now() - startTime
  posthog.capture('assets_loaded', { loadTime, buildingCount: 5 })
- Check bundle size: npm run build && ls -lh dist/assets/
- Verify: Main JS chunk < 1.5MB, total assets < 5MB
```

### Task 2.3 — Add Collision Detection to Buildings
```
START: Buildings render, no collision yet
DO: Prompt Antigravity:
"Add invisible collision boxes to all buildings using @react-three/cannon useBox:
- Each building gets a Static physics body
- Size matches building dimensions (adjust args: [width, height, depth] per building)
- Wrap visual model in <group> with physics ref
- Generate all 5 building components with collision"

END: Vehicle bounces off buildings, can't drive through
TEST:
- Drive at each building at full speed
- Verify collision stops vehicle (no pass-through)
- Vehicle can drive around buildings smoothly
- No weird physics glitches (bouncing, spinning)

FPS CHECK:
- With all 5 buildings + collision, FPS should still be 30+ on mobile
- If FPS drops below 30, reduce building polygon count or disable shadows
```

**🚦 Phase 2 Gate:**
- [ ] All 5 buildings + vehicle load in <5 seconds
- [ ] Mobile FPS stays >30 (test on real device or Chrome Device Emulation)
- [ ] Bundle size <5MB
- [ ] Collision works perfectly
- [ ] PostHog shows 'assets_loaded' events with timing <5000ms
- [ ] Lighthouse Performance score >80

***

## Phase 3: Interactivity (Goal: Clickable Buildings with Modals)

**Performance Gate:**
✅ Modals open instantly (<100ms)
✅ No FPS drop when modal open
✅ PostHog tracks which buildings users visit most

### Task 3.1 — Add Building Interaction System
```
START: Buildings have collision
DO: Prompt Antigravity (2 agents):
Agent 1: "Add hover effects to all buildings:
- useState for hovered
- onPointerOver/Out handlers
- Scale building slightly (1.05x) when hovered
- Change cursor to pointer"

Agent 2: "Add click handlers that call gameStore.enterBuilding(id):
- Update gameStore with enterBuilding and exitBuilding actions
- enterBuilding sets player.insideBuilding and ui.showModal
- Generate all 5 buildings with both hover + click"

END: Buildings scale on hover, clicking triggers store update
TEST:
- Hover over building → scales up, cursor changes
- Click building → console shows gameStore.player.insideBuilding updated
- PostHog captures 'building_entered' event with buildingId

ANALYTICS:
posthog.capture('building_entered', { 
  buildingId, 
  timeSpent: performance.now() - sessionStart,
  buildingsVisitedSoFar: gameStore.game.visitedBuildings.length 
})
```

### Task 3.2 — Create Project Portfolio Data
**CRITICAL UPDATE: SCHEMA FOR AI CONTEXT**
```
START: Click handlers work
DO: Prompt Antigravity to create src/utils/projectsData.ts.
Use this EXACT schema to ensure it works with the AI Chat context later:

// src/utils/projectsData.ts
export const projects = [
  {
    id: 'assistant0',
    title: 'Assistant Zero',
    description: 'Secure AI personal assistant with Auth0',
    longDescription: 'A production-ready AI assistant that uses Auth0 for authentication...',
    tech: ['React', 'Auth0', 'OpenAI', 'Vercel'],
    links: { 
      github: 'https://github.com/bO-05/assistantzero',
      demo: 'https://assistant0agent.vercel.app',
      devPost: 'https://dev.to/async_dime/...' 
    },
    buildingId: 'internet-cafe', // MUST MATCH GLB NAME
    thumbnail: '/thumbnails/assistant0.jpg',
    award: '🏆 Won Auth0 for AI Agents Challenge',
    featured: true
  },
  // Add 4 more projects here
]

- Take screenshots of each project, optimize (use Squoosh.app), save in public/thumbnails/
- Ensure each <100KB

END: projectsData.ts with 5 real projects
TEST: Import and console.log, verify structure
```

### Task 3.3 — Build Project Modal UI
```
START: projectsData ready
DO: Prompt Antigravity:
"Create ProjectModal.tsx component that:
- Reads gameStore.player.insideBuilding
- If insideBuilding === 'internet-cafe', renders modal
- Modal is fixed overlay (z-index 1000) with backdrop
- Filters projectsData by buildingId
- Shows grid of cards (use CSS Grid, responsive)
- Each card: thumbnail, title, tech badges, description, buttons for Code/Demo
- Close button (X) calls gameStore.exitBuilding()

Style it to look good (glassmorphism or neumorphism, your choice)"

END: Clicking Internet Cafe opens modal with your projects
TEST:
- Click Internet Cafe → modal opens
- See all projects in grid
- Click GitHub link → opens in new tab
- Click X → modal closes
- Drive around again → modal stays closed

PERFORMANCE:
- Modal should not re-render entire 3D scene
- Use React.memo() on ProjectModal
- Lazy load modal: const ProjectModal = React.lazy(...)

ANALYTICS:
posthog.capture('project_viewed', { projectId, source: 'internet-cafe' })
```

**🚦 Phase 3 Gate:**
- [ ] 5 buildings clickable
- [ ] Internet Cafe shows project modal
- [ ] Modal renders in <100ms (no lag)
- [ ] PostHog shows 'building_entered' and 'project_viewed' events
- [ ] All project links work

***

## Phase 4: Backend + AI Chat (Goal: Gemini-Powered Conversations)

**Performance Gate:**
✅ Gemini API responds in <3 seconds
✅ Backend handles 10 requests/min without errors
✅ No API key exposed in frontend bundle

### Task 4.1 — Express Server with Gemini Route (and Pre-emptive CSP)
**CRITICAL UPDATE: PRE-EMPTIVE HEADERS**
```
START: Frontend complete
DO: Prompt Antigravity (new workspace):
"Create Node.js Express server with:
- TypeScript
- CORS enabled
- Rate limiting (express-rate-limit): 10 requests/min per IP
- POST /api/gemini/chat endpoint using @google/generative-ai SDK

CRITICAL SECURITY: Add this middleware to server.ts immediately to allow DEV.to embedding:
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', \"frame-ancestors 'self' https://dev.to\");
  next();
});

- Builds system prompt: 'You are an AI assistant for [Name]. Context: ${JSON.stringify(context)}'
- GET /health endpoint"

- Add your real Gemini API key to server/.env
- Test: cd server && npm install && npm run dev

END: Server runs on localhost:8080 with embedding headers active
TEST:
- curl http://localhost:8080/health → returns 200
- Check headers: curl -I http://localhost:8080/health → verify X-Frame-Options is ALLOWALL
```

### Task 4.2 — Frontend Chat UI with Streaming
```
START: Backend API working
DO: Prompt Antigravity:
"Create ChatOverlay.tsx component:
- Modal that opens when gameStore.ui.showChat is true
- Shows title based on insideBuilding (e.g., 'Chat at Warung Kopi')
- Chat interface: message history + input field
- Uses custom hook useGemini({ prompt, context }) 
- Context includes projectsData and current building
- Shows 'thinking...' animation while loading
- Streams response if possible (use fetch with ReadableStream)
- Close button
- Mobile responsive

Also create hooks/useGemini.ts with fetch logic"

Update gameStore: 
- enterBuilding('warung') should set ui.showChat = true
- Other buildings set ui.showModal = true

END: Clicking Warung opens chat, can talk to AI
TEST:
- Click Warung → chat overlay appears
- Type "What projects has this developer built?" → AI responds with your projects
- Type "Tell me about assistant0" → AI gives details from context
- Response arrives in <3 seconds
- Mobile: chat is readable and usable on phone

ANALYTICS:
posthog.capture('ai_chat_message', { 
  building: 'warung', 
  promptLength: prompt.length,
  responseTime: endTime - startTime 
})

SENTRY INTEGRATION:
if (error) {
  Sentry.captureException(error, {
    tags: { feature: 'ai-chat' },
    contexts: { prompt, response }
  })
}
```

### Task 4.3 — Add Visitor Counter Route
```
START: Chat works
DO: Prompt Antigravity:
"Add /api/visitors/count endpoint to server:
- Uses in-memory Set to track unique IPs: visitors.add(req.ip)
- Returns { count: visitors.size }

Create VisitorCounter component for frontend:
- Fetches /api/visitors/count on mount
- Shows in HUD: '👥 {count} explorers'
- Polls every 30 seconds for updates"

END: HUD shows live visitor count
TEST:
- Open app in 2 different browsers (different IPs if possible)
- Count increments to 2
- Leave open 30 seconds, still updates
```

**🚦 Phase 4 Gate:**
- [ ] Backend deployed locally, all endpoints work
- [ ] Chat responds in <3 seconds average
- [ ] No GEMINI_API_KEY in frontend bundle (check with grep)
- [ ] Sentry catches and reports any API errors
- [ ] PostHog tracks 'ai_chat_message' events

***

## Phase 5: Polish & Performance Optimization

**Performance Gate:**
✅ Lighthouse mobile score >80
✅ Bundle optimized (code-split, tree-shaken)
✅ Mobile FPS >30 consistently
✅ All Core Web Vitals green

### Task 5.1 — Bundle Size Audit & Optimization
```
START: Full app working
DO:
- npm install --save-dev vite-bundle-visualizer rollup-plugin-visualizer
- Add to vite.config.ts:
  import { visualizer } from 'rollup-plugin-visualizer'
  plugins: [
    react(),
    visualizer({ open: true })
  ]
- npm run build
- Browser opens with bundle treemap

IDENTIFY PROBLEMS:
- Is Three.js huge? (It will be ~500KB, that's normal)
- Any duplicate dependencies?
- Any unused libraries imported?

OPTIMIZE:
1. Code-split heavy components:
   const ProjectModal = lazy(() => import('./UI/ProjectModal'))
   const ChatOverlay = lazy(() => import('./UI/ChatOverlay'))
   
2. Tree-shake Drei (only import what you need):
   ❌ import * as drei from '@react-three/drei'
   ✅ import { useGLTF, Html, Stars } from '@react-three/drei'

3. Compress textures:
   - Convert JPGs to WebP
   - Resize to max 1024x1024

4. Add manual chunks in vite.config.ts:
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
           'physics': ['cannon-es', '@react-three/cannon'],
         }
       }
     }
   }

END: Bundle reduced by 20-30%
TEST:
- npm run build → check dist/ size
- Main chunk should be <1.5MB gzipped
- Total assets <5MB

MEASURE:
- Run Lighthouse on production build
- Note: Performance, FCP, LCP, CLS scores
- Compare before/after optimization
```

### Task 5.2 — Add Day/Night Lighting System
```
START: Bundle optimized
DO: Prompt Antigravity:
"Create dynamic lighting system:
- Sky.tsx component that changes gradient based on gameStore.game.timeOfDay
  - day: light blue (#87ceeb)
  - evening: orange/pink gradient
  - night: dark blue (#0c1445) with <Stars /> component
- Lighting.tsx adjusts DirectionalLight based on time:
  - day: intensity 1.0, white
  - evening: intensity 0.6, orange (#ff9966)
  - night: intensity 0.3, blue-tinted
- Add 5 PointLights at building positions (only visible at night)
- In App.tsx, add useEffect that sets time based on real clock:
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 18) setTimeOfDay('day')
  else if (hour >= 18 && hour < 20) setTimeOfDay('evening')
  else setTimeOfDay('night')"

END: Lighting changes based on user's local time
TEST:
- Manually set timeOfDay in store to each state, verify visuals change
- Visit at different times of day (or change system clock)

PERFORMANCE CHECK:
- PointLights can be expensive
- If FPS drops >5, reduce light count or intensity
```

### Task 5.3 — Add Simple Sound Effects
engine sound of three wheeler vehicle
**CRITICAL UPDATE: ENGINE PITCH FORMULA**
```
START: Lighting works
DO:
- Make sounds of engine loop & honk in Beatoven Sfx via FAL.ai:
- Go to (Beatoven Sfx)[https://fal.ai/models/beatoven/sound-effect-generation]
- Generate 2 sounds:
  1. `engine.mp3`: "engine loop sound of three wheeler vehicle"
  2. `honk.mp3`: "honk sound of three wheeler vehicle"
- Save in public/sounds
- Optimize to MP3, <500KB each.

Prompt Antigravity:
"Create useAudio hook with Howler.js:
- playEngine() starts engine.mp3 loop
- stopEngine() stops loop

CRITICAL AUDIO LOGIC:
- In the useFrame loop, update the engine pitch using this exact formula:
  engine.rate(1 + speed / 50)
  (This makes the engine sound like it's revving up as you go faster)

- playHonk() plays honk.mp3 once"

In Bajaj.tsx:
- Call playEngine() when speed > 1
- Call stopEngine() when speed < 1

END: Engine sound plays when driving, pitch changes with speed
TEST:
- Drive forward → engine starts
- Accelerate → pitch increases smoothly
- Stop → engine stops
- Mobile: sound works (test on real device)
```

### Task 5.4 — Mobile Touch Controls
```
START: Desktop fully works
DO: Prompt Antigravity:
"Create MobileControls.tsx:
- Only renders if window.innerWidth < 768
- Fixed position UI with:
  - D-pad on bottom-left (4 directional buttons)
  - Action button bottom-right (for future jump/honk)
- Buttons trigger keyboard events or directly update control state
- Semi-transparent, doesn't block view
- Touch-friendly (large buttons, 60px min)"

END: Touch controls visible on mobile
TEST:
- Open on phone or resize browser <768px
- Verify buttons appear
- Tap up → vehicle moves forward
- Tap left/right → vehicle turns

ANALYTICS:
if (isMobile) posthog.capture('mobile_session_started')
```

### Task 5.5 — Final Performance Pass
```
START: All features complete
DO:
Run full performance audit:

1. Lighthouse CI (mobile + desktop):
   npm install -g @lhci/cli
   lhci autorun --collect.url=http://localhost:5173

2. Check Core Web Vitals in PostHog:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

3. Real Device Testing:
   - Test on actual Android phone (Chrome)
   - Test on iPhone (Safari)
   - Ensure 30+ FPS consistently

4. Bundle final check:
   - Main JS < 1.5MB
   - Models < 3MB total
   - Fonts/textures < 500KB

OPTIMIZATIONS IF NEEDED:
- Enable Vite compression: vite-plugin-compression
- Use CDN for Three.js (move to script tag)
- Reduce building polygon count further
- Disable shadows on mobile entirely:
  if (isMobile) { renderer.shadowMap.enabled = false }

END: Lighthouse >80, all metrics green
TEST: Run Lighthouse 3 times, average scores:
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80
```

**🚦 Phase 5 Gate:**
- [ ] Lighthouse mobile Performance >80
- [ ] Bundle <5MB
- [ ] Mobile FPS >30 (PostHog average)
- [ ] Sound works on mobile
- [ ] Touch controls functional
- [ ] No accessibility issues (Lighthouse Accessibility >90)

***

## Phase 6: Deployment & Submission

**Performance Gate:**
✅ Deployed to Cloud Run with public URL
✅ Embeds in DEV.to iframe
✅ No CORS errors
✅ Analytics active in production

### Task 6.1 — Docker Build & Test
```
START: Local build passes all gates
DO: 
Already have Dockerfile from Task 4.1, test it:
- docker build -t jakarta-portfolio .
- docker run -p 8080:8080 -e GEMINI_API_KEY=xxx -e POSTHOG_KEY=xxx -e SENTRY_DSN=xxx jakarta-portfolio
- Open localhost:8080
- Test full app: drive, enter buildings, chat works

VERIFY:
- Frontend served by Express at /
- API endpoints at /api/* work
- No missing assets (all models load)
- Environment variables working

END: Docker container runs identically to local dev
```

### Task 6.2 — Deploy to Google Cloud Run
```
START: Docker works locally
DO:
- gcloud init (if not done)
- gcloud config set project YOUR_PROJECT_ID
- gcloud services enable run.googleapis.com artifactregistry.googleapis.com
- gcloud artifacts repositories create portfolio --repository-format=docker --location=us-central1
- docker tag jakarta-portfolio us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:v1
- docker push us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:v1
- gcloud run deploy jakarta-portfolio \\
    --image us-central1-docker.pkg.dev/PROJECT_ID/portfolio/app:v1 \\
    --platform managed \\
    --region us-central1 \\
    --allow-unauthenticated \\
    --min-instances 0 \\
    --max-instances 10 \\
    --memory 2Gi \\
    --set-env-vars GEMINI_API_KEY=xxx,POSTHOG_KEY=xxx,SENTRY_DSN=xxx

- Copy the Cloud Run URL (e.g., https://jakarta-portfolio-xxx.a.run.app)

END: App live on Cloud Run URL
TEST:
- Visit Cloud Run URL
- Full app works
- PostHog dashboard shows production sessions
- Sentry dashboard shows zero errors (hopefully!)
```

### Task 6.3 — Test DEV.to Embedding
```
START: Cloud Run deployed
DO:
- Go to DEV.to, create new draft post
- Add embed:
  {% cloudrun https://jakarta-portfolio-xxx.a.run.app --labels dev-tutorial,devnewyear2026 %}
- Preview post
- Click play button on embed

VERIFY:
- Iframe loads without CORS errors (We added headers in Task 4.1 so this should just work!)
- Full 3D scene visible
- Can drive vehicle in iframe
- Modals open correctly
- No "X-Frame-Options" errors

IF BROKEN:
- Double check server.ts has the `frame-ancestors 'self' https://dev.to` header.
- Redeploy.

END: Embed works perfectly in DEV.to draft
```

### Task 6.4 — Write Submission Post
```
START: Embed works
DO: Write full DEV.to post (see template in original plan Task 11.1)

KEY SECTIONS:
1. Hook: "Drive through Jakarta to explore my developer portfolio"
2. About Me: Jakarta/Bekasi, AI enthusiast, hackathon winner
3. Embed: {% cloudrun URL %}
4. How I Built It:
   - React Three Fiber for 3D
   - **Google Antigravity for agentic development** (mention how it 3x'd speed)
   - Gemini 3 Flash for AI chat
   - Meshy/Spline AI for 3D asset generation
   - Cloud Run for deployment
   - PostHog for analytics
   - Sentry for error tracking
5. What I'm Proud Of:
   - Indonesian cultural context
   - Bruno Simon-inspired interaction
   - AI-powered conversations
   - Mobile support
   - Performance optimization (Lighthouse >80)
6. Technical Challenges:
   - Physics tuning for "car feel"
   - Bundle size optimization
   - Mobile performance
7. Future Plans: Day/night cycle, more NPCs, multiplayer?

Add:
- Screenshots (take 3-4 good ones)
- GIF of driving around (use LICEcap or Kap)
- Link to GitHub repo

END: Complete draft post
TEST: Re-read 3 times, check:
- No typos
- All links work
- Required tags: #devnewyear2026, #googleai, #gemini
- Embed visible
```

### Task 6.5 — Pre-Launch Checklist
```
START: Draft post ready
DO:
Final QA across devices:

DESKTOP (Chrome):
- [ ] Scene loads in <5 seconds
- [ ] Vehicle controls smooth
- [ ] All 5 buildings clickable
- [ ] Warung chat works
- [ ] Internet Cafe modal works
- [ ] No console errors

DESKTOP (Firefox):
- [ ] Same tests as Chrome

DESKTOP (Safari):
- [ ] Same tests (Safari can be quirky with WebGL)

MOBILE (iOS Safari):
- [ ] Touch controls appear
- [ ] FPS >25
- [ ] Can enter buildings
- [ ] Chat input works

MOBILE (Android Chrome):
- [ ] Touch controls work
- [ ] FPS >30
- [ ] Buildings clickable

DEV.TO IFRAME:
- [ ] Loads without errors
- [ ] Fully interactive
- [ ] No security warnings

ANALYTICS:
- [ ] PostHog receiving events
- [ ] Sentry not showing errors (or only minor ones)
- [ ] Can see session replays in PostHog

PERFORMANCE:
- [ ] Lighthouse mobile >80
- [ ] Cloud Run cold start <3 seconds
- [ ] Gemini API <3 second response

END: Everything works on all devices
```

### Task 6.6 — PUBLISH!
```
START: All tests pass
DO:
- Publish DEV.to post
- Immediately test published version (not draft)
- Share on:
  - Twitter/X with #googleai #gemini3 #react #threejs
  - LinkedIn with project description
  - Reddit r/webdev (carefully, not spammy)
  - Your Discord/Slack communities
- Monitor:
  - PostHog: How many visitors?
  - DEV.to: How many reactions/comments?
  - Sentry: Any production errors?

FIRST 24 HOURS:
- Respond to ALL comments (engagement boosts ranking)
- Fix any bugs reported immediately
- Update post if needed (you can edit)

END: Submission live, metrics being tracked
```

**🚦 Phase 6 Gate:**
- [ ] Live on Cloud Run
- [ ] Embeds in DEV.to
- [ ] Post published with all required tags
- [ ] PostHog showing production traffic
- [ ] Zero critical Sentry errors

***

## Phase 7: Post-Launch Optimization (Days 2-10)

### Task 7.1 — Analyze Real User Data
```
START: 24 hours after launch
DO: Open PostHog dashboards:

DASHBOARD 1 - User Behavior:
- Which building do most people visit first? (most popular)
- Which building has lowest visits? (needs better placement or signage)
- Average session duration (goal: >2 minutes)
- Drop-off points (where do people leave?)

DASHBOARD 2 - Performance:
- Average FPS by device type (mobile vs desktop)
- Load time distribution (p50, p95, p99)
- Error rate (from Sentry integration)

DASHBOARD 3 - Engagement:
- How many people use AI chat?
- How many project links clicked?
- Returning visitors?

ACTIONS:
- If Internet Cafe visits low → add arrow sign pointing to it
- If mobile FPS low → push emergency performance update
- If chat usage high → add more context to AI responses
- If specific building never visited → redesign it or move it

END: Data-driven action items list
```

### Task 7.2 — A/B Test (If Time Permits)
```
START: Baseline metrics established
DO: Use PostHog feature flags for A/B test:

TEST: Does adding NPC characters increase engagement?
- Variant A (control): No NPCs
- Variant B (test): 5 NPCs with AI dialogue

Implementation:
if (posthog.isFeatureEnabled('show-npcs')) {
  return <NPCs count={5} />
}

Run for 100 sessions, analyze:
- Does session duration increase?
- Do people interact with NPCs?
- Does FPS drop?

If positive: Keep NPCs
If neutral/negative: Remove
```

### Task 7.3 — Iterate Based on Comments
```
START: Reading DEV.to comments
DO: Common requests might be:
- "Can I use arrow keys?" → Add arrow key support
- "Laggy on my phone" → Further mobile optimization
- "Love the warung!" → Add Easter egg reward for visiting all buildings
- "AI responses too generic" → Improve prompt engineering

Make 2-3 small updates based on feedback
Redeploy (Cloud Run makes this easy)
Comment back: "Great idea! Just added that 🚀"

WHY: Shows judges you're engaged and responsive
```

**🚦 Phase 7 Gate:**
- [ ] PostHog dashboard shows >50 unique sessions
- [ ] Average session >2 minutes
- [ ] <1% error rate
- [ ] At least 10 reactions on DEV.to

***

## Emergency Rollback Plans (Just in Case)

### IF: Cloud Run deployment fails
```
BACKUP PLAN:
- Deploy frontend to Vercel: vercel --prod
- Deploy backend to Railway.app (supports Docker)
- Update DEV.to post with new URLs
- Railway.app is simpler than Cloud Run, deploys in <5 mins
```

### IF: Mobile performance terrible (<20 FPS)
```
QUICK FIXES:
1. Reduce draw distance (only render buildings within 30 units)
2. Disable shadows entirely on mobile
3. Lower physics update rate to 30 FPS
4. Use LOD (Level of Detail) - swap buildings for simpler versions when far
5. Add "Performance Mode" toggle in HUD that reduces quality

CODE:
if (isMobile || avgFPS < 25) {
  renderer.shadowMap.enabled = false
  scene.children.forEach(obj => obj.castShadow = false)
  setPixelRatio(1) // instead of window.devicePixelRatio
}
```

### IF: Gemini API rate limited or expensive
```
BACKUP PLAN:
- Pre-generate 20 common Q&A pairs
- Store in projectsData.ts
- On API error, fall back to static responses
- Add cache: store responses in localStorage

CODE:
const cachedResponse = localStorage.getItem(`response_${promptHash}`)
if (cachedResponse) return JSON.parse(cachedResponse)
```

### IF: Bundle size too big (Lighthouse fails)
```
NUCLEAR OPTION:
- Remove Cannon.js physics (just use Three.js raycasting for collision)
- Remove Howler.js (no sounds)
- Remove 3D NPCs
- This can save 500KB+ but loses some polish
Only do if absolutely necessary to pass Performance gate
```

***

## Success Dashboard (Track These Daily)

Create Google Sheet with columns:
| Date | Unique Visitors | Avg Session | FPS (Mobile) | Error Rate | DEV Reactions | Comments |
|------|----------------|-------------|--------------|------------|---------------|----------|

Pull from:
- PostHog API for visitors, session duration
- PostHog custom events for FPS
- Sentry API for error rate
- DEV.to manually check reactions

Goal: See trend lines improve over 2 weeks

***

## Final Wisdom

**What Actually Matters for Winning:**

1. **Innovation (30%)**: You're building Bruno Simon meets Jakarta street scene. That's innovative.
2. **Technical Implementation (40%)**: Performance, clean code, use of Google tools (Antigravity, Gemini, Cloud Run).
3. **User Experience (30%)**: Is it FUN? Do judges spend >5 minutes exploring?

**What Doesn't Matter:**
- Perfect code (judges won't read your code)
- Every feature implemented (ship 80%, not 100%)
- Zero bugs (minor bugs OK if core experience good)

**The Real Secret:**
Most submissions will be boring static portfolios with Gemini chat bolted on.
Yours is a GAME. People will remember it.

**Estimated Total Time with AI Assistance:**
- Phase 0-1: 1 day (Foundation)
- Phase 2: 1 day (Assets)
- Phase 3-4: 2 days (Interactivity + Backend)
- Phase 5: 1 day (Polish)
- Phase 6: 1 day (Deploy)
- Phase 7: Ongoing (Optimization)

**Total: 6-7 active days, 23 days available = 16 days buffer**

You can do this. Start with Phase 0 tomorrow morning. 🚀