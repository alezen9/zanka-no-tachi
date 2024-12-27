import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { GroupProps } from "@react-three/fiber";
import modelUrl from "/ground.glb?url";

type GLTFResult = GLTF & {
  nodes: {
    ground: THREE.Mesh;
    rocks: THREE.Mesh;
  };
  materials: {
    ground: THREE.MeshStandardMaterial;
    rock: THREE.MeshStandardMaterial;
  };
};

const Ground = (props: GroupProps) => {
  const { nodes, materials } = useGLTF(modelUrl) as GLTFResult;
  return (
    <group {...props}>
      <mesh
        name="ground"
        receiveShadow
        geometry={nodes.ground.geometry}
        material={materials.ground}
      />
      <mesh
        name="rocks"
        castShadow
        geometry={nodes.rocks.geometry}
        material={materials.rock}
      />
    </group>
  );
};

useGLTF.preload(modelUrl);

export default Ground;
