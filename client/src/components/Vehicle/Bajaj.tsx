/**
 * Bajaj vehicle component with realistic controls
 * Engine must be ON to move, turning requires forward speed
 * OPTIMIZED: Throttled state updates to prevent jitter
 * EASTER EGGS: Konami swaps to TransJakarta, Honk wheelie
 * @module components/Vehicle/Bajaj
 */

import { memo, useRef, useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Object3D, Mesh } from 'three';
import type { Group } from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameStore } from '../../stores/gameStore';
import { getEasterEggState, subscribeToEasterEggs } from '../../hooks/useEasterEggs';
import { BUILDINGS_CONFIG } from '../Buildings/Buildings';

// Preload both vehicle models
useGLTF.preload('/models/vehicles/bajaj.glb');
useGLTF.preload('/models/vehicles/TJ.glb');

// Movement constants
const MOVE_SPEED = 12;
const REVERSE_SPEED = 6;
const BOOST_MULTIPLIER = 1.5;
const TURN_SPEED = 2.5;
const MIN_TURN_SPEED = 3;

// Throttle constants
const POSITION_UPDATE_INTERVAL = 100;
const POSITION_CHANGE_THRESHOLD = 0.1;
const SPEED_UPDATE_INTERVAL = 200;

// Wheelie animation constants
const WHEELIE_MAX_TILT = 0.35; // ~20 degrees in radians
const WHEELIE_DURATION = 1500; // ms

// Geometry constants - prevent recreation
const PHYSICS_BOX_ARGS = [2, 2, 3];
const HEADLIGHT_SPHERE_ARGS = [0.15, 12, 12];
const TJ_HEADLIGHT_SPHERE_ARGS = [0.09, 12, 12];
const HEADLIGHT_CYLINDER_ARGS = [0.2, 0.15, 0.25, 12];

/**
 * Hook to subscribe to easter egg state changes
 */
function useEasterEggState() {
  return useSyncExternalStore(subscribeToEasterEggs, getEasterEggState, getEasterEggState);
}

/**
 * Bajaj vehicle with realistic controls:
 * - E: Toggle engine
 * - W/S: Forward/Reverse (engine must be ON)
 * - A/D: Turn (requires movement speed)
 * - Shift: Boost
 * 
 * Easter Eggs:
 * - Konami Code: Swap to TransJakarta
 * - Honk 5x: Wheelie animation
 */
export const Bajaj = memo(function Bajaj() {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setPlayerRotation = useGameStore((state) => state.setPlayerRotation);
  const setPlayerSpeed = useGameStore((state) => state.setPlayerSpeed);
  const setBoosting = useGameStore((state) => state.setBoosting);
  const setParkedAt = useGameStore((state) => state.setParkedAt); // Add setParkedAt
  const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
  const engineOn = useGameStore((state) => state.vehicle.engineOn);

  // Easter egg state
  const easterEggState = useEasterEggState();
  const isTransJakarta = easterEggState.vehicleSwapped;
  const isWheelie = easterEggState.wheelieActive;
  const wheelieStartTime = easterEggState.wheelieStartTime;

  const keyboard = useKeyboard();
  const rotationY = useRef(0);
  const modelRef = useRef<Group>(null);
  const [yOffset, setYOffset] = useState(0);
  const currentSpeed = useRef(0);
  const lastParkedAt = useRef<string | null>(null); // Track last parked state to avoid redundant updates

  // Spotlight target ref
  const spotlightTargetRef = useRef<Object3D>(null);

  // Throttling refs
  const lastPositionUpdate = useRef({ time: 0, pos: [0, 0, 0] as [number, number, number] });
  const lastSpeedUpdate = useRef({ time: 0, speed: 0 });

  // Load both vehicle models
  const bajajModel = useGLTF('/models/vehicles/bajaj.glb');
  const tjModel = useGLTF('/models/vehicles/TJ.glb');

  // Select current model and memoize clone to prevent new objects every render
  const currentScene = isTransJakarta ? tjModel.scene : bajajModel.scene;
  const clonedScene = useMemo(() => currentScene.clone(), [currentScene]);

  // NOTE: We intentionally do NOT dispose clonedScene geometry/materials
  // because clone() shares references with the cached useGLTF models.
  // Disposing would corrupt the original cached models.

  // Calculate Y offset from ORIGINAL unscaled scene (not clonedScene which gets scaled)
  // This prevents compounding errors when swapping vehicles
  useEffect(() => {
    // Use the original scene for bounding box to avoid scale accumulation
    const box = new Box3().setFromObject(currentScene);
    const minY = box.min.y;
    const scaleFactor = isTransJakarta ? 5 : 3;
    // Offset = how much to lift the model so its bottom sits at ground level
    const offset = -minY * scaleFactor;
    setYOffset(offset);
    console.log(`[Vehicle] ${isTransJakarta ? 'TransJakarta' : 'Bajaj'}: originalMinY=${minY.toFixed(2)}, scale=${scaleFactor}, offset=${offset.toFixed(2)}`);
  }, [currentScene, isTransJakarta]);

  // Physics body
  const [physicsRef, api] = useBox<Mesh>(() => ({
    mass: 1,
    args: [2, 2, 3],
    position: [0, 1.5, 0],
    angularFactor: [0, 0, 0],
    linearDamping: 0.5,
    allowSleep: false,
  }));

  // Track position via ref (no re-renders)
  const position = useRef<[number, number, number]>([0, 1.5, 0]);
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      position.current = p as [number, number, number];
    });
    return () => unsubscribe();
  }, [api.position]);

  useFrame((_, delta) => {
    const [px, py, pz] = position.current;
    const now = performance.now();

    // Throttled position update
    const dx = Math.abs(px - lastPositionUpdate.current.pos[0]);
    const dz = Math.abs(pz - lastPositionUpdate.current.pos[2]);
    const timeSinceLastUpdate = now - lastPositionUpdate.current.time;

    if (timeSinceLastUpdate > POSITION_UPDATE_INTERVAL || dx > POSITION_CHANGE_THRESHOLD || dz > POSITION_CHANGE_THRESHOLD) {
      setPlayerPosition({ x: px, y: py, z: pz });
      setPlayerRotation(rotationY.current);
      lastPositionUpdate.current = { time: now, pos: [px, py, pz] };

      // Check parking spots (simple distance check)
      let foundParking: string | null = null;
      // Only allow parking if speed is very low (stopped)
      if (Math.abs(currentSpeed.current) < 0.5) {
        for (const building of BUILDINGS_CONFIG) {
          const [bx, _, bz] = building.parkingPos;
          const dist = Math.sqrt(Math.pow(px - bx, 2) + Math.pow(pz - bz, 2));
          // Radius 3 units for parking
          if (dist < 3) {
            foundParking = building.id;
            break;
          }
        }
      }
      // Only update store if parking state changed
      if (foundParking !== lastParkedAt.current) {
        lastParkedAt.current = foundParking;
        setParkedAt(foundParking);
      }
    }

    const absSpeed = Math.abs(currentSpeed.current);
    const isReversing = currentSpeed.current < 0;

    // Turning when moving
    if (absSpeed > MIN_TURN_SPEED) {
      const turnRate = TURN_SPEED * (absSpeed / MOVE_SPEED);
      const steerDirection = isReversing ? -1 : 1;

      if (keyboard.left) rotationY.current += turnRate * delta * steerDirection;
      if (keyboard.right) rotationY.current -= turnRate * delta * steerDirection;
    }

    api.rotation.set(0, rotationY.current, 0);

    // Calculate wheelie tilt (use typeof to prevent NaN if wheelieStartTime is truthy but not a number)
    let wheelieTilt = 0;
    if (isWheelie && typeof wheelieStartTime === 'number') {
      const elapsed = Date.now() - wheelieStartTime;
      // Clamp progress to [0, 1] to prevent unexpected behavior
      const progress = Math.min(elapsed / WHEELIE_DURATION, 1.0);

      if (progress < 0.2) {
        // Tilt up (0-20%)
        wheelieTilt = WHEELIE_MAX_TILT * (progress / 0.2);
      } else if (progress < 0.8) {
        // Hold (20-80%)
        wheelieTilt = WHEELIE_MAX_TILT;
      } else if (progress < 1.0) {
        // Tilt down (80-100%)
        wheelieTilt = WHEELIE_MAX_TILT * (1 - (progress - 0.8) / 0.2);
      }
      // When progress >= 1.0, wheelieTilt remains 0 (animation complete)
    }

    // Update model position with wheelie tilt
    // TransJakarta needs extra Y offset due to different model origin
    const vehicleYOffset = isTransJakarta ? yOffset + 0.2 : yOffset + 0.5;
    if (modelRef.current) {
      modelRef.current.position.set(px, vehicleYOffset, pz);
      modelRef.current.rotation.set(-wheelieTilt, rotationY.current + Math.PI, 0);
    }

    // Movement direction
    const forwardX = -Math.sin(rotationY.current);
    const forwardZ = -Math.cos(rotationY.current);

    let targetSpeed = 0;
    let velocityX = 0;
    let velocityZ = 0;
    let shouldBoost = false;

    if (engineOn) {
      if (keyboard.forward) {
        let speed = MOVE_SPEED;

        if (keyboard.boost) {
          speed *= BOOST_MULTIPLIER;
          shouldBoost = true;
        }

        velocityX = forwardX * speed;
        velocityZ = forwardZ * speed;
        targetSpeed = speed;
      } else if (keyboard.backward) {
        velocityX = -forwardX * REVERSE_SPEED;
        velocityZ = -forwardZ * REVERSE_SPEED;
        targetSpeed = -REVERSE_SPEED;
      }
    }

    if (shouldBoost && !isBoosting) {
      setBoosting(true);
    } else if (!shouldBoost && isBoosting) {
      setBoosting(false);
    }

    currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.1;

    api.velocity.set(velocityX, 0, velocityZ);

    // Throttled speed update
    const speedTimeSinceUpdate = now - lastSpeedUpdate.current.time;
    const speedChanged = Math.abs(Math.abs(currentSpeed.current) - lastSpeedUpdate.current.speed) > 0.5;

    if (speedTimeSinceUpdate > SPEED_UPDATE_INTERVAL || speedChanged) {
      setPlayerSpeed(Math.abs(currentSpeed.current));
      lastSpeedUpdate.current = { time: now, speed: Math.abs(currentSpeed.current) };
    }
  });

  const showControls = useGameStore((state) => state.showControlsTooltip);
  const headlightsOn = useGameStore((state) => state.vehicle.headlightsOn);

  const handleClick = () => {
    showControls();
  };

  return (
    <>
      {/* Invisible physics box */}
      <mesh ref={physicsRef} visible={false}>
        <boxGeometry args={PHYSICS_BOX_ARGS as any} />
      </mesh>

      {/* Visible 3D model */}
      <group
        ref={modelRef}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <primitive
          object={clonedScene}
          scale={isTransJakarta ? 5 : 3}
        />

        {/* Headlights for both vehicles */}
        <>
          {/* Physical headlight meshes (different positions for TJ vs Bajaj) */}
          {/* Bajaj Mesh */}
          {!isTransJakarta && (
            <mesh position={[0.01, -0.53, 2.8]}>
              <sphereGeometry args={HEADLIGHT_SPHERE_ARGS as any} />
              <meshStandardMaterial
                color={headlightsOn ? "#ffffcc" : "#696666"}
                emissive={headlightsOn ? "#ffff00" : "#bebdbd"}
                emissiveIntensity={headlightsOn ? 7 : 0}
              />
            </mesh>
          )}

          {/* TransJakarta Mesh - BRIGHT front headlight bar */}
          {isTransJakarta && (
            <>
              {/* Left headlight */}
               <mesh position={[-1.275, -1.1, 4.5]}>
                 <sphereGeometry args={TJ_HEADLIGHT_SPHERE_ARGS as any} />
                <meshStandardMaterial
                  color={headlightsOn ? "#ffffcc" : "#696666"}
                  emissive={headlightsOn ? "#ffff00" : "#bebdbd"}
                  emissiveIntensity={headlightsOn ? 15 : 0}
                />
              </mesh>
              {/* Right headlight */}
              <mesh position={[1.275, -1.1, 4.5]}>
                <sphereGeometry args={TJ_HEADLIGHT_SPHERE_ARGS as any} />
                <meshStandardMaterial
                  color={headlightsOn ? "#ffffcc" : "#696666"}
                  emissive={headlightsOn ? "#ffff00" : "#bebdbd"}
                  emissiveIntensity={headlightsOn ? 15 : 0}
                />
              </mesh>
            </>
          )}

          {!isTransJakarta && (
            <mesh position={[0.01, -0.53, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={HEADLIGHT_CYLINDER_ARGS as any} />
              <meshStandardMaterial color="#c4c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          )}

          {headlightsOn && (
            <>
              <object3D
                ref={spotlightTargetRef}
                position={[0, -5, 15]}
              />

              <spotLight
                ref={(spot) => {
                  if (spot && spotlightTargetRef.current) {
                    spot.target = spotlightTargetRef.current;
                  }
                }}
                position={isTransJakarta ? [0, 1.5, 5.5] : [0, -0.53, 2.8]}
                angle={isTransJakarta ? 0.6 : 0.5}
                penumbra={0.8}
                intensity={isTransJakarta ? 15 : 8}
                distance={isTransJakarta ? 30 : 20}
                color="#fffee0"
                castShadow
                shadow-mapSize-width={256}
                shadow-mapSize-height={256}
              />

              <spotLight
                ref={(spot) => {
                  if (spot && spotlightTargetRef.current) {
                    spot.target = spotlightTargetRef.current;
                  }
                }}
                position={isTransJakarta ? [0, 1.5, 5.5] : [0, -0.53, 2.8]}
                angle={isTransJakarta ? 0.9 : 0.8}
                penumbra={0.8}
                intensity={isTransJakarta ? 12 : 6}
                distance={isTransJakarta ? 35 : 25}
                color="#fffee0"
                castShadow={false}
              />
            </>
          )}
        </>
      </group>
    </>
  );
});
