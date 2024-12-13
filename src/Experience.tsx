import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import Yamamoto from "./components/Yamamoto";
import Fire from "./components/Fire";
import FireOriginal from "./components/FireOriginal";

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
          <meshStandardMaterial color={[5, 5, 5]} />
        </mesh>
        <ambientLight intensity={1} color="darkorange" visible={false} />
        <group>
          <pointLight
            color="darkorange"
            intensity={20}
            position={[0, 10, -8]}
          />
          {/* <pointLight
            color="darkorange"
            intensity={10}
            position={[-10, 10, 1]}
          />
          <pointLight
            color="darkorange"
            intensity={10}
            position={[10, 10, 1]}
          /> */}
          <group>
            <Fire />
            <Yamamoto />
          </group>
          {/* <group position-x={-20}>
            <FireOriginal />
            <Yamamoto />
          </group> */}
        </group>
      </group>
    </>
  );
};

export default Experience;
