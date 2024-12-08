import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { DataTexture, Uniform } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";

const PARTICLES_CURRENT_POSITIONS_TEXTURE_UNIFORM_NAME =
  "uParticlesCurrentPositions";

type UseGpgpuConfig = {
  count: number;
};

type GPGpu = {
  renderer: GPUComputationRenderer;
  texture: DataTexture;
  variable: Variable;
};

const useGPGpu = <Uniforms extends Record<string, any>>(
  config: UseGpgpuConfig,
) => {
  const { count } = config;
  const renderer = useThree(({ gl }) => gl);
  const gpgpu = useRef<GPGpu | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      gpgpu.current?.texture.dispose();
      gpgpu.current?.renderer.dispose();
    };
  }, []);

  const updateUniforms = useCallback((partialUniforms: Partial<Uniforms>) => {
    if (!gpgpu.current) return;
    for (const [name, value] of Object.entries(partialUniforms)) {
      gpgpu.current.variable.material.uniforms[name].value = value;
    }
  }, []);

  const getTexture = useCallback(() => {
    if (!gpgpu.current) return;
    const renderTarget = gpgpu.current.renderer.getCurrentRenderTarget(
      gpgpu.current.variable,
    );
    return renderTarget.texture;
  }, []);

  const init = useCallback(
    (positions: Float32Array, uniforms: Uniforms) => {
      if (isActive) return;
      const fboSize = computeFboSize(count);
      const gpgpuRenderer = new GPUComputationRenderer(
        fboSize,
        fboSize,
        renderer,
      );
      const gpgpuTexture = gpgpuRenderer.createTexture();
      gpgpuTexture.image.data.set(positions);
      const gpgpuVariable = gpgpuRenderer.addVariable(
        PARTICLES_CURRENT_POSITIONS_TEXTURE_UNIFORM_NAME,
        gpgpuParticlesShader,
        gpgpuTexture,
      );
      gpgpuRenderer.setVariableDependencies(gpgpuVariable, [gpgpuVariable]);
      for (const [name, value] of Object.entries(uniforms)) {
        gpgpuVariable.material.uniforms[name] = new Uniform(value);
      }
      gpgpuVariable.material.uniforms.uParticlesInitialPositions = new Uniform(
        gpgpuTexture,
      );

      const error = gpgpuRenderer.init();
      if (error) throw new Error(error);

      gpgpu.current = {
        renderer: gpgpuRenderer,
        texture: gpgpuTexture,
        variable: gpgpuVariable,
      };

      setIsActive(true);
    },
    [isActive, count, renderer],
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
    isGpgpuActive: isActive,
  };
};

export default useGPGpu;

/**
 * ############################## Helpers ##############################
 */

const computeFboSize = (count: number) => Math.ceil(Math.sqrt(count));

export const computeParticleUvs = (count: number) => {
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
