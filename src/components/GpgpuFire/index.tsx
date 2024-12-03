import { MeshProps, useFrame, useThree } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  AdditiveBlending,
  MeshBasicMaterial,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
} from "three";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

const PARTICLES_COUNT = 2500;

const uniforms = {
  uSize: new Uniform(0.2),
  uResolution: new Uniform(new Vector2(0, 0)),
  uParticlesTexture: new Uniform(undefined),
  uLifetime: new Uniform(0.6),
  uAnimationSpeed: new Uniform(1),
};

type UseGpgpuConfig = {
  count: number;
};

const useGpgpu = (config: UseGpgpuConfig) => {
  const { count } = config;
  const fboSize = useMemo(() => Math.ceil(Math.sqrt(count)), [count]);
  const renderer = useThree(({ gl }) => gl);
  const gpgpuComputationRenderer = useRef(
    new GPUComputationRenderer(fboSize, fboSize, renderer),
  );
  const baseParticleTexture = useRef(
    gpgpuComputationRenderer.current.createTexture(),
  );
  const gpgpuParticlesVariable = useRef(
    gpgpuComputationRenderer.current.addVariable(
      "uParticles",
      gpgpuParticlesShader,
      baseParticleTexture.current,
    ),
  );

  const particleUvs = useMemo(() => {
    const uvs = new Float32Array(count * 2);

    for (let y = 0; y < fboSize; y++) {
      for (let x = 0; x < fboSize; x++) {
        const i = y * fboSize + x;
        const i2 = i * 2;
        const uvX = (x + 0.5) / fboSize;
        const uvY = (y + 0.5) / fboSize;

        uvs[i2 + 0] = uvX;
        uvs[i2 + 1] = uvY;
      }
    }

    return uvs;
  }, [count, fboSize]);

  useEffect(() => {
    gpgpuComputationRenderer.current.setVariableDependencies(
      gpgpuParticlesVariable.current,
      [gpgpuParticlesVariable.current],
    );
  }, []);

  const getTexture = useCallback(() => {
    const renderTarget =
      gpgpuComputationRenderer.current.getCurrentRenderTarget(
        gpgpuParticlesVariable.current,
      );
    return renderTarget.texture;
  }, []);

  const init = useCallback(
    (positions: Float32Array) => {
      baseParticleTexture.current.image.data.set(positions);
      gpgpuParticlesVariable.current.material.uniforms.uBase = new Uniform(
        baseParticleTexture,
      );
      gpgpuComputationRenderer.current.init();
      const texture = getTexture();
      return texture;
    },
    [getTexture],
  );

  const updateUniforms = useCallback((uniforms: Record<string, Uniform>) => {
    for (const [name, value] of Object.entries(uniforms)) {
      gpgpuParticlesVariable.current.material.uniforms[name] = value;
    }
  }, []);

  const compute = useCallback(() => {
    gpgpuComputationRenderer.current.compute();
    const texture = getTexture();
    return texture;
  }, [getTexture]);

  return {
    init,
    updateUniforms,
    getTexture,
    compute,
    particleUvs,
  };
};

// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

const GpgpuFire = () => {
  const particlesMaterial = useRef<ShaderMaterial>(null);
  const gpgpuDebug = useRef<GpgpuDebugRef>(null);
  const { init, compute, updateUniforms, particleUvs } = useGpgpu({
    count: PARTICLES_COUNT,
  });

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLES_COUNT * 4);
    const sizes = new Float32Array(PARTICLES_COUNT);

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
      const w = Math.random();

      positions.set([x, y, z, w], i * 4);

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
      sizes[i] = (1 - normalizedDist) * 1;
    }
    return {
      positions,
      sizes,
    };
  }, []);

  useEffect(() => {
    const texture = init(positions);
    gpgpuDebug.current?.debug(texture);
  }, [init, positions]);

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
    if (!particlesMaterial.current) return;
    const elapsedTime = clock.getElapsedTime();

    updateUniforms({
      uTime: new Uniform(elapsedTime),
      uDeltaTime: new Uniform(deltaTime),
    });

    // GPGPU update
    const texture = compute();
    particlesMaterial.current.uniforms.uParticlesTexture.value = texture;
  });

  return (
    <group position-y={0.5}>
      <points>
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
          <bufferAttribute
            attach="attributes-aSize"
            count={sizes.length}
            array={sizes}
            itemSize={1}
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
      <GpgpuDebug ref={gpgpuDebug} />
    </group>
  );
};

export default GpgpuFire;

// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

type GpgpuDebugRef = {
  debug: (texture: Texture) => void;
};

const GpgpuDebug = forwardRef<GpgpuDebugRef, MeshProps>((props, outerRef) => {
  const material = useRef<MeshBasicMaterial>(null);

  useImperativeHandle(outerRef, () => ({
    debug: (texture: Texture) => {
      if (!material.current) return;
      material.current.map = texture;
    },
  }));

  return (
    <mesh {...props}>
      <planeGeometry />
      <meshBasicMaterial ref={material} />
    </mesh>
  );
});
