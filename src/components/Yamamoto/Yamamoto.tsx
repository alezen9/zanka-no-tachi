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
import cracksTextureUrl from "/cracks.webp?url";
import { useEffect, useRef } from "react";
import BladeFire from "./BladeFire/BladeFire";
import BladeSmoke from "./BladeSmoke/BladeSmoke";

type GLTFResult = GLTF & {
  nodes: {
    ["equipment-sandals"]: Mesh;
    ["facel-hair"]: Mesh;
    ["face-eyes"]: Mesh;
    ["zampakuto-handle-middle"]: Mesh;
    ["zampakuto-guard"]: Mesh;
    ["zampakuto-blade"]: Mesh;
    ["equipment-belt"]: Mesh;
    ["equipment-cloath"]: Mesh;
    ["equipment-scabbard-bottom"]: Mesh;
    ["equipment-scabbard-top"]: Mesh;
    ["zampakuto-handle-top"]: Mesh;
    ["zampakuto-handle-bottom"]: Mesh;
    body: Mesh;
  };
  materials: {
    sandal: MeshPhysicalMaterial;
    hair: MeshStandardMaterial;
    eye: MeshStandardMaterial;
    grip: MeshStandardMaterial;
    guard: MeshStandardMaterial;
    belt: MeshStandardMaterial;
    cloath: MeshStandardMaterial;
    ["scabbard-bottom"]: MeshStandardMaterial;
    ["scabbard-top"]: MeshStandardMaterial;
    skin: MeshStandardMaterial;
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
    <group {...props} rotation-y={-Math.PI / 2}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["equipment-sandals"].geometry}
        material={materials.sandal}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["facel-hair"].geometry}
        material={materials.hair}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["face-eyes"].geometry}
        material={materials.eye}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-middle"].geometry}
        material={materials.grip}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-guard"].geometry}
        material={materials.guard}
      />
      <BladeFire scale={[0.15, 0.2, 1.9]} position={[-0.2, 2.45, 2]} />
      <BladeSmoke scale={[0.05, 1, 1]} position={[-0.16, 2.5, 1.7]} />
      <mesh
        name="zampakuto-blade"
        castShadow
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
        castShadow
        receiveShadow
        geometry={nodes["equipment-belt"].geometry}
        material={materials.belt}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["equipment-cloath"].geometry}
        material={materials.cloath}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["equipment-scabbard-bottom"].geometry}
        material={materials["scabbard-bottom"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["equipment-scabbard-top"].geometry}
        material={materials["scabbard-top"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-top"].geometry}
        material={materials.guard}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["zampakuto-handle-bottom"].geometry}
        material={materials.guard}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.body.geometry}
        material={materials.skin}
      />
    </group>
  );
};

useGLTF.preload(modelUrl);

export default Yamamoto;
