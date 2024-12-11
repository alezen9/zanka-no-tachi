import GpgpuFire from "./GpgpuFire";
import { useEffect, useState } from "react";
import {
  createFireSharedBufferGeometryAndPositions,
  curveObject,
} from "./helpers2";
import { useThree } from "@react-three/fiber";

const PARTICLES_COUNT = 5000 * 15;

const { geometry, initialPositionsAndSize } =
  createFireSharedBufferGeometryAndPositions(PARTICLES_COUNT);

const Fire = () => {
  const [isBankaiActive, setIsBankaiActive] = useState(false);
  const scene = useThree(({ scene }) => scene);

  useEffect(() => {
    scene.add(curveObject);
  }, [scene]);

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
      <group scale={1.25}>
        <GpgpuFire
          geometry={geometry}
          particlesCount={PARTICLES_COUNT}
          initialPositionsAndSize={initialPositionsAndSize}
          isBankaiActive={isBankaiActive}
          scale={[6, 9, 10]}
          position={[0, -2, 7.5]}
        />
      </group>
    </>
  );
};

export default Fire;
