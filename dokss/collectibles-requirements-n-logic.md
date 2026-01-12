# Collectibles System — Requirements & Logic

> **Purpose:** This document captures all requirements, integrations, and critical lessons learned for the collectibles system. Reference this before modifying any collectible-related code.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ collectibles.ts │────▶│ CollectibleStore │◀────│ localStorage    │
│ (data: 15)      │     │ (collected Set)  │     │ (persistence)   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│ Collectible   │        │ HiddenBush    │        │ BreakableBox  │
│ (8 visible)   │        │ (3 in bushes) │        │ (4 in boxes)  │
└───────────────┘        └───────────────┘        └───────────────┘
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `data/collectibles.ts` | 15 items, types, positions, containers |
| `stores/collectibleStore.ts` | Zustand store, Sets, localStorage |
| `Collectible.tsx` | Visible floating collectibles |
| `HiddenBush.tsx` | Bush container with inline collectible |
| `BreakableBox.tsx` | Knockable box, uses Collectible component |
| `CollectibleManager.tsx` | Spawns all 15 based on container type |

---

## Store Rules (collectibleStore.ts)

| Requirement | Implementation |
|-------------|----------------|
| O(1) lookup | `Set<string>` not Array |
| No lag on collect | Debounced localStorage (500ms) |
| No lag on tracking | Deferred PostHog via `requestIdleCallback` |
| Reset clears everything | `set({ collected: new Set(), revealedBoxes: new Set() })` |

---

## Component Pattern (CRITICAL)

All collectible components MUST follow this pattern:

```tsx
// ✅ CORRECT
useFrame(() => {
  if (!ref || isCollected) return;  // Only check store state
  
  // Animation...
  
  if (distance < RADIUS && !isCollectingRef.current) {
    isCollectingRef.current = true;
    collect(id);
  }
  
  if (distance >= RADIUS) {
    isCollectingRef.current = false;  // Reset when player leaves
  }
});

if (isCollected) return null;  // Visibility from store only
```

```tsx
// ❌ WRONG - breaks reset
useFrame(() => {
  if (!ref || isCollected || isCollectingRef.current) return;  // Ref blocks after reset!
  ...
});
```

---

## ⚠️ Critical Lessons Learned

### 1. Local State vs Store State
- **useState** persists until component unmounts
- **useRef** persists across renders
- After reset, components re-render but DON'T unmount
- **Solution:** Visibility ONLY from store, refs only guard function calls

### 2. Position Calculations
| Component | Position Used For Distance |
|-----------|---------------------------|
| Collectible | `position` prop (world coordinates) |
| HiddenBush | Bush's `position` prop (NOT [0,0,0]) |
| BreakableBox | Uses Collectible component with world position |

### 3. Function Calls in Selectors
```tsx
// ❌ WRONG - can cause infinite re-render
const isCollected = useCollectibleStore((state) => state.isCollected(id));
const progress = useCollectibleStore((state) => state.getProgress());

// ✅ CORRECT - stable reference
const collected = useCollectibleStore((state) => state.collected);
const isCollected = collected.has(id);
```

### 4. Performance — What Causes Lag
| Cause | Fix |
|-------|-----|
| Physics trigger for collection | Use distance-based detection in useFrame |
| Synchronous localStorage write | Debounce 500ms |
| Synchronous PostHog tracking | Defer with requestIdleCallback |
| Array.includes() for lookup | Use Set.has() — O(1) |
| State updates every frame | Throttle or use refs |

### 5. Visual — What Doesn't Work
| Problem | Fix |
|---------|-----|
| Emoji Text in 3D | Use 3D mesh shapes instead |
| All collectibles look same | Different geometry per type |
| Collectible inside bush at [0,0,0] | Pass world position to child |

---

## Position Exclusion Zones

Do NOT place collectibles within 10 units of buildings:

| Building | Position | Exclusion |
|----------|----------|-----------|
| tech-hub | [-25, 0, 0] | 10 units |
| art-gallery | [-15, 0, 25] | 10 units |
| cafe | [25, 0, -20] | 10 units |
| music-studio | [25, 0, 25] | 10 units |
| warung | [0, 0, -35] | 10 units |
| reset-zone | [0, 0, 8] | 5 units |

Ground boundary: ±50 units

---

## Reset Zone Integration

| Event | Action |
|-------|--------|
| Player enters zone | Show Y/N prompt |
| Player presses Y | `collectibleStore.reset()` |
| Store updated | All components re-render |
| `collected.has(id)` = false | Components render collectibles |
| Player drives away | Refs reset to false |
| Collection works again | ✅ |

---

## Checklist Before Modifying Collectibles

- [ ] Does the component ONLY check store state for visibility?
- [ ] Are refs ONLY used to guard function calls, not early returns?
- [ ] Does the ref reset when conditions change?
- [ ] Is the position used for distance checking the WORLD position?
- [ ] Are you selecting Sets directly, not calling functions?
- [ ] Have you tested reset functionality?
