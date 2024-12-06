import { PointsProps, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
} from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import useGPGpu from "./useGPGpu";

const uniforms = {
  uResolution: new Uniform(new Vector2(0)),
  uParticlesCurrentPositions: new Uniform(new Texture()),
};

type Props = Pick<PointsProps, "name" | "position" | "scale"> & {
  geometry: BufferGeometry;
  particlesCount: number;
  initialPositionsAndSize: Float32Array;
};

const GpgpuFire = (props: Props) => {
  const { particlesCount, initialPositionsAndSize } = props;
  const material = useRef<ShaderMaterial>(null);

  const { initGpgpu, computeGpgpu, updateGpgpuUniforms, isGpgpuActive } =
    useGPGpu({
      count: particlesCount,
    });

  useEffect(() => {
    initGpgpu(initialPositionsAndSize);
  }, [initGpgpu, initialPositionsAndSize]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!material.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const x = window.innerWidth * dpr;
      const y = window.innerHeight * dpr;
      material.current.uniforms.uResolution.value.set(x, y);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useFrame(({ clock }) => {
    if (!material.current || !isGpgpuActive) return;
    const elapsedTime = clock.getElapsedTime() * 0.02;

    updateGpgpuUniforms({
      uTime: elapsedTime,
    });

    const texture = computeGpgpu();
    material.current.uniforms.uParticlesCurrentPositions.value = texture;
  });

  return (
    <points {...props}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        blending={AdditiveBlending}
        transparent
      />
    </points>
  );
};

export default GpgpuFire;
