import { useRef } from "react";
import Fire from "../Fire";
import useGPGPU from "./useGPGPU";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";

const totalParticleCount = 2500 * 7;

const FireArea = () => {
  const groupRef = useRef<Group>(null);
  const { animationState, initializeStartingPositions, computeSimulation } =
    useGPGPU({ totalParticleCount });

  const onClick = (e) => {
    e.stopPropagation();

    // Capture current positions and initialize
    const initialPositions = new Float32Array(totalParticleCount * 4); // Example setup
    for (let i = 0; i < totalParticleCount; i++) {
      initialPositions[i * 4] = Math.random(); // X
      initialPositions[i * 4 + 1] = Math.random(); // Y
      initialPositions[i * 4 + 2] = Math.random(); // Z
      initialPositions[i * 4 + 3] = 1.0; // W (optional, e.g., for velocity)
    }
    initializeStartingPositions(initialPositions);
  };

  useFrame(({ clock }) => {
    if (animationState !== "animating") return;
    const time = clock.getElapsedTime();
    const texture = computeSimulation(time); // 1 = converging phase
    console.log(texture);
    // Pass `texture` to your particle shader
  });

  return (
    <group ref={groupRef} scale={[5, 6, 5]} position-y={-1} onClick={onClick}>
      <Fire position={[0, 0, -3.5]} scale={[2, 1.2, 1]} particleScale={3.5} />

      <Fire
        position={[-1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <Fire position={[-2, 0, -1.5]} scale={[1, 0.9, 1]} particleScale={3} />
      <Fire position={[-3, 0, -0.5]} scale={[1, 0.6, 2]} particleScale={2.5} />

      <Fire
        position={[1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <Fire position={[2, 0, -1.5]} scale={[1, 0.9, 1]} particleScale={3} />
      <Fire position={[3, 0, -0.5]} scale={[1, 0.6, 2]} particleScale={2.5} />
    </group>
  );
};

export default FireArea;
