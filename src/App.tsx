import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import Interface from "./components/Interface";

const App = () => {
  return (
    <>
      <Canvas
        flat
        shadows
        camera={{
          fov: 50,
          near: 0.1,
          far: 150,
          position: [0, 4, 33],
        }}
      >
        <Experience />
      </Canvas>
      <Interface />
    </>
  );
};

export default App;
