# Jakarta Street Portfolio — Phase 5-Neo: World Building & Polish

**Philosophy:** Make it worthy of Awwwards. Every corner should delight.

This phase adds the **soul** to the technically-complete foundation from Phases 0-5.

Inspired by [Bruno Simon's portfolio](https://bruno-simon.com/) - Sites of the Year winner.

---

## 📊 Current State Audit (Post-Phase 5)

### ✅ What We Have:
- **Vehicle System**: Bajaj with realistic physics, engine on/off, boost, honk
- **5 Buildings**: Clickable, open modals with project info
- **AI Chat**: Gemini-powered at Warung
- **Day/Night Lighting**: Dynamic sky, stars, building lights
- **Sound System**: Engine idle/moving/boosting, honk
- **Analytics**: PostHog + Sentry integrated
- **Mobile Controls**: Touch D-pad
- **Visitor Counter**: Live count in HUD
- **Controls Tooltip**: Click Bajaj to see controls

### ❌ What's Missing:
- **No cohesive world** - buildings float in a void
- **No collectibles** - no reason to explore
- **No achievements** - no progression
- **No environmental storytelling** - no Jakarta atmosphere
- **No Easter eggs** - no delights
- **No onboarding** - users are confused
- **No performance benchmarks** - not optimized for Lighthouse

---

## 🎯 Phase 5-Neo Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Mobile Performance | >85 |
| First Contentful Paint | <2s |
| Time to Interactive | <3s |
| Bundle Size (gzipped) | <3MB |
| Mobile FPS | >30 consistent |
| Draw Calls | <100 |
| Session Duration | >3 minutes avg |
| Building Completion Rate | >50% |
| Collectible Pickup Rate | >30% |

---

## Task 5-Neo.1 — Street Environment Props ✅ COMPLETE

**Performance Gate:** Props use instancing, <20 draw calls for all props combined

```
START: Empty ground with buildings
DO:
1. Create/source low-poly Jakarta street props (total <500KB):
   - Lampposts (6x instanced) ✅
   - Street signs (Indonesian style) ✅
   - Benches (4x instanced) ✅
   - Trees/palms (8x instanced) ✅
   - Trash bins (4x instanced) ✅
   - Food cart (1x, placed near warung) ✅

2. Create src/components/Scene/StreetProps.tsx: ✅
   - Low-poly Three.js primitives
   - Position props along street edges
   - Physics collision for all props

3. Add road markings to Ground.tsx:
   - Center line (dashed) ⏸️ DEFERRED (for future game map)
   - Crosswalks near intersections ⏸️ DEFERRED
   - "JALAN PORTFOLIO" painted text ⏸️ DEFERRED

END: Street feels alive, not empty ✅
TEST: 
- Props render correctly on mobile ✅
- Physics collision working ✅
```

### BONUS FEATURES ADDED (not in original plan):

**Vehicle Headlights:**
- Bajaj headlights toggle with C key
- Target-based SpotLight aiming forward
- Visual bulb + housing meshes
- Syncs with vehicle rotation

**Enhanced Lamppost Lighting:**
- Always-on 360° PointLight (intensity 15, distance 55)
- Diamond emissive glow (intensity 55, toneMapped=false)
- Works day and night

**Knockable Props Physics:**
- Bench (mass 15) - tumbles when hit
- TrashBin (mass 3) - flies when hit
- FoodCart (mass 25) - satisfying crash
- Visual meshes synced to physics body via api.position.subscribe()
- Lamppost, Tree, StreetSign remain static

---


## Task 5-Neo.2 — Collectible System ✅ COMPLETE

**Game-feel:** Collect Jakarta-themed items to fill your "Portfolio Journal"

```
START: Street environment ready
DO:
1. Create 5 collectible types (3D shapes): ✅
   - ☕ Kopi Cup (cylinder) - skills badge
   - 🎯 Target (torus ring) - project milestone
   - ⭐ Star (octahedron) - achievement
   - 📝 Note (flat box) - about me info
   - 🔮 Orb (sphere) - Easter egg trigger

2. Create src/components/Collectibles/Collectible.tsx: ✅
   - Floating animation (sine wave Y position)
   - Glow effect (emissive material)
   - Spin animation
   - Distance-based collection (no physics = zero lag!)

3. Create src/stores/collectibleStore.ts: ✅
   - Set-based tracking (O(1) lookup)
   - Debounced localStorage persistence (500ms)
   - Deferred PostHog via requestIdleCallback

4. Position 15 collectibles: ✅
   - 8 visible (floating in open)
   - 4 in breakable boxes (knockable)
   - 3 in passable bushes (secrets)

END: Exploration is rewarded ✅
TEST:
- Drive over collectible → disappears instantly (no lag!)
- Hit box → box flies, collectible appears
- Drive through bush → collect hidden item
- Refresh page → collected items stay collected
```

### BONUS FIXES:
- **Zero-lag collection** via deferred I/O
- **Reverse steering** inverts when backing up
- **Bush positions** fixed (no longer floating)

---
```
START: Street environment ready
DO:
1. Create 5 collectible types (small glowing objects):
   - ☕ Kopi Cup (skills badge)
   - 🎯 Target Icon (project milestone)
   - ⭐ Star (achievement)
   - 📝 Letter/Note (about me info)
   - 🔮 Orb (Easter egg trigger)

2. Create src/components/Collectibles/Collectible.tsx:
   - Floating animation (sine wave Y position)
   - Glow effect (emissive material)
   - Spin animation
   - Collision detection with Bajaj
   - On collect: 
     - Play pickup sound
     - Particle burst effect  
     - Add to gameStore.collectibles[]
     - Track in PostHog

3. Create src/stores/collectibleStore.ts:
   - Track collected items by id
   - Persist to localStorage
   - Calculate completion percentage

4. Position 15-20 collectibles around the map:
   - Near each building entrance
   - Along the street path
   - Hidden corners (Easter eggs)

END: Exploration is rewarded
TEST:
- Drive over collectible → disappears with effect
- Refresh page → collected items stay collected
- PostHog shows 'collectible_picked_up' events
```

---

## Task 5-Neo.3 — Progress HUD & Journal ✅ COMPLETE

**UX:** Always show user their progress

```
START: Collectibles working
DO:
1. Create src/components/UI/ProgressHUD.tsx:
   - Top-right corner, semi-transparent
   - Shows: "3/5 Buildings | 8/15 Items | 45%"
   - Animated counter when values change
   - Small icons for each category

2. Create src/components/UI/JournalModal.tsx:
   - Opens on hotkey (J) or button click
   - Grid of all collectible types
   - Collected = colored, uncollected = grayed silhouette
   - Each item has tooltip with description
   - Shows which buildings visited (stamps)

3. Add to gameStore:
   - journalOpen: boolean
   - getProgress() selector
   - 
END: Users can track their exploration
TEST:
- Collect item → HUD counter animates up
- Press J → journal opens with collected items
- Visit building → stamp appears in journal
```

---

## Task 5-Neo.4 — Onboarding & Tutorial ✅ COMPLETE

**First impression:** User knows what to do in <10 seconds

```
START: HUD and collectibles ready
DO:
1. Create src/components/UI/OnboardingOverlay.tsx:
   - Shows on first visit (localStorage check)
   - Steps:
     1. "Welcome to Jakarta Street" + hero image
     2. "Click the Bajaj to see controls" + arrow pointing
     3. "Press E to start engine" + pulsing E key icon
     4. "Explore buildings to see my portfolio"
     5. "Collect items to unlock achievements"
   - Skip button
   - Don't show again checkbox

2. Add visual hints in-world:
   - Floating arrow above first building
   - Glowing path on ground leading to buildings
   - "PRESS E TO START" floating text above Bajaj initially

3. Track onboarding completion in PostHog:
   - 'onboarding_started'
   - 'onboarding_step_N'
   - 'onboarding_completed' / 'onboarding_skipped'

END: New users are guided, not lost
TEST:
- Fresh incognito visit → onboarding appears
- Complete onboarding → tracks in PostHog
- Subsequent visits → no onboarding (unless reset)
```

---

## Task 5-Neo.5 — Achievement System ✅ COMPLETE

**Dopamine:** Reward exploration with unlockables

```
START: Collectibles and progress tracking
DO:
1. Define achievements in src/data/achievements.ts:
   | ID | Name | Condition | Icon |
   |----|----|----|----|
   | first_drive | "First Steps" | Speed > 0 for first time | 🚗 |
   | engine_master | "Engine Master" | Toggle engine 10 times | 🔧 |
   | all_buildings | "Explorer" | Visit all 5 buildings | 🏛️ |
   | night_owl | "Night Owl" | Play during night mode | 🦉 |
   | speed_demon | "Speed Demon" | Boost for 10 seconds total | 🚀 |
   | collector | "Collector" | Find 10 collectibles | ⭐ |
   | completionist | "Completionist" | 100% completion | 🏆 |

2. Create src/components/UI/AchievementToast.tsx:
   - Slides in from bottom when achievement unlocked
   - Shows icon, name, description
   - Auto-dismisses after 3 seconds
   - Sound effect on unlock

3. Create achievement checking hooks:
   - useAchievements() - checks conditions on state changes
   - Unlocks stored in localStorage
   - Tracked in PostHog

END: Users feel accomplished
TEST:
- Start engine first time → "First Steps" toast
- Visit all buildings → "Explorer" toast
- Achievements persist across sessions
```

---

## Task 5-Neo.6 — Easter Eggs ✅ COMPLETE

**Delight:** Hidden surprises for curious explorers

```
START: Core experience complete
DO:
1. Konami Code (↑↑↓↓←→←→BA) → Bajaj swaps to TransJakarta bus
   - Uses TJ.glb model, scaled appropriately
   - Toggle back by entering code again

2. Honk 5 times quickly (Spacebar) → Bajaj does a wheelie animation
   - 1.5 second tilt animation (20° back)
   - Visual indicator appears during wheelie

3. Drive circles around music studio 5 times → confetti effect
   - Music studio at position [25, 25]
   - Tracks angle rotation, triggers at 10π total

4. Day mode + visit all 5 buildings → Jakarta Sky unlocked
   - Displays beautiful sky.webp texture on sky dome
   - Toggle button appears to switch between dynamic/textured sky

5. Type "disco" → Flashing disco lights overlay
   - Toggle on/off with repeated typing

6. Type "speedrun" → Speed run timer appears
   - Shows elapsed time in MM:SS.mmm format

END: Explorers are rewarded for curiosity
TEST:
- Each Easter egg triggers correctly
- Effects auto-clear or provide toggle
```

---

## Task 5-Neo.7 — Performance Optimization Pass ✅ COMPLETE

**Critical:** Must hit Lighthouse >85 mobile

**Risk Mitigations Added:**
- Self-hosted Draco decoders (no Google CDN dependency)
- WebGL context loss recovery handlers
- Progressive enhancement with device detection
- Rollback procedure documented

```text
START: All features complete
DO:
PHASE 1 - Safety Infrastructure:
1. Copy Draco decoders to public/draco/ (self-hosted)
2. Create src/lib/dracoLoader.ts with error handling
3. Create src/hooks/useContextRecovery.ts for WebGL crash recovery

PHASE 2 - Model Optimization (98.5MB → 1.28MB / 98.7% reduction):
4. Install gltf-pipeline globally
5. Draco compress all 7 GLB files (buildings + vehicles)
6. Keep original models as backup until verified
7. Update useGLTF calls to use Draco loader

PHASE 2.5 - Lazy Loading & Deferred Analytics:
8. Implement `requestIdleCallback` for heavy scripts (PostHog, Sentry)
9. Extract 3D scene to lazy-loaded `SceneContainer`
10. Disable `modulePreload` for 3D chunks in Vite config
11. Add lightweight error boundary for initial render

PHASE 3 - Mobile Optimizations:
12. Add mobile detection in App.tsx
13. Disable shadows on low-end devices
14. Cap DPR at 1.5 on mobile
15. Reduce shadow map 2048→1024 (512 on mobile)
16. Disable antialiasing on mobile

PHASE 4 - Bundle Optimization:
17. Split three.js chunks in vite.config.ts
18. Run build and analyze bundle

PHASE 5 - Verification:
19. Run Lighthouse audit (target >85)
20. Test on real mobile device (>30 FPS)
21. Test WebGL context loss/recovery
22. Verify no console errors across browsers

END: Lighthouse mobile >85, robust across devices
TEST:
- Run Lighthouse 3 times, average >85
- Test on real mobile device: >30 FPS
- Bundle gzipped <3MB
- Test context loss recovery
- Verify on iOS Safari, Samsung Internet
```

---

## Task 5-Neo.8 — Polish & Juice ✅ COMPLETE

**Feel:** Make every interaction satisfying

```
START: Performance optimized
DO:
1. Particle Effects:
   - Dust when driving (small particles behind wheels) ✅
   - Sparkle on collectible pickup ✅
   - Confetti on achievement ⏸️ DEFERRED

2. Camera Juice:
   - Subtle shake on boost activation ✅
   - Smooth transition on building enter/exit ⏸️ DEFERRED
   - Slight zoom on collectible pickup ⏸️ DEFERRED

3. Sound Polish:
   - Ambient Jakarta sounds (distant traffic, birds) ⏸️ DEFERRED
   - Building hover sound (subtle) ⏸️ DEFERRED
   - Achievement unlock fanfare ✅
   - Collectible pickup "ding" ✅

4. Animation Polish:
   - Building hover scale (already done) ✅
   - Collectible bounce/spin ✅
   - HUD number count-up animation ✅
   - Button hover effects ✅

5. Loading Experience:
   - Animated loading bar ✅
   - Jakarta skyline silhouette ⏸️ DEFERRED
   - Loading tips/facts about Jakarta ✅

END: Every interaction feels premium ✅
TEST:
- Play through entire experience ✅
- Note any interaction that feels "flat" ✅
- Each interaction should have feedback ✅
```

### AI Code Review Improvements (PR #4):
Code quality fixes applied via CodeRabbit, Cubic, Mesa, Entelligence reviews:
- Frame-rate independent particle motion (`DustParticles`, `CollectibleSparkle`)
- Proper RAF cleanup in `ProgressHUD` (prevents memory leaks)
- Audio context resume/catch in `AchievementToast`
- Volume=0 guard in `synthSounds.ts` (prevents Web Audio errors)
- Removed dead code (unused opacity/sizes buffer attributes)
- Building hitbox alignment fixes

---

## Task 5-Neo.9 — Real-time Minimap ✅ COMPLETE

**Inspiration:** Bruno Simon's portfolio map + RPG/GTA game minimaps

**Actual Implementation:** HTML Canvas 2D overlay (better performance than Drei View)
- Zero WebGL overhead (no extra 3D rendering)
- Full CSS glassmorphism styling (GTA-style circular border with glow)
- 30fps frame-rate limited for performance
- Mobile responsive sizing

### Features Implemented:
- 🛺 Player emoji at center (always facing up)
- 🏠💻📚🎵🍜 Building emojis with colored backgrounds
- 🔄 Reset zone marker
- N/E/S/W compass that rotates with player heading
- M key to expand/collapse minimap
- Collectible dots (hidden when collected)
- Visited building glow effect

```text
START: Polish & Juice complete
DO:
1. Create src/components/UI/Minimap.tsx: ✅
   - Fixed position overlay (bottom-left corner) ✅
   - Circular shape with glowing orange border ✅
   - Semi-transparent dark gradient background ✅

2. Implement Canvas 2D rendering: ✅ (Changed from Drei View for performance)
   - HTML Canvas instead of secondary WebGL context ✅
   - 30fps frame limiting via requestAnimationFrame ✅
   - Circular clipping for clean edges ✅

3. Add map elements: ✅
   - Player marker (🛺 emoji at center) ✅
   - Building icons (emojis with colored background circles) ✅
   - Collectible markers (pulsing colored dots) ✅
   - Reset zone marker (🔄) ✅

4. Real-time position sync: ✅
   - Subscribe to gameStore player.position via refs ✅
   - GTA-style rotating map (player always faces up) ✅
   - N/E/S/W compass rotates with player heading ✅

5. Interactive features: ✅
   - M key to toggle expanded/collapsed size ✅
   - Click-to-pan: DEFERRED
   - Hover tooltips: DEFERRED

END: Users can navigate the world with spatial awareness ✅
TEST:
- Minimap renders without FPS drop ✅
- Player marker moves in real-time with Bajaj ✅
- Compass rotates correctly with vehicle heading ✅
- Buildings visible as emoji icons ✅
- Uncollected items shown, collected hidden ✅
```

### Technical Implementation Notes:

**Drei View Approach:**
```tsx
// Outside Canvas, auto-tunneled into WebGL context
<View className="fixed bottom-4 left-4 w-32 h-32 rounded-lg border-2">
    <OrthographicCamera makeDefault position={[0, 50, 0]} zoom={5} />
    <MinimapContent playerPos={playerPosition} />
</View>
```

**Player Marker:**
```tsx
<mesh position={[playerPos.x, 0.1, playerPos.z]} rotation-y={playerRotation}>
    <circleGeometry args={[0.5]} />
    <meshBasicMaterial color="#ff6b35" />
    {/* Direction arrow */}
    <mesh position={[0, 0.1, -0.3]}>
        <coneGeometry args={[0.2, 0.4, 3]} />
    </mesh>
</mesh>
```

---

## Task 5-Neo.9.1 — SFX Mute Button ✅ COMPLETE

**Purpose:** Allow users to mute/unmute sound effects on both mobile and desktop

**Implementation:**
- Added `toggleSound` action to `gameStore.ts`
- Created `SoundToggle.tsx` component (floating button in top-right)
- Shows 🔊 when sound ON, 🔇 when muted
- Glassmorphism styling matching other UI elements
- Works on both mobile and desktop

```text
START: Minimap complete
DO:
1. Add toggleSound action to gameStore ✅
2. Create SoundToggle.tsx component ✅
3. Create SoundToggle.css with glassmorphism ✅
4. Add to App.tsx UI layer ✅

END: Users can mute/unmute sounds ✅
TEST:
- Button visible in top-right corner ✅
- Shows correct emoji based on state ✅
- Click toggles sound ✅
- Engine sounds respect setting ✅
```

---

## Task 5-Neo.9.2 — Interaction Polish & Lighting ✅ COMPLETE

**Purpose:** Enhanced gameplay mechanics and visual polish

### Features Implemented:

#### 1. SFX Global Mute (Fixed)
- Moved button to **bottom-right** corner (mobile + desktop)
- Added `Howler.mute(!soundEnabled)` to globally mute ALL sounds
- Engine, honk, collectibles, achievements all respect toggle

#### 2. Building Lights (Night Mode)
- SpotLights positioned in FRONT of each building (world coords)
- Uses building rotation to calculate front direction
- Intensity: 50, Distance: 35, Color: #ffcc66
- Only active during night/evening

#### 3. Parking Mechanics
- Created `ParkingZone.tsx` component (pulsing "P" markers)
- Added `parkingPos` to `BUILDINGS_CONFIG`
- Added `parkedAt: string | null` to gameStore
- Vehicle detects parking when stopped (speed < 0.5) within 3-unit radius
- Building entry requires being parked at that building's zone
- Cursor changes to `not-allowed` when hovering unparked building

#### 4. TransJakarta Headlights
- Dual spheres at [-1.275, -1.1, 4.5] / [+1.275, -1.1, 4.5]
- Spotlight intensity 15 (vs Bajaj's 8) for larger vehicle
- Tooltip gap reduced from 8 to 6.5

#### 5. Street Lamps 3x Brighter
- PointLight intensity: 15 → 45
- Distance: 55 → 75
- Diamond emissive: 55 → 100

#### 6. Dynamic Sky Textures
- `day-sky.webp` for day/evening + Jakarta Sky easter egg
- `night-sky.webp` (aurora) for night + Jakarta Sky easter egg
- Jakarta Sky now unlocks at ANY time of day (not just day)

```text
START: Task 5-Neo.9.1 complete
DO:
1. Fix SFX button position (bottom-right) ✅
2. Add Howler.mute() for global sound control ✅
3. Create ParkingZone component ✅
4. Add parking detection to Bajaj.tsx ✅
5. Restrict building entry to parked players ✅
6. Add SpotLights to Building.tsx (night only) ✅
7. Increase lamppost intensity 3x ✅
8. Add TransJakarta headlights ✅
9. Create Sky.tsx with day/night textures ✅
10. Fix Jakarta Sky unlock condition ✅

END: Polished gameplay with immersive lighting ✅
TEST:
- SFX button in bottom-right on mobile ✅
- Mute stops ALL sounds including engine ✅
- Parking zones visible near buildings ✅
- Cannot enter building unless parked ✅
- Buildings light up at night ✅
- Aurora sky shows at night with easter egg ✅
```

---

## Task 5-Neo.10 — Convex Backend Integration ✅ COMPLETE

**Purpose:** Cross-device progress sync + Global leaderboard (single-player, no multiplayer)

**Why Convex over localStorage:**
- Cross-device sync (phone → desktop)
- Global leaderboard persistence
- 1M free function calls/month (plenty for portfolio)
- Type-safe with React integration

### Implemented Features:
- ✅ Convex schema with players + leaderboard tables
- ✅ Progress sync mutations (syncProgress, getProgress)
- ✅ Leaderboard mutations (submitScore, getTopScores, getPlayerScore)
- ✅ ConvexSyncProvider for bidirectional state sync
- ✅ useConvexSync hook with debounced uploads
- ✅ useVisitorId hook (FingerprintJS + fallback)
- ✅ Leaderboard.tsx UI in Journal modal
- ✅ LeaderboardBillboard.tsx (in-world 3D display)
- ✅ SpeedrunZone.tsx trigger area
- ✅ SpeedrunRings.tsx (10 isolated rings)
- ✅ SpeedrunOverlay.tsx (initials, countdown, timer, completion)
- ✅ Graphics quality settings (Low/High toggle)
- ✅ AI code review fixes (3 rounds, 17+ issues resolved)

```text
START: Minimap complete, localStorage working
DO:
PHASE 1 - Setup:
1. Install Convex: npm install convex ✅
2. Initialize project: npx convex init ✅
3. Create .env with CONVEX_DEPLOYMENT ✅
4. Add ConvexProvider to App.tsx ✅

PHASE 2 - Schema Design:
5. Create convex/schema.ts: ✅
   - players: { visitorId, collectibles[], achievements[], lastSeen }
   - leaderboard: { visitorId, nickname, speedRunTime, completionPercent }

PHASE 3 - Progress Sync:
6. Create convex/progress.ts mutations: ✅
   - syncProgress(visitorId, collectibles, achievements)
   - getProgress(visitorId) → returns saved state
7. Modify collectibleStore.ts: ✅
   - On collect: call syncProgress mutation
   - On load: query getProgress, merge with local
8. Same for achievementStore.ts ✅

PHASE 4 - Leaderboard:
9. Create convex/leaderboard.ts: ✅
   - submitScore(visitorId, nickname, time, percent)
   - getTopScores(limit: 10) → sorted by time
10. Create src/components/UI/Leaderboard.tsx: ✅
    - Shows top 10 speed run times
    - Submit score on 100% completion
    - Accessible from Journal modal

PHASE 5 - Visitor Identity:
11. Generate anonymous visitorId on first visit ✅
12. Store in localStorage (survives refresh) ✅
13. Optional: prompt for nickname on leaderboard submit ✅

END: Progress syncs across devices, global leaderboard live ✅
TEST:
- Collect item on desktop, refresh on phone → item still collected ✅
- Complete speed run → appears on global leaderboard ✅
- Free tier limits not exceeded (monitor in Convex dashboard) ✅
```

### Convex Schema:
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    visitorId: v.string(),
    collectibles: v.array(v.string()),
    achievements: v.array(v.string()),
    visitedBuildings: v.array(v.string()),
    lastSeen: v.number(),
  }).index("by_visitor", ["visitorId"]),

  leaderboard: defineTable({
    visitorId: v.string(),
    nickname: v.string(),
    speedRunTime: v.number(), // milliseconds
    completionPercent: v.number(),
    submittedAt: v.number(),
  }).index("by_time", ["speedRunTime"]),
});
```

---

## 🚦 Phase 5-Neo Gate Checklist

Before proceeding to Phase 6 (Deployment):

- [ ] Lighthouse Mobile Performance >85
- [ ] Bundle size <3MB gzipped
- [ ] Mobile FPS >30 consistent
- [ ] Draw calls <100
- [ ] All 5 buildings interactive
- [ ] 15+ collectibles placed
- [ ] 5+ achievements implemented
- [ ] 3+ Easter eggs hidden
- [ ] Onboarding complete
- [ ] Progress HUD working
- [ ] No console errors
- [ ] PostHog tracking all events
- [ ] Sentry has no unhandled errors
- [ ] Tested on real mobile device
- [ ] Session duration >2 minutes in testing

---

## 📁 New File Structure After Phase 5-Neo

```
src/
├── components/
│   ├── Collectibles/
│   │   ├── Collectible.tsx
│   │   └── CollectibleManager.tsx
│   ├── Scene/
│   │   ├── StreetProps.tsx
│   │   └── RoadMarkings.tsx
│   ├── UI/
│   │   ├── ProgressHUD.tsx
│   │   ├── JournalModal.tsx
│   │   ├── AchievementToast.tsx
│   │   └── OnboardingOverlay.tsx
│   └── Effects/
│       ├── DustParticles.tsx
│       └── CollectibleSparkle.tsx
├── stores/
│   ├── collectibleStore.ts
│   └── achievementStore.ts
├── data/
│   ├── achievements.ts
│   └── collectibles.ts
└── hooks/
    ├── useAchievements.ts
    └── useParticles.ts
```

---

## 🎨 Visual Reference: Bruno Simon Techniques Applied

| Bruno's Technique | Our Jakarta Adaptation |
|-------------------|----------------------|
| Toy car physics | Bajaj with bounce and drift |
| Collectible letters | Kopi cups and street food |
| Name prominently displayed | "PORTFOLIO" road text |
| Isometric style world | Jakarta street diorama |
| Night mode | Dynamic day/evening/night |
| Sound effects | Engine, honk, ambient traffic |
| Achievement badges | Jakarta-themed achievements |
| Hidden Easter eggs | Konami code, hidden areas |

---

**Next Step:** Begin with Task 5-Neo.1 (Street Environment Props) to create the world foundation.
