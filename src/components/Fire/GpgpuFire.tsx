import { PointsProps, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Sphere,
  Texture,
  Uniform,
  Vector2,
  Vector3,
} from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import useGPGpu, { computeParticleUvs } from "./useGPGpu";
import { computeInitialParticlePositionsAndSize } from "./helpers";

const PARTICLES_COUNT = 5000 * 15;

const particleUvs = computeParticleUvs(PARTICLES_COUNT);
const initialPositionsAndSize =
  computeInitialParticlePositionsAndSize(PARTICLES_COUNT);

const uniforms = {
  uResolution: new Uniform(new Vector2(0)),
  uParticlesCurrentPositions: new Uniform(new Texture()),
  uTime: new Uniform(0),
};

enum Phase {
  Shikai,
  Bankai,
}

type GpgpuUniforms = {
  uTime: number;
  uDeltaTime: number;
  uPhase: Phase;
  uSeed: number;
  uConvergencePosition: Vector3;
};

type Props = PointsProps & {
  isBankaiActive: boolean;
};

const GpgpuFire = (props: Props) => {
  const { isBankaiActive, ...rest } = props;
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  const { initGpgpu, computeGpgpu, updateGpgpuUniforms, isGpgpuActive } =
    useGPGpu<GpgpuUniforms>({
      count: PARTICLES_COUNT,
    });

  useEffect(() => {
    if (isGpgpuActive) return;
    initGpgpu(initialPositionsAndSize, {
      uTime: 0,
      uDeltaTime: 0,
      uPhase: Phase.Shikai,
      uSeed: (Math.random() - 0.5) * 4,
      uConvergencePosition: new Vector3(0, 0, 0),
    });
  }, [initGpgpu, isGpgpuActive]);

  useEffect(() => {
    const center = new Vector3(0, 2, 0);
    const convergence = pointsRef.current!.worldToLocal(center);
    updateGpgpuUniforms({
      uPhase: isBankaiActive ? Phase.Bankai : Phase.Shikai,
      uConvergencePosition: convergence,
    });
  }, [isBankaiActive, updateGpgpuUniforms]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!pointsRef.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const x = window.innerWidth * dpr;
      const y = window.innerHeight * dpr;
      pointsRef.current.material.uniforms.uResolution.value.set(x, y);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || !isGpgpuActive) return;
    const elapsedTime = clock.getElapsedTime();
    pointsRef.current.material.uniforms.uTime.value = elapsedTime;

    updateGpgpuUniforms({
      uTime: elapsedTime,
      uDeltaTime: delta,
    });

    const texture = computeGpgpu();
    pointsRef.current.material.uniforms.uParticlesCurrentPositions.value =
      texture;
  });

  return (
    <points {...rest} ref={pointsRef}>
      <bufferGeometry
        boundingSphere={new Sphere(new Vector3(0), 1)}
        drawRange={{
          start: 0,
          count: PARTICLES_COUNT,
        }}
      >
        <bufferAttribute
          attach="attributes-aParticlesUv"
          count={PARTICLES_COUNT}
          array={particleUvs}
          itemSize={2}
        />
      </bufferGeometry>
      <shaderMaterial
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
