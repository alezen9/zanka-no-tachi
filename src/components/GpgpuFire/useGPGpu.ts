import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTexture, Texture, Uniform, WebGLRenderer } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";

const PARTICLES_CURRENT_POSITIONS_TEXTURE_UNIFORM_NAME =
  "uParticlesCurrentPositions";

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
      gpgpu.current = createGpgpu(renderer, fboSize);
    }
    return () => {
      gpgpu.current?.texture.dispose();
      gpgpu.current?.renderer.dispose();
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
      if (!gpgpu.current || isActive) return;
      gpgpu.current.texture.image.data.set(positions);
      updateUniforms({
        uPhase: new Uniform(0),
        uParticlesInitialPositions: new Uniform(gpgpu.current.texture),
      });
      gpgpu.current.renderer.init();
      setIsActive(true);
    },
    [updateUniforms, isActive],
  );

  const compute = useCallback(() => {
    if (!gpgpu.current || !isActive) return;
    gpgpu.current.renderer.compute();
    const texture = getTexture();
    return texture;
  }, [getTexture, isActive]);

  return {
    initGpgpu: init,
    updateGpgpuUniforms: updateUniforms,
    computeGpgpu: compute,
    particleUvs,
    isGpgpuActive: isActive,
  };
};

export default useGPGpu;

/**
 * ############################## Helpers ##############################
 */

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

const createGpgpu = (renderer: WebGLRenderer, fboSize: number) => {
  const gpgpuRenderer = new GPUComputationRenderer(fboSize, fboSize, renderer);
  const gpgpuTexture = gpgpuRenderer.createTexture();
  const gpgpuVariable = gpgpuRenderer.addVariable(
    PARTICLES_CURRENT_POSITIONS_TEXTURE_UNIFORM_NAME,
    gpgpuParticlesShader,
    gpgpuTexture,
  );
  gpgpuRenderer.setVariableDependencies(gpgpuVariable, [gpgpuVariable]);

  return {
    renderer: gpgpuRenderer,
    texture: gpgpuTexture,
    variable: gpgpuVariable,
  };
};
