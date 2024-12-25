import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import modelUrl from "/yamamoto.glb?url";
import { GroupProps } from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    ["equipment-sandals"]: THREE.Mesh;
    ["face-eyebrows"]: THREE.Mesh;
    ["face-mustache"]: THREE.Mesh;
    ["face-head"]: THREE.Mesh;
    ["face-beard"]: THREE.Mesh;
    ["face-eyes"]: THREE.Mesh;
    ["zampakuto-handle-middle"]: THREE.Mesh;
    ["zampakuto-guard"]: THREE.Mesh;
    ["zampakuto-blade"]: THREE.Mesh;
    ["equipment-belt"]: THREE.Mesh;
    ["equipment-cloath"]: THREE.Mesh;
    ["equipment-scabbard-bottom"]: THREE.Mesh;
    ["body-torso"]: THREE.Mesh;
    ["body-hand"]: THREE.Mesh;
    ["body-legs"]: THREE.Mesh;
    ["equipment-scabbard-top"]: THREE.Mesh;
    ["zampakuto-handle-top"]: THREE.Mesh;
    ["zampakuto-handle-bottom"]: THREE.Mesh;
  };
  materials: {
    sandal: THREE.MeshPhysicalMaterial;
    hair: THREE.MeshStandardMaterial;
    skin: THREE.MeshStandardMaterial;
    eye: THREE.MeshStandardMaterial;
    grip: THREE.MeshStandardMaterial;
    guard: THREE.MeshStandardMaterial;
    blade: THREE.MeshStandardMaterial;
    belt: THREE.MeshStandardMaterial;
    cloath: THREE.MeshStandardMaterial;
    ["scabbard-bottom"]: THREE.MeshStandardMaterial;
    ["scabbard-top"]: THREE.MeshStandardMaterial;
  };
};

const Yamamoto = (props: GroupProps) => {
  const { nodes, materials } = useGLTF(modelUrl) as GLTFResult;

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      <mesh
        name="equipment-sandals"
        castShadow
        receiveShadow
        geometry={nodes["equipment-sandals"].geometry}
        material={materials.sandal}
      />
      <mesh
        name="face-eyebrows"
        castShadow
        receiveShadow
        geometry={nodes["face-eyebrows"].geometry}
        material={materials.hair}
      />
      <mesh
        name="face-mustache"
        castShadow
        receiveShadow
        geometry={nodes["face-mustache"].geometry}
        material={materials.hair}
      />
      <mesh
        name="face-head"
        castShadow
        receiveShadow
        geometry={nodes["face-head"].geometry}
        material={materials.skin}
      />
      <mesh
        name="face-beard"
        castShadow
        receiveShadow
        geometry={nodes["face-beard"].geometry}
        material={materials.hair}
      />
      <mesh
        name="face-eyes"
        castShadow
        receiveShadow
        geometry={nodes["face-eyes"].geometry}
        material={materials.eye}
      />
      <mesh
        name="zampakuto-handle-middle"
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-middle"].geometry}
        material={materials.grip}
      />
      <mesh
        name="zampakuto-guard"
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-guard"].geometry}
        material={materials.guard}
      />
      <mesh
        name="zampakuto-blade"
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-blade"].geometry}
      >
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh
        name="equipment-belt"
        castShadow
        receiveShadow
        geometry={nodes["equipment-belt"].geometry}
        material={materials.belt}
      />
      <mesh
        name="equipment-cloath"
        castShadow
        receiveShadow
        geometry={nodes["equipment-cloath"].geometry}
        material={materials.cloath}
      />
      <mesh
        name="equipment-scabbard-bottom"
        castShadow
        receiveShadow
        geometry={nodes["equipment-scabbard-bottom"].geometry}
        material={materials["scabbard-bottom"]}
      />
      <mesh
        name="body-torso"
        castShadow
        receiveShadow
        geometry={nodes["body-torso"].geometry}
        material={materials.skin}
      />
      <mesh
        name="body-hand"
        castShadow
        receiveShadow
        geometry={nodes["body-hand"].geometry}
        material={materials.skin}
      />
      <mesh
        name="body-legs"
        castShadow
        receiveShadow
        geometry={nodes["body-legs"].geometry}
        material={materials.skin}
      />
      <mesh
        name="equipment-scabbard-top"
        castShadow
        receiveShadow
        geometry={nodes["equipment-scabbard-top"].geometry}
        material={materials["scabbard-top"]}
      />
      <mesh
        name="zampakuto-handle-top"
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-top"].geometry}
        material={materials.guard}
      />
      <mesh
        name="zampakuto-handle-bottom"
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-bottom"].geometry}
        material={materials.guard}
      />
    </group>
  );
};

useGLTF.preload(modelUrl);

export default Yamamoto;
