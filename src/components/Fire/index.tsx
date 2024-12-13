import GpgpuFire from "./GpgpuFire";
import { useRef, useState } from "react";
import audioFile from "/bankai.mp3?url";

const Fire = () => {
  const [isBankaiActive, setIsBankaiActive] = useState(false);
  const audio = useRef(new Audio(audioFile));

  const onBankai = () => {
    if (!audio.current) return;
    setIsBankaiActive(true);
    audio.current.currentTime = 0;
    audio.current.volume = 1;
    audio.current.play();
  };

  const onShikai = () => {
    if (!audio.current) return;
    setIsBankaiActive(false);
    audio.current.pause();
    audio.current.currentTime = 0;
  };

  return (
    <>
      <mesh position={[0, 3, 0]}>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      <group position={[-1, 0, 1]}>
        <mesh onClick={onShikai}>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh onClick={onBankai} position-x={2}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </group>
      <GpgpuFire
        isBankaiActive={isBankaiActive}
        scale={[12, 20, 20]}
        position={[0, -2, 7.5]}
      />
    </>
  );
};

export default Fire;
