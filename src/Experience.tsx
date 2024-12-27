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
        // minDistance={6.5}
        // enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      <Scene position-y={-3} />
      {/* <fog attach="fog" color="black" near={20} far={150} /> */}
      {/* <Sky inclination={0} rayleigh={0.35} turbidity={0} /> */}
    </>
  );
};

export default Experience;
