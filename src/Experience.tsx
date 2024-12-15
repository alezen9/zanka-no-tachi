import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import Scene from "./components/Scene";

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
      <Scene position-y={-1} />
      {/* <ambientLight intensity={1} color="darkorange" visible={false} />
      <pointLight color="darkorange" intensity={20} position={[0, 10, -8]} /> */}
    </>
  );
};

export default Experience;
