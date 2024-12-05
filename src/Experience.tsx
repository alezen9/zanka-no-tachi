import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import FireArea from "./components/FireArea";
import Yamamoto from "./components/Yamamoto";
import GpgpuFire, { GpgpuFireRef } from "./components/GpgpuFire";
import { useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";

const Experience = () => {
  const { isPerformancePanelVisible } = useControls("Monitoring", {
    isPerformancePanelVisible: {
      value: true,
      label: "Show performance",
    },
  });

  const ref = useRef<GpgpuFireRef>(null);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!ref.current) return;
    ref.current.activateBankai();
  };

  return (
    <>
      {isPerformancePanelVisible && <Perf position="top-left" />}
      <OrbitControls
        makeDefault
        enableDamping
        maxDistance={60}
        minDistance={6.5}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      <group position-y={-1}>
        <mesh rotation-x={-Math.PI / 2} scale={100}>
          <planeGeometry />
          <meshStandardMaterial color="#000" />
        </mesh>
        <pointLight color="orange" intensity={500} position={[0, 3, -10]} />
        <pointLight color="orange" intensity={200} position={[-10, 3, -4]} />
        <pointLight color="orange" intensity={200} position={[10, 3, -4]} />
        <FireArea />
        <Yamamoto />
        {/* <group scale={[5, 6, 5]} position-y={-1}>
          <GpgpuFire position={[-2, 0, -1.5]} scale={[1, 0.9, 1]} ref={ref} />
        </group>
        <mesh scale={0.5} position={[2, 1, 0]} onClick={onClick}>
          <planeGeometry />
          <meshBasicMaterial color="white" />
        </mesh> */}
      </group>
    </>
  );
};

export default Experience;
