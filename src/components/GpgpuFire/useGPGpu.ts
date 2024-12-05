import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTexture, Texture, Uniform } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";

const LOG_LEVEL = 0; // 0 = Inactive, 1 = Active

type Uniforms = {
  uTime: Uniform<number>;
  uParticlesInitialPositions: Uniform<Texture>;
  uPhase: Uniform<number>; // 0 Shikai / 1 Bankai

  // uConvergencePoint: Uniform<Vector3>;
  // uExpandDistance: Uniform<number>;
};

type UseGpgpuConfig = {
  count: number;
};

type GPGpu = {
  renderer: GPUComputationRenderer;
  texture: DataTexture;
  variable: Variable;
};

const useGPGpu = (config: UseGpgpuConfig) => {
  const { count } = config;
  const renderer = useThree(({ gl }) => gl);
  const gpgpu = useRef<GPGpu | null>(null);
  const [isActive, setIsActive] = useState(false);

  const particleUvs = useMemo(() => computeParticleUvs(count), [count]);

  const updateUniforms = useCallback((uniforms: Partial<Uniforms>) => {
    if (!gpgpu.current) return;
    for (const [name, value] of Object.entries(uniforms)) {
      gpgpu.current.variable.material.uniforms[name] = value;
    }
  }, []);

  useEffect(() => {
    if (!gpgpu.current) {
      const fboSize = computeFboSize(count);
      const gpgpuRenderer = new GPUComputationRenderer(
        fboSize,
        fboSize,
        renderer,
      );
      const gpgpuTexture = gpgpuRenderer.createTexture();
      const gpgpuVariable = gpgpuRenderer.addVariable(
        "uParticlesCurrentPositions",
        gpgpuParticlesShader,
        gpgpuTexture,
      );
      gpgpuRenderer.setVariableDependencies(gpgpuVariable, [gpgpuVariable]);

      gpgpu.current = {
        renderer: gpgpuRenderer,
        texture: gpgpuTexture,
        variable: gpgpuVariable,
      };

      updateUniforms({
        uPhase: new Uniform(0),
      });
    }
    return () => {
      gpgpu.current?.renderer.dispose();
      gpgpu.current?.texture.dispose();
      gpgpu.current = null;
    };
  }, [renderer, count, updateUniforms]);

  const getTexture = useCallback(() => {
    if (!gpgpu.current) return;
    const renderTarget = gpgpu.current.renderer.getCurrentRenderTarget(
      gpgpu.current.variable,
    );
    return renderTarget.texture;
  }, []);

  const init = useCallback(
    (positions: Float32Array) => {
      if (!gpgpu.current) {
        logger.error("[GPGPU] Init called before GPGpu Renderer creation");
        return null;
      }
      if (isActive) {
        logger.warn("[GPGPU] Init skipped because GPGpu already active");
        return null;
      }
      gpgpu.current.texture.image.data.set(positions);
      updateUniforms({
        uParticlesInitialPositions: new Uniform(gpgpu.current.texture),
      });
      gpgpu.current.renderer.init();
      const texture = getTexture();
      setIsActive(true);
      return texture ?? null;
    },
    [getTexture, updateUniforms, isActive],
  );

  const compute = useCallback(() => {
    if (!gpgpu.current) {
      logger.error("[GPGPU] Compute called before initialization");
      return null;
    }
    if (!isActive) {
      logger.warn("[GPGPU] Compute skipped because state is idle");
      return null;
    }
    gpgpu.current.renderer.compute();
    const texture = getTexture();
    return texture ?? null;
  }, [getTexture, isActive]);

  return {
    init,
    updateUniforms,
    compute,
    particleUvs,
    isActive,
  };
};

export default useGPGpu;

const computeFboSize = (count: number) => Math.ceil(Math.sqrt(count));

const computeParticleUvs = (count: number) => {
  const fboSize = computeFboSize(count);
  const uvs = new Float32Array(count * 2);
  for (let y = 0; y < fboSize; y++) {
    for (let x = 0; x < fboSize; x++) {
      const i = y * fboSize + x;
      const i2 = i * 2;

      const uvX = (x + 0.5) / fboSize; // horizontal center of the pixel
      const uvY = (y + 0.5) / fboSize; // vertical center of the pixel

      uvs[i2 + 0] = uvX;
      uvs[i2 + 1] = uvY;
    }
  }
  return uvs;
};

const logger = Object.freeze({
  error: (...args: Parameters<(typeof console)["error"]>) => {
    if (LOG_LEVEL === 0) return;
    logger.error(...args);
  },
  log: (...args: Parameters<(typeof console)["log"]>) => {
    if (LOG_LEVEL === 0) return;
    logger.log(...args);
  },
  warn: (...args: Parameters<(typeof console)["warn"]>) => {
    if (LOG_LEVEL === 0) return;
    logger.warn(...args);
  },
});
