import { useEffect, useMemo, useRef } from "react";
import { PointsProps, useFrame } from "@react-three/fiber";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { AdditiveBlending, ShaderMaterial, Uniform, Vector2 } from "three";

const PARTICLE_COUNT = 2500;

const uniforms = {
  uTime: new Uniform(0),
  uLifetime: new Uniform(0.6),
  uResolution: new Uniform(new Vector2(0, 0)),
  uAnimationSpeed: new Uniform(1),
};

type Props = {
  name?: string;
  position?: PointsProps["position"];
  scale?: number;
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
      const x = (Math.random() - 0.5) * 2;
      const y = Math.random() * 2;
      const z = (Math.random() - 0.5) * 2;
      positions.set([x, y, z], i * 3);

      //   sizes[i] = Math.random() * 500 * particleScale;
      // Larger size at lower y, smaller at higher y
      const normalizedY = y / 2; // Normalize y to range [0, 1]
      sizes[i] = normalizedY * 500 * particleScale; // Larger at y = 0, smaller at y = 2
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
    <points name={name} position={position} scale={[scale, scale * 0.7, scale]}>
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
