---
description: Generate a new React component with TypeScript, test file, and proper structure
---

# Component Scaffolder Workflow

This workflow generates a complete React component with all supporting files.

## Usage
Specify the component name and type when running this workflow.

## Steps

### 1. Determine Component Type
- **3D Component**: For Three.js/R3F components (buildings, vehicles, scene elements)
- **UI Component**: For 2D UI overlays (modals, HUD, controls)
- **Hook**: For custom React hooks

### 2. Create Component Directory
```bash
mkdir -p src/components/{ComponentName}
```

### 3. Generate Component File
Create `src/components/{ComponentName}/{ComponentName}.tsx`:

For 3D components:
```tsx
import { memo } from 'react';
import { useGLTF } from '@react-three/drei';

interface {ComponentName}Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * {ComponentName} - Description of the component
 * @param position - World position [x, y, z]
 * @param rotation - Euler rotation [x, y, z]
 */
export const {ComponentName} = memo(function {ComponentName}({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {ComponentName}Props) {
  return (
    <group position={position} rotation={rotation}>
      {/* Component content */}
    </group>
  );
});
```

For UI components:
```tsx
import { memo } from 'react';
import styles from './{ComponentName}.module.css';

interface {ComponentName}Props {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * {ComponentName} - Description of the component
 */
export const {ComponentName} = memo(function {ComponentName}({
  isOpen = false,
  onClose,
}: {ComponentName}Props) {
  if (!isOpen) return null;
  
  return (
    <div className={styles.container}>
      {/* Component content */}
      <button onClick={onClose}>Close</button>
    </div>
  );
});
```

### 4. Generate CSS Module (for UI components)
Create `src/components/{ComponentName}/{ComponentName}.module.css`:
```css
.container {
  /* Component styles */
}
```

### 5. Generate Test File
Create `src/components/{ComponentName}/{ComponentName}.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('renders without crashing', () => {
    render(<{ComponentName} />);
    // Add specific assertions
  });
});
```

### 6. Generate Index Export
Create `src/components/{ComponentName}/index.ts`:
```ts
export * from './{ComponentName}';
```

### 7. Update Parent Index (if exists)
Add export to `src/components/index.ts`:
```ts
export * from './{ComponentName}';
```
