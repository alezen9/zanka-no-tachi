import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
// import FireArea from "./components/FireArea";
// import Yamamoto from "./components/Yamamoto";
// import Fire from "./components/Fire";
// import FireGPGPU from "./components/FireGPGPU";
// import Ship from "./components/Ship";
import GpgpuFire from "./components/GpgpuFire";

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
        minDistance={0.1}
        enablePan={true}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      <group position-y={-1}>
        <mesh rotation-x={-Math.PI / 2} scale={100}>
          <planeGeometry />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* <pointLight color="orange" intensity={500} position={[0, 3, -10]} />
        <pointLight color="orange" intensity={200} position={[-10, 3, -4]} />
        <pointLight color="orange" intensity={200} position={[10, 3, -4]} />
        <FireArea />
        <Yamamoto /> */}
        {/* <Fire position={[-2, 0, 0]} />
        <FireGPGPU position={[2, 0, 0]} /> */}
        {/* <Ship /> */}
        <GpgpuFire />
        {/* <Particles
          focus={5.1}
          speed={100}
          aperture={1.8}
          fov={20}
          curl={0.25}
        /> */}
      </group>
    </>
  );
};

export default Experience;
