/**
 * Bajaj vehicle component with realistic controls
 * Engine must be ON to move, turning requires forward speed
 * OPTIMIZED: Throttled state updates to prevent jitter
 * @module components/Vehicle/Bajaj
 */

import { memo, useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Object3D } from 'three';
import type { Mesh, Group } from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameStore } from '../../stores/gameStore';

// Preload the model
useGLTF.preload('/models/vehicles/bajaj.glb');

// Movement constants
const MOVE_SPEED = 12;
const REVERSE_SPEED = 6;
const BOOST_MULTIPLIER = 1.5;
const TURN_SPEED = 2.5;
const MIN_TURN_SPEED = 3; // Minimum speed required to turn

// Throttle constants
const POSITION_UPDATE_INTERVAL = 100; // ms between position updates
const POSITION_CHANGE_THRESHOLD = 0.1; // minimum distance to trigger update
const SPEED_UPDATE_INTERVAL = 200; // ms between speed updates

/**
 * Bajaj vehicle with realistic controls:
 * - E: Toggle engine
 * - W/S: Forward/Reverse (engine must be ON)
 * - A/D: Turn (requires movement speed)
 * - Shift: Boost
 */
export const Bajaj = memo(function Bajaj() {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setPlayerSpeed = useGameStore((state) => state.setPlayerSpeed);
  const setBoosting = useGameStore((state) => state.setBoosting);
  const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
  const engineOn = useGameStore((state) => state.vehicle.engineOn);

  const keyboard = useKeyboard();
  const rotationY = useRef(0);
  const modelRef = useRef<Group>(null);
  const [yOffset, setYOffset] = useState(0);
  const currentSpeed = useRef(0);

  // Spotlight target ref - controls light direction
  const spotlightTargetRef = useRef<Object3D>(null);

  // THROTTLING REFS - prevents 60x/second state updates
  const lastPositionUpdate = useRef({ time: 0, pos: [0, 0, 0] as [number, number, number] });
  const lastSpeedUpdate = useRef({ time: 0, speed: 0 });

  // Load the GLB model
  const { scene } = useGLTF('/models/vehicles/bajaj.glb');

  // Calculate Y offset once model is loaded
  useEffect(() => {
    if (modelRef.current) {
      const box = new Box3().setFromObject(modelRef.current);
      const minY = box.min.y;
      const offset = -minY;
      setYOffset(offset);
    }
  }, []);

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

    // THROTTLED POSITION UPDATE
    // Only update React state every 100ms OR when position changes significantly
    const dx = Math.abs(px - lastPositionUpdate.current.pos[0]);
    const dz = Math.abs(pz - lastPositionUpdate.current.pos[2]);
    const timeSinceLastUpdate = now - lastPositionUpdate.current.time;

    if (timeSinceLastUpdate > POSITION_UPDATE_INTERVAL || dx > POSITION_CHANGE_THRESHOLD || dz > POSITION_CHANGE_THRESHOLD) {
      setPlayerPosition({ x: px, y: py, z: pz });
      lastPositionUpdate.current = { time: now, pos: [px, py, pz] };
    }

    // Calculate base speed to determine if turning is allowed
    const absSpeed = Math.abs(currentSpeed.current);
    const isReversing = currentSpeed.current < 0;

    // TURNING: Only allowed when moving above MIN_TURN_SPEED
    if (absSpeed > MIN_TURN_SPEED) {
      // Turn rate scales with speed for natural feel
      const turnRate = TURN_SPEED * (absSpeed / MOVE_SPEED);

      // When reversing, invert steering direction
      // (front wheel steering in reverse turns vehicle opposite way)
      const steerDirection = isReversing ? -1 : 1;

      if (keyboard.left) rotationY.current += turnRate * delta * steerDirection;
      if (keyboard.right) rotationY.current -= turnRate * delta * steerDirection;
    }

    api.rotation.set(0, rotationY.current, 0);

    // Update model position (direct ref mutation, no React state)
    if (modelRef.current) {
      modelRef.current.position.set(px, yOffset + 0.5, pz);
      modelRef.current.rotation.set(0, rotationY.current + Math.PI, 0);
    }

    // Movement direction
    const forwardX = -Math.sin(rotationY.current);
    const forwardZ = -Math.cos(rotationY.current);

    let targetSpeed = 0;
    let velocityX = 0;
    let velocityZ = 0;
    let shouldBoost = false;

    // Only move if engine is ON
    if (engineOn) {
      if (keyboard.forward) {
        let speed = MOVE_SPEED;

        // Apply boost if holding Shift
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

    // GUARDED BOOSTING UPDATE - only when value CHANGES
    if (shouldBoost && !isBoosting) {
      setBoosting(true);
    } else if (!shouldBoost && isBoosting) {
      setBoosting(false);
    }

    // Smooth speed transition
    currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.1;

    api.velocity.set(velocityX, 0, velocityZ);

    // THROTTLED SPEED UPDATE - only every 200ms when changed
    const speedTimeSinceUpdate = now - lastSpeedUpdate.current.time;
    const speedChanged = Math.abs(Math.abs(currentSpeed.current) - lastSpeedUpdate.current.speed) > 0.5;

    if (speedTimeSinceUpdate > SPEED_UPDATE_INTERVAL || speedChanged) {
      setPlayerSpeed(Math.abs(currentSpeed.current));
      lastSpeedUpdate.current = { time: now, speed: Math.abs(currentSpeed.current) };
    }
  });

  // Get showControlsTooltip action from store
  const showControls = useGameStore((state) => state.showControlsTooltip);
  const headlightsOn = useGameStore((state) => state.vehicle.headlightsOn);

  const handleClick = () => {
    showControls();
  };

  return (
    <>
      {/* Invisible physics box */}
      <mesh ref={physicsRef} visible={false}>
        <boxGeometry args={[2, 2, 3]} />
      </mesh>

      {/* Visible 3D model - click to show controls */}
      <group
        ref={modelRef}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <primitive object={scene.clone()} scale={3} />

        {/* 
          HEADLIGHT - on front fender above single front wheel
          Red arrow in user's image shows the exact location
          Need high +Z (far forward) and low Y (wheel level)
        */}

        {/* Headlight bulb - at front wheel fender */}
        <mesh position={[0.01, -0.53, 2.8]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial
            color={headlightsOn ? "#ffffcc" : "#555555"}
            emissive={headlightsOn ? "#ffff00" : "#000000"}
            emissiveIntensity={headlightsOn ? 7 : 0}
          />
        </mesh>

        {/* Housing behind bulb */}
        <mesh position={[0.01, -0.53, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.25, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* 
          HEADLIGHT SPOTLIGHT - uses TARGET to aim forward
          Target position: [0, Y, Z] where:
          - Negative Z = forward (toward front wheel direction)
          - Negative Y = down toward road
          Adjust target position to change light direction!
        */}
        {headlightsOn && (
          <>
            {/* TARGET - where the light points TO */}
            {/* Change this position to adjust light direction */}
            <object3D
              ref={spotlightTargetRef}
              position={[0, -5, 15]}
            />

            {/* Main beam */}
            <spotLight
              ref={(spot) => {
                if (spot && spotlightTargetRef.current) {
                  spot.target = spotlightTargetRef.current;
                }
              }}
              position={[0, -0.53, 2.8]}
              angle={0.5}
              penumbra={0.8}
              intensity={8}
              distance={20}
              color="#fffee0"
              castShadow
              shadow-mapSize-width={256}
              shadow-mapSize-height={256}
            />

            {/* Wide fill beam */}
            <spotLight
              ref={(spot) => {
                if (spot && spotlightTargetRef.current) {
                  spot.target = spotlightTargetRef.current;
                }
              }}
              position={[0, -0.53, 2.8]}
              angle={0.8}
              penumbra={0.8}
              intensity={6}
              distance={25}
              color="#fffee0"
              castShadow={false}
            />
          </>
        )}
      </group>
    </>
  );
});
