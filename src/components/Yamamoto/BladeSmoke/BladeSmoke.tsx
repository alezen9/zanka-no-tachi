import { PointsProps, useFrame } from "@react-three/fiber";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import {
  BufferGeometry,
  MathUtils,
  Points,
  ShaderMaterial,
  Sphere,
  Uniform,
  Vector3,
} from "three";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import useInterfaceStore from "../../../stores/useInterfaceStore";

const PARTICLES_COUNT = 2000;
const PARTICLE_SCALE = 50;

const uniforms = {
  uTime: new Uniform(0),
  uScale: new Uniform(0),
};

const particles = new Float32Array(PARTICLES_COUNT * 4);

for (let i = 0; i < PARTICLES_COUNT; i++) {
  const x = Math.random();
  const y = Math.random();
  const z = Math.random() - 0.5;
  const size = MathUtils.mapLinear(Math.random(), 0, 1, 0.3, 1);

  particles.set([x, y, z, size], i * 4);
}

const BladeSmoke = (props: PointsProps) => {
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  useEffect(() => {
    const points = pointsRef.current;
    const unsubscribe = useInterfaceStore.subscribe(
      ({ isBankaiActive }, { isBankaiActive: prevIsBankaiActive }) => {
        if (!points || isBankaiActive === prevIsBankaiActive) return;
        gsap.killTweensOf(uniforms.uScale);
        if (!isBankaiActive) {
          uniforms.uScale.value = 0;
          points.visible = false;
        } else {
          gsap.to(uniforms.uScale, {
            value: PARTICLE_SCALE,
            duration: 2,
            delay: 1.5,
            ease: "power2.out",
            onStart: () => {
              points.visible = true;
            },
          });
        }
      },
    );

    return () => {
      unsubscribe();
      gsap.killTweensOf(uniforms.uScale);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points {...props} ref={pointsRef} visible={false}>
      <bufferGeometry
        boundingSphere={new Sphere(new Vector3(0), 1)}
        drawRange={{
          start: 0,
          count: PARTICLES_COUNT,
        }}
      >
        <bufferAttribute
          attach="attributes-aParticle"
          count={PARTICLES_COUNT}
          itemSize={4}
          array={particles}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

export default BladeSmoke;
