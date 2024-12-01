import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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

export default function Fire() {
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

  useFrame(({ clock, size, viewport }) => {
    if (!materialRef.current) return;
    const time = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uResolution.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
    );
  });

  return (
    <points>
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
