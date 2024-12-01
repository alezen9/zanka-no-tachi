import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { AdditiveBlending, ShaderMaterial, Uniform, Vector2 } from "three";

const PARTICLE_COUNT = 5000;

const uniforms = {
  uTime: new Uniform(0),
  uResolution: new Uniform(new Vector2(0, 0)),
};

export default function Fire() {
  const materialRef = useRef<ShaderMaterial>(null);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = Math.random() * 2;
      const z = (Math.random() - 0.5) * 2;
      positions.set([x, y, z], i * 3);
    }

    return positions;
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
          array={particlePositions}
          itemSize={3}
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
        vertexColors
      />
    </points>
  );
}
