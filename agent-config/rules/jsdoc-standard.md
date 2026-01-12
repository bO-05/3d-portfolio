# JSDoc Documentation Standard

## All Exported Functions Must Have JSDoc
```typescript
/**
 * Updates the player position in the game store.
 * @param position - The new position vector { x, y, z }
 * @returns void
 */
export function setPlayerPosition(position: Vector3): void {
  // implementation
}
```

## Components Must Have Props Documentation
```typescript
/**
 * Building component that renders a 3D model with collision.
 * @param id - Unique identifier for the building
 * @param position - World position [x, y, z]
 * @param onClick - Callback when building is clicked
 */
interface BuildingProps {
  id: string;
  position: [number, number, number];
  onClick?: () => void;
}
```

## Hooks Must Document Return Values
```typescript
/**
 * Hook for handling keyboard input.
 * @returns Object with boolean flags for each direction
 * @example
 * const { forward, backward, left, right } = useKeyboard();
 */
export function useKeyboard() {
  // implementation
}
```
