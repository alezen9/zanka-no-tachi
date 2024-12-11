import GpgpuFire from "./GpgpuFire";
import { useState } from "react";
import { createFireSharedBufferGeometryAndPositions } from "./helpers";

const PARTICLES_COUNT = 5000 * 7;
const PARTICLE_SCALE = 200;

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
        <meshStandardMaterial color={[2, 2, 2]} />
      </mesh>
      <group position={[-1, 0, 1]}>
        <mesh onClick={onShikai}>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh onClick={onBankai} position-x={2}>
          <boxGeometry />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
      <GpgpuFire
        geometry={geometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        isBankaiActive={isBankaiActive}
        scale={[9, 20, 13]}
        position={[0, -0.75, 10]}
      />
    </>
  );
};

export default Fire;
