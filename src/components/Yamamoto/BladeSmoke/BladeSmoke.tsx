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

const PARTICLES_COUNT = 500;
const PARTICLE_SCALE = 100;

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
  const gsapRef = useRef<GSAPTween>();

  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        gsapRef.current?.kill();
        if (!pointsRef.current) return;
        gsapRef.current = gsap.to(pointsRef.current.material.uniforms.uScale, {
          value: state.isBankaiActive ? PARTICLE_SCALE : 0,
          duration: state.isBankaiActive ? 3 : 0,
          delay: state.isBankaiActive ? 2 : 0,
          ease: "power2.out",
          onStart: () => {
            if (!pointsRef.current) return;
            pointsRef.current.visible = state.isBankaiActive;
          },
          onComplete: () => {
            if (!pointsRef.current) return;
            pointsRef.current.visible = state.isBankaiActive;
          },
        });
      }
    });

    return () => {
      unsubscribe();
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
        uniforms={{
          uTime: new Uniform(0),
          uScale: new Uniform(0),
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

export default BladeSmoke;
