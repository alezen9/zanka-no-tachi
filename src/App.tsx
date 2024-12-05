import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Leva } from "leva";
import { useState } from "react";

const App = () => {
  const [isDebug] = useState(() => window.location.hash === "#debug");

  return (
    <>
      <div className="leva-wrapper">
        <Leva hidden={!isDebug} />
      </div>
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 150,
          position: [0, 0, 12],
        }}
      >
        <Experience />
      </Canvas>
    </>
  );
};

export default App;
