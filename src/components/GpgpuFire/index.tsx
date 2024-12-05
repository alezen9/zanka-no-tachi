import { PointsProps, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  ShaderMaterial,
  Sphere,
  Uniform,
  Vector2,
  Vector3,
} from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import useGPGpu from "./useGPGpu";

const PARTICLES_COUNT = 5000;
const PARTICLE_BASE_SCALE = 50;

const uniforms = {
  uSizeScale: new Uniform(27.5),
  uResolution: new Uniform(new Vector2(0)),
  uParticlesTexture: new Uniform(undefined),
};

type Props = {
  name?: string;
  position?: PointsProps["position"];
  scale?: PointsProps["scale"];
};

export type GpgpuFireRef = {
  activateBankai: VoidFunction;
};

const GpgpuFire = (props: Props) => {
  const { name, scale = 1, position = [0, 0, 0] } = props;

  const particlesMaterial = useRef<ShaderMaterial>(null);

  const { init, compute, updateUniforms, particleUvs, isActive } = useGPGpu({
    count: PARTICLES_COUNT,
  });

  const initialPositionsAndSize = useMemo(() => {
    const data = new Float32Array(PARTICLES_COUNT * 4);
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const position = computeFireParticlePosition();
      const size = computeFireParticleSize(position);
      data.set([...position, size], i * 4);
    }
    return data;
  }, []);

  useEffect(() => {
    if (isActive) return;
    init(initialPositionsAndSize);
  }, [init, initialPositionsAndSize, isActive]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!particlesMaterial.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const x = window.innerWidth * dpr;
      const y = window.innerHeight * dpr;
      particlesMaterial.current.uniforms.uResolution.value.set(x, y);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useFrame(({ clock }) => {
    if (!particlesMaterial.current || !isActive) return;
    const elapsedTime = clock.getElapsedTime();

    updateUniforms({
      uTime: new Uniform(elapsedTime),
    });

    const texture = compute();
    particlesMaterial.current.uniforms.uParticlesTexture.value = texture;
  });

  return (
    <group>
      <points name={name} position={position} scale={scale}>
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
          ref={particlesMaterial}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          depthWrite={false}
          blending={AdditiveBlending}
          transparent
        />
      </points>
    </group>
  );
};

export default GpgpuFire;

const computeFireParticlePosition = (): [number, number, number] => {
  // Random angle and radius for circular distribution
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * 1.5; // Random radius, sqrt for even distribution

  // Convert polar coordinates to Cartesian for xz-plane
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.random() * 1.66; // y position remains the same

  return [x, y, z];
};

const computeFireParticleSize = (position: [number, number, number]) => {
  const [x, y, z] = position;
  const coreX = 0;
  const a = x - coreX;
  const coreY = 0.2; // Core is slightly above the bottom
  const b = y - coreY;
  const coreZ = 0;
  const c = z - coreZ;

  // (Euclidean) distance from core
  const distFromCore = Math.sqrt(a ** 2 + b ** 2 + c ** 2);
  const maxDist = 2.2; // Maximum distance a particle can be from the core
  const normalizedDist = Math.min(distFromCore / maxDist, 1); // Clamp to [0, 1]

  // Larger size at the core, smaller size at the edges
  const size = (1 - normalizedDist) * PARTICLE_BASE_SCALE;
  return size;
};
