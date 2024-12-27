import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Leva } from "leva";
import { useState } from "react";
import Interface from "./components/Interface";
import { SoftShadows } from "@react-three/drei";

const App = () => {
  const [isDebug] = useState(() => window.location.hash === "#debug");

  return (
    <>
      <div className="leva-wrapper">
        <Leva hidden={!isDebug} />
      </div>
      <Canvas
        flat
        shadows
        camera={{
          fov: 50,
          near: 0.1,
          far: 150,
          position: [0, 0, 12],
        }}
      >
        {/* <SoftShadows samples={10} focus={1} /> */}
        <Experience />
      </Canvas>
      <Interface />
    </>
  );
};

export default App;
