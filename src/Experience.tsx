import { Grid, OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import Fire from "./components/Fire";

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
        maxDistance={50}
        minDistance={3}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0}
      />
      <Grid
        position={[0, -0.01, 0]}
        args={[10.5, 10.5]}
        cellColor="#6f6f6f"
        sectionColor="#9d4b4b"
        infiniteGrid
        fadeStrength={10}
      />
      <Fire />
    </>
  );
};

export default Experience;
