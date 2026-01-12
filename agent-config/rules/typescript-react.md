# TypeScript & React Best Practices

## TypeScript Configuration
- Always use TypeScript strict mode (`"strict": true` in tsconfig.json)
- Prefer `interface` over `type` for object shapes
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` with type guards if type is truly unknown
- Use `as const` for literal type inference

## React Best Practices
- Use functional components with TypeScript
- Prefer named exports over default exports
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passing to child components
- Use `React.memo()` for components that don't need frequent re-renders
- Always provide meaningful `key` props in lists (never use index as key)

## Bundle Size Optimization
- Prefer tree-shakeable imports: `import { specific } from 'lib'` not `import * as lib`
- Lazy load components with `React.lazy()` and `Suspense`
- Use dynamic imports for heavy dependencies
- Prefer smaller alternatives (e.g., `zustand` over `redux`)

## Code Quality
- Always add JSDoc comments for exported functions and components
- Use descriptive variable and function names
- Maximum file length: 200 lines (refactor if larger)
- One component per file
