import { useRef } from "react";
// import Fire from "../Fire";
import GpgpuFire, { GpgpuFireRef } from "../GpgpuFire";
import { ThreeEvent } from "@react-three/fiber";
import { Group } from "three";

const FireArea = () => {
  const fireRef = useRef<GpgpuFireRef>(null);
  const groupRef = useRef<Group>(null);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!fireRef.current || !groupRef.current) return;

    groupRef.current.updateMatrixWorld();
    const matrix = groupRef.current.matrixWorld.clone();
    console.log({
      matrix,
      inverted: matrix.invert(),
    });
    fireRef.current.activateBankai(matrix);
  };

  return (
    <group scale={[5, 6, 5]} position-y={-1} ref={groupRef}>
      <mesh scale={0.5} position={[2, 1, 0]} onClick={onClick}>
        <planeGeometry />
        <meshBasicMaterial color="white" />
      </mesh>
      <GpgpuFire
        position={[0, 0, -3.5]}
        scale={[2, 1.2, 1]}
        particleScale={3.5}
      />

      <GpgpuFire
        position={[-1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <GpgpuFire
        position={[-2, 0, -1.5]}
        scale={[1, 0.9, 1]}
        particleScale={3}
      />
      <GpgpuFire
        position={[-3, 0, -0.5]}
        scale={[1, 0.6, 2]}
        particleScale={2.5}
      />

      <GpgpuFire
        position={[1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <GpgpuFire
        position={[2, 0, -1.5]}
        scale={[1, 0.9, 1]}
        particleScale={3}
      />
      <GpgpuFire
        position={[3, 0, -0.5]}
        scale={[1, 0.6, 2]}
        particleScale={2.5}
        ref={fireRef}
      />
    </group>
  );
};

export default FireArea;
