import {
  PointsProps,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  AdditiveBlending,
  Group,
  Matrix4,
  Points,
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

const uniforms = {
  uSizeScale: new Uniform(45),
  uResolution: new Uniform(new Vector2(0)),
  uParticlesTexture: new Uniform(undefined),
};

type Props = {
  name?: string;
  position?: PointsProps["position"];
  scale?: PointsProps["scale"];
  particleScale?: number;
};

export type GpgpuFireRef = {
  activateBankai: (matrix: Matrix4) => void;
};

const GpgpuFire = forwardRef<GpgpuFireRef, Props>((props, outerRef) => {
  const { name, particleScale = 1, scale = 1, position = [0, 0, 0] } = props;
  const particlesMaterial = useRef<ShaderMaterial>(null);
  const boundingSphere = useRef(new Sphere(new Vector3(0), 1));

  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);

  const { init, compute, updateUniforms, particleUvs, isActive } = useGPGpu({
    count: PARTICLES_COUNT,
  });

  const { clock } = useThree(({ scene, clock }) => ({ scene, clock }));

  useImperativeHandle(
    outerRef,
    () => ({
      activateBankai: (matrix) => {
        // scene.updateMatrixWorld();
        // const inverseSceneMatrixWorld = scene.matrixWorld.clone().invert();

        // if (!groupRef.current) return;

        // groupRef.current?.updateMatrixWorld();
        // const inverseGroupInternal = groupRef.current?.matrixWorld
        //   .clone()
        //   .invert();

        // if (!pointsRef.current) return;

        // pointsRef.current.updateMatrixWorld();
        // const inversePointsInternal = pointsRef.current?.matrixWorld
        //   .clone()
        //   .invert();
        // console.log({ inverseGroupInternal, inversePointsInternal });
        updateUniforms({
          uPhase: new Uniform(1),
          uSceneMatrixWorldInverse: new Uniform(matrix),
          uConvergenceStartTime: new Uniform(clock.getElapsedTime()),
        });
      },
    }),
    [updateUniforms, clock],
  );

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
      const maxDist = 2.2; // Maximum distance a particle can be from the core
      const normalizedDist = Math.min(distFromCore / maxDist, 1); // Clamp to [0, 1]

      // Larger size at the core, smaller size at the edges
      const size = (1 - normalizedDist) * 10 * particleScale;

      data.set([x, y, z, size], i * 4);
    }
    return data;
  }, [particleScale]);

  useEffect(() => {
    if (isActive) return;
    init(initialData);
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
    <group ref={groupRef}>
      <points name={name} position={position} scale={scale} ref={pointsRef}>
        <bufferGeometry
          boundingSphere={boundingSphere.current}
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
});

export default GpgpuFire;
