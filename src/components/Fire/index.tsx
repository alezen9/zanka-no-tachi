import GpgpuFire from "./GpgpuFire";
import { useState } from "react";

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
        isBankaiActive={isBankaiActive}
        scale={[12, 18, 20]}
        position={[0, -2, 7.5]}
      />
    </>
  );
};

export default Fire;
