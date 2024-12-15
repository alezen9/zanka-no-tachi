import objModel from "/human.obj?url";
import { useLoader } from "@react-three/fiber";
import { Mesh } from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";

const scale = 0.1;

// Temporary
const Yamamoto = () => {
  const { children } = useLoader(OBJLoader, objModel);
  const geometry = (children[0] as Mesh).geometry;

  return (
    <mesh geometry={geometry} scale={scale}>
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

export default Yamamoto;
