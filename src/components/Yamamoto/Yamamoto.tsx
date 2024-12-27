import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import modelUrl from "/yamamoto.glb?url";
import { GroupProps, useFrame } from "@react-three/fiber";
import bladeVertexShader from "./blade.vertex.glsl";
import bladeFragmentShader from "./blade.fragment.glsl";
import {
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Uniform,
} from "three";
import cracksTextureUrl from "/cracks2.webp?url";
import { useEffect, useRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    ["equipment-sandals"]: Mesh;
    ["face-eyebrows"]: Mesh;
    ["face-mustache"]: Mesh;
    ["face-head"]: Mesh;
    ["face-beard"]: Mesh;
    ["face-eyes"]: Mesh;
    ["zampakuto-handle-middle"]: Mesh;
    ["zampakuto-guard"]: Mesh;
    ["zampakuto-blade"]: Mesh;
    ["equipment-belt"]: Mesh;
    ["equipment-cloath"]: Mesh;
    ["equipment-scabbard-bottom"]: Mesh;
    ["body-torso"]: Mesh;
    ["body-hand"]: Mesh;
    ["body-legs"]: Mesh;
    ["equipment-scabbard-top"]: Mesh;
    ["zampakuto-handle-top"]: Mesh;
    ["zampakuto-handle-bottom"]: Mesh;
  };
  materials: {
    sandal: MeshPhysicalMaterial;
    hair: MeshStandardMaterial;
    skin: MeshStandardMaterial;
    eye: MeshStandardMaterial;
    grip: MeshStandardMaterial;
    guard: MeshStandardMaterial;
    belt: MeshStandardMaterial;
    cloath: MeshStandardMaterial;
    ["scabbard-bottom"]: MeshStandardMaterial;
    ["scabbard-top"]: MeshStandardMaterial;
  };
};

const Yamamoto = (props: GroupProps) => {
  const { nodes, materials } = useGLTF(modelUrl) as GLTFResult;
  const bladeMaterialRef = useRef<ShaderMaterial>(null);

  const cracksTexture = useTexture(cracksTextureUrl);

  useEffect(() => {
    cracksTexture.colorSpace = SRGBColorSpace;
    cracksTexture.wrapS = RepeatWrapping;
    cracksTexture.wrapT = RepeatWrapping;
    cracksTexture.needsUpdate = true;
  }, [cracksTexture]);

  useFrame(({ clock }) => {
    if (!bladeMaterialRef.current) return;
    bladeMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <group {...props} rotation-y={-Math.PI / 2} castShadow>
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
        <shaderMaterial
          ref={bladeMaterialRef}
          vertexShader={bladeVertexShader}
          fragmentShader={bladeFragmentShader}
          uniforms={{
            cracksTexture: new Uniform(cracksTexture),
            uTime: new Uniform(0),
          }}
        />
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
