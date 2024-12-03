import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTexture, Uniform } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";

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
  const fboSize = useMemo(() => Math.ceil(Math.sqrt(count)), [count]);
  const renderer = useThree(({ gl }) => gl);
  const gpgpu = useRef<GPGpu | null>(null);
  const [isActive, setIsActive] = useState(false);

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
    if (!gpgpu.current) {
      const gpgpuRenderer = new GPUComputationRenderer(
        fboSize,
        fboSize,
        renderer,
      );
      const gpgpuTexture = gpgpuRenderer.createTexture();
      const gpgpuVariable = gpgpuRenderer.addVariable(
        "uParticles",
        gpgpuParticlesShader,
        gpgpuTexture,
      );
      gpgpuRenderer.setVariableDependencies(gpgpuVariable, [gpgpuVariable]);

      gpgpu.current = {
        renderer: gpgpuRenderer,
        texture: gpgpuTexture,
        variable: gpgpuVariable,
      };
    }
    return () => {
      gpgpu.current?.renderer.dispose();
      gpgpu.current?.texture.dispose();
      gpgpu.current = null;
    };
  }, [renderer, fboSize]);

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
        console.error("[GPGPU] Init called before GPGpu Renderer creation");
        return null;
      }
      if (isActive) {
        console.warn("[GPGPU] Init skipped because GPGpu already active");
        return null;
      }
      gpgpu.current.texture.image.data.set(positions);
      gpgpu.current.variable.material.uniforms.uBase = new Uniform(
        gpgpu.current.texture,
      );
      gpgpu.current.renderer.init();
      const texture = getTexture();
      setIsActive(true);
      return texture ?? null;
    },
    [getTexture, isActive],
  );

  const updateUniforms = useCallback((uniforms: Record<string, Uniform>) => {
    if (!gpgpu.current) return;
    for (const [name, value] of Object.entries(uniforms)) {
      gpgpu.current.variable.material.uniforms[name] = value;
    }
  }, []);

  const compute = useCallback(() => {
    if (!gpgpu.current) {
      console.error("[GPGPU] Compute called before initialization");
      return null;
    }
    if (!isActive) {
      console.warn("[GPGPU] Compute skipped because state is idle");
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
