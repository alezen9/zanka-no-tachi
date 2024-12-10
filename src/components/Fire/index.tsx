import GpgpuFire from "./GpgpuFire";
import { useState } from "react";
import { createFireSharedBufferGeometryAndPositions } from "./helpers";

const PARTICLES_COUNT = 5000 * 10;
const PARTICLE_SCALE = 1400;

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
      <GpgpuFire
        geometry={geometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        isBankaiActive={isBankaiActive}
        scale={[8, 11, 12]}
        position={[0, -1.75, 9]}
        rotation-x={0.01}
      />
    </>
  );
};

export default Fire;
