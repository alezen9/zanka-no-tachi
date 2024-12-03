import { useRef } from "react";
// import Fire from "../Fire";
import { Group } from "three";
import GpgpuFire from "../GpgpuFire";

const FireArea = () => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} scale={[5, 6, 5]} position-y={-1}>
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
      />
    </group>
  );
};

export default FireArea;
