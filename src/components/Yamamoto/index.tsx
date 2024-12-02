import objModel from "/human.obj?url";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/Addons.js";

const scale = 0.1;

const Yamamoto = () => {
  const model = useLoader(OBJLoader, objModel);
  return <primitive object={model} scale={[scale, scale, scale]} />;
};

export default Yamamoto;
