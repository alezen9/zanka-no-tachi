import { GroupProps } from "@react-three/fiber";
import GpgpuFire from "./GpgpuFire/GpgpuFire";
import Yamamoto from "./Yamamoto/Yamamoto";
import Lighting from "./Lighting";
import Ground from "./Ground";

const Scene = (props: GroupProps) => {
  return (
    <group {...props}>
      <Ground />
      <Lighting />
      <Yamamoto />
      <GpgpuFire scale={[12, 20, 20]} position={[0, -2, 7.5]} />
    </group>
  );
};

export default Scene;
