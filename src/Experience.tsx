import { Grid, OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import FireArea from "./components/FireArea";
import Yamamoto from "./components/Yamamoto";
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
        maxDistance={100}
        minDistance={10}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      {/* <color attach="background" args={["black"]} /> */}
      {/* <Grid
        position={[0, -0.01, 0]}
        args={[10.5, 10.5]}
        cellColor="#F1F1F1"
        sectionColor="#F8F8F8"
        infiniteGrid
        fadeStrength={10}
      /> */}
      <FireArea />
      <Yamamoto />
      {/* <Fire scale={3} particleScale={0.9} intensity={1.7} /> */}
    </>
  );
};

export default Experience;
