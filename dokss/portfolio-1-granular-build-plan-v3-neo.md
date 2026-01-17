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

## Task 5-Neo.5 — Achievement System

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

## Task 5-Neo.6 — Easter Eggs

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

## Task 5-Neo.7 — Performance Optimization Pass

**Critical:** Must hit Lighthouse >85 mobile

**Risk Mitigations Added:**
- Self-hosted Draco decoders (no Google CDN dependency)
- WebGL context loss recovery handlers
- Progressive enhancement with device detection
- Rollback procedure documented

```
START: All features complete
DO:
PHASE 1 - Safety Infrastructure:
1. Copy Draco decoders to public/draco/ (self-hosted)
2. Create src/lib/dracoLoader.ts with error handling
3. Create src/hooks/useContextRecovery.ts for WebGL crash recovery

PHASE 2 - Model Optimization (~98MB → <5MB):
4. Install gltf-pipeline globally
5. Draco compress all 7 GLB files (buildings + vehicles)
6. Keep original models as backup until verified
7. Update useGLTF calls to use Draco loader

PHASE 3 - Mobile Optimizations:
8. Add mobile detection in App.tsx
9. Disable shadows on low-end devices
10. Cap DPR at 1.5 on mobile
11. Reduce shadow map 2048→1024 (512 on mobile)
12. Disable antialiasing on mobile

PHASE 4 - Bundle Optimization:
13. Split three.js chunks in vite.config.ts
14. Run build and analyze bundle

PHASE 5 - Verification:
15. Run Lighthouse audit (target >85)
16. Test on real mobile device (>30 FPS)
17. Test WebGL context loss/recovery
18. Verify no console errors across browsers

END: Lighthouse mobile >85, robust across devices
TEST:
- Run Lighthouse 3 times, average >85
- Test on real mobile device: >30 FPS
- Bundle gzipped <3MB
- Test context loss recovery
- Verify on iOS Safari, Samsung Internet
```

---

## Task 5-Neo.8 — Polish & Juice

**Feel:** Make every interaction satisfying

```
START: Performance optimized
DO:
1. Particle Effects:
   - Dust when driving (small particles behind wheels)
   - Sparkle on collectible pickup
   - Confetti on achievement

2. Camera Juice:
   - Subtle shake on boost activation
   - Smooth transition on building enter/exit
   - Slight zoom on collectible pickup

3. Sound Polish:
   - Ambient Jakarta sounds (distant traffic, birds)
   - Building hover sound (subtle)
   - Achievement unlock fanfare
   - Collectible pickup "ding"

4. Animation Polish:
   - Building hover scale (already done)
   - Collectible bounce/spin
   - HUD number count-up animation
   - Button hover effects

5. Loading Experience:
   - Animated loading bar
   - Jakarta skyline silhouette
   - Loading tips/facts about Jakarta

END: Every interaction feels premium
TEST:
- Play through entire experience
- Note any interaction that feels "flat"
- Each interaction should have feedback
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
