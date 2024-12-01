import { useEffect, useMemo, useRef } from "react";
import { PointsProps, useFrame } from "@react-three/fiber";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { AdditiveBlending, ShaderMaterial, Uniform, Vector2 } from "three";

const PARTICLE_COUNT = 2500;

const uniforms = {
  uTime: new Uniform(0),
  uLifetime: new Uniform(0.6),
  uScale: new Uniform(1),
  uResolution: new Uniform(new Vector2(0, 0)),
};

export default function Fire(props: PointsProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = Math.random() * 2;
      const z = (Math.random() - 0.5) * 2;
      positions.set([x, y, z], i * 3);
      sizes[i] = Math.random() * 1.4;
    }

    return { positions, sizes };
  }, []);

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

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const time = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;
  });

  return (
    <points {...props}>
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
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        depthTest={false}
        blending={AdditiveBlending}
        transparent
      />
    </points>
  );
}
