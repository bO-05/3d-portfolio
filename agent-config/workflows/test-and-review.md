---
description: Run tests, check bundle size, and run Lighthouse audit for quality assurance
---

# Test & Review Workflow

This workflow runs comprehensive quality checks on the project.

## Steps

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Type Check
```bash
npm run typecheck
```
This runs TypeScript compiler in noEmit mode to check for type errors.

### 3. Run Unit Tests
```bash
npm run test
```
Runs Vitest test suite. All tests must pass.

### 4. Build Production Bundle
```bash
npm run build
```
Creates optimized production build in `dist/` folder.

// turbo
### 5. Check Bundle Size
```bash
npx vite-bundle-visualizer
```
Opens bundle analysis. Verify:
- Main chunk < 1.5MB
- Three.js vendor chunk < 600KB
- Total assets < 5MB

// turbo
### 6. Run Lighthouse Audit
```bash
npx serve dist -l 4173
```
In another terminal:
```bash
npx lighthouse http://localhost:4173 --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless"
```
Review report. Target scores:
- Performance > 80
- Accessibility > 90
- Best Practices > 90
- SEO > 80

### 7. Check for Console Errors
Open dev tools, navigate the app, ensure no console errors.
