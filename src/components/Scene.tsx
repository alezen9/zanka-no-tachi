import { GroupProps } from "@react-three/fiber";
import GpgpuFire from "./GpgpuFire/GpgpuFire";
import Yamamoto from "./Yamamoto";
import Lighting from "./Lighting";

const Scene = (props: GroupProps) => {
  return (
    <group {...props}>
      <TemporaryGround />
      <Lighting />
      <Yamamoto />
      <GpgpuFire scale={[12, 20, 20]} position={[0, -2, 7.5]} />
    </group>
  );
};

export default Scene;

const TemporaryGround = () => {
  return (
    <mesh rotation-x={-Math.PI / 2} scale={100}>
      <planeGeometry />
      <meshStandardMaterial />
    </mesh>
  );
};
