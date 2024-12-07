import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import GpgpuFireArea from "./components/FireArea";
import Yamamoto from "./components/Yamamoto";

const Experience = () => {
  const { isPerformancePanelVisible } = useControls("Monitoring", {
    isPerformancePanelVisible: {
      value: true,
      label: "Show performance",
    },
  });

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
        <group>
          <pointLight color="orange" intensity={1000} position={[0, 5, -5]} />
          <pointLight color="orange" intensity={200} position={[-7, 3, -1]} />
          <pointLight color="orange" intensity={200} position={[7, 3, -1]} />
          <GpgpuFireArea />
          <Yamamoto />
        </group>
      </group>
    </>
  );
};

export default Experience;
