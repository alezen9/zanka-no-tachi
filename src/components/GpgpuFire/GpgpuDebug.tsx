import { MeshProps } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { MeshBasicMaterial, Texture } from "three";

export type GpgpuDebugRef = {
  debug: (texture: Texture) => void;
};

const GpgpuDebug = forwardRef<GpgpuDebugRef, MeshProps>((props, outerRef) => {
  const material = useRef<MeshBasicMaterial>(null);

  useImperativeHandle(outerRef, () => ({
    debug: (texture: Texture) => {
      if (!material.current) return;
      material.current.map = texture;
    },
  }));

  return (
    <mesh {...props}>
      <planeGeometry />
      <meshBasicMaterial ref={material} />
    </mesh>
  );
});

export default GpgpuDebug;
