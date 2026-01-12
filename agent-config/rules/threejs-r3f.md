# Three.js & React Three Fiber Best Practices

## React Three Fiber Guidelines
- Prefer `@react-three/drei` abstractions over raw Three.js when available
- Use `useGLTF` for loading 3D models (with preload)
- Use `useTexture` for loading textures
- Wrap models in `React.memo()` when they don't change

## Performance Optimization
- Use instancing for repeated objects (`<Instances>` from drei)
- Use LOD (Level of Detail) for distant objects
- Limit draw calls by combining geometries where possible
- Use Draco compression for GLB files
- Keep polygon count under 10k per building, 5k per vehicle

## Physics (Cannon.js)
- Use `@react-three/cannon` for physics
- Use Static bodies for buildings (no need for RigidBody)
- Apply forces with `api.applyForce()` not position mutation
- Use torque for turning: `api.applyTorque()`
- Add damping to prevent sliding: `linearDamping: 0.5`

## Camera
- Smooth camera follow with lerp (factor 0.1)
- Top-down camera at height 15 units
- Always use `camera.lookAt(player.position)`

## Common Patterns
```tsx
// Preload models
useGLTF.preload('/models/building.glb')

// Proper force application for vehicle
api.applyForce([0, 0, -engineForce], [0, 0, 0])
api.applyTorque([0, steerTorque, 0])
```
