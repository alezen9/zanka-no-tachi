import { useEffect, useMemo, useRef } from "react";
import { PointsProps, useFrame } from "@react-three/fiber";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { AdditiveBlending, ShaderMaterial, Uniform, Vector2 } from "three";

const PARTICLE_COUNT = 5000;
const PARTICLE_SCALE_FACTOR = 40;

const uniforms = {
  uTime: new Uniform(0),
  uLifetime: new Uniform(0.6),
  uResolution: new Uniform(new Vector2(0, 0)),
  uAnimationSpeed: new Uniform(1),
};

type Props = {
  name?: string;
  position?: PointsProps["position"];
  scale?: PointsProps["scale"];
  particleScale?: number;
  intensity?: number;
};

const Fire = (props: Props) => {
  const {
    name,
    particleScale = 1,
    intensity = 1,
    scale = 1,
    position = [0, 0, 0],
  } = props;
  const materialRef = useRef<ShaderMaterial>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const intensities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
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

      positions.set([x, y, z], i * 3);

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
      sizes[i] =
        (1 - normalizedDist) * 10 * PARTICLE_SCALE_FACTOR * particleScale;

      /**
       * Intensity
       */
      intensities[i] = intensity;
    }

    return { positions, sizes, intensities };
  }, [particleScale, intensity]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!materialRef.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const x = window.innerWidth * dpr;
      const y = window.innerHeight * dpr;
      materialRef.current.uniforms.uResolution.value.set(x, y);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uAnimationSpeed.value = intensity;
  }, [particleScale, intensity]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const time = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;
  });

  return (
    <points name={name} position={position} scale={scale}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={particles.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aIntensity"
          count={PARTICLE_COUNT}
          array={particles.intensities}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
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

export default Fire;
