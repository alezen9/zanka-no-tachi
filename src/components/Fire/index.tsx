import GpgpuFire from "./GpgpuFire";
import { useState } from "react";
import { createFireSharedBufferGeometryAndPositions } from "./helpers";

const PARTICLES_COUNT = 5000;
const PARTICLE_SCALE = 1200;

const { geometry, initialPositionsAndSize } =
  createFireSharedBufferGeometryAndPositions(PARTICLES_COUNT, PARTICLE_SCALE);

const Fire = () => {
  const [isBankaiActive, setIsBankaiActive] = useState(false);

  const onBankai = () => {
    setIsBankaiActive(true);
  };

  const onShikai = () => {
    setIsBankaiActive(false);
  };

  return (
    <>
      <mesh position={[0, 3, 0]}>
        <boxGeometry />
        <meshBasicMaterial color="blue" />
      </mesh>
      <group position={[-1, 0, 1]}>
        <mesh onClick={onShikai}>
          <planeGeometry />
          <meshBasicMaterial color="orange" />
        </mesh>
        <mesh onClick={onBankai} position-x={2}>
          <planeGeometry />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
      <group scale={[5, 6, 5]} position-y={-1}>
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[0, 0, -3.5]}
          scale={[2, 1.2, 1]}
        />

        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[-1, 0, -2.5]}
          scale={[1.5, 1.05, 1.5]}
        />
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[-2, 0, -1.5]}
          scale={[1, 0.9, 1]}
        />
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[-3, 0, -0.5]}
          scale={[1, 0.6, 2]}
        />

        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[1, 0, -2.5]}
          scale={[1.5, 1.05, 1.5]}
        />
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[2, 0, -1.5]}
          scale={[1, 0.9, 1]}
        />
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          position={[3, 0, -0.5]}
          scale={[1, 0.6, 2]}
        />
      </group>
    </>
  );
};

export default Fire;
