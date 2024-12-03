import { PointsProps, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, ShaderMaterial, Uniform, Vector2 } from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import useGPGpu from "./useGPGpu";
import GpgpuDebug, { GpgpuDebugRef } from "./GpgpuDebug";

const PARTICLES_COUNT = 5000;

const uniforms = {
  uSizeScale: new Uniform(45),
  uResolution: new Uniform(new Vector2(0, 0)),
  uParticlesTexture: new Uniform(undefined),
};

type Props = {
  name?: string;
  position?: PointsProps["position"];
  scale?: PointsProps["scale"];
  particleScale?: number;
};

const GpgpuFire = (props: Props) => {
  const { name, particleScale = 1, scale = 1, position = [0, 0, 0] } = props;
  const particlesMaterial = useRef<ShaderMaterial>(null);
  const gpgpuDebug = useRef<GpgpuDebugRef>(null);
  const { init, compute, updateUniforms, particleUvs, isActive } = useGPGpu({
    count: PARTICLES_COUNT,
  });

  const initialData = useMemo(() => {
    const data = new Float32Array(PARTICLES_COUNT * 4);
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      /**
       * Positions
       */
      // Random angle and radius for circular distribution
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 1.5; // Random radius, sqrt for even distribution

      // Convert polar coordinates to Cartesian for xz-plane
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.random() * 1.66; // y position remains the same

      /**
       * Sizes
       */
      const coreX = 0;
      const a = x - coreX;
      const coreY = 0.2; // Core is slightly above the bottom
      const b = y - coreY;
      const coreZ = 0;
      const c = z - coreZ;

      // (Euclidean) distance from core
      const distFromCore = Math.sqrt(a ** 2 + b ** 2 + c ** 2);
      const maxDist = 2.5; // Maximum distance a particle can be from the core
      const normalizedDist = Math.min(distFromCore / maxDist, 1); // Clamp to [0, 1]

      // Larger size at the core, smaller size at the edges
      const size = (1 - normalizedDist) * 10 * particleScale;

      data.set([x, y, z, size], i * 4);
    }
    return data;
  }, [particleScale]);

  useEffect(() => {
    if (isActive) return;
    const texture = init(initialData);
    if (texture) gpgpuDebug.current?.debug(texture);
  }, [init, initialData, isActive]);

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

  useFrame(({ clock }, deltaTime) => {
    if (!particlesMaterial.current || !isActive) return;
    const elapsedTime = clock.getElapsedTime();

    updateUniforms({
      uTime: new Uniform(elapsedTime),
      uDeltaTime: new Uniform(deltaTime),
    });

    const texture = compute();
    particlesMaterial.current.uniforms.uParticlesTexture.value = texture;
  });

  return (
    <group>
      <points name={name} position={position} scale={scale}>
        <bufferGeometry
          drawRange={{
            start: 0,
            count: PARTICLES_COUNT,
          }}
        >
          <bufferAttribute
            attach="attributes-aParticlesUv"
            count={particleUvs.length}
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
      <GpgpuDebug visible={false} position-x={-4} ref={gpgpuDebug} />
    </group>
  );
};

export default GpgpuFire;
