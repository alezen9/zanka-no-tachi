import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Scene from "./components/Scene";
import { useState } from "react";

const Experience = () => {
  const [isDebug] = useState(() => window.location.hash === "#debug");

  return (
    <>
      {isDebug && <Perf position="top-left" />}
      <OrbitControls
        makeDefault
        enableDamping
        maxDistance={60}
        minDistance={6.5}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      <Scene position-y={-3} />
    </>
  );
};

export default Experience;
