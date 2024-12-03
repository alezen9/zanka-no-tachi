import { useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DataTexture,
  FloatType,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Uniform,
} from "three";
import gpgpuFragmentShader from "./gpgpuFragmentShader.glsl";

type Params = {
  totalParticleCount: number;
};

const useGPGPU = ({ totalParticleCount }: Params) => {
  const [animationState, setAnimationState] = useState<
    "idle" | "animating" | "done"
  >("idle");
  const isInitialized = useRef(false);

  const renderer = useThree(({ gl }) => gl);
  const size = Math.ceil(Math.sqrt(totalParticleCount));
  const fboA = useFBO(size, size);
  const fboB = useFBO(size, size);
  const fboPingPongState = useRef(false);
  const scene = useRef(new Scene());
  const camera = useRef(new OrthographicCamera(-1, 1, 1, -1, 0.1, 1)); // 0.1 instead of 0 to avoid potential depth calculation errors
  const material = useRef(
    new ShaderMaterial({
      uniforms: {
        uParticleData: new Uniform(null), // Placeholder
        uTime: new Uniform(0),
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: gpgpuFragmentShader,
    }),
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    material.current.uniforms.uTime.value = time;
  });

  useEffect(() => {
    const quad = new Mesh(new PlaneGeometry(2, 2), material.current);
    scene.current.add(quad);
  }, []);

  const initializeStartingPositions = useCallback(
    (initialPositions: Float32Array) => {
      if (initialPositions.length !== totalParticleCount * 4) {
        console.error(
          "Initial positions array length must match totalParticleCount * 4.",
        );
        return;
      }
      const initialTexture = new DataTexture(
        initialPositions,
        size,
        size,
        RGBAFormat,
        FloatType,
      );
      initialTexture.needsUpdate = true;

      material.current.uniforms.uParticleData.value = initialTexture;
      isInitialized.current = true;

      setAnimationState("animating");
    },
    [size, totalParticleCount],
  );

  const computeSimulation = useCallback(
    (time: number) => {
      if (!isInitialized.current) {
        console.error(
          "GPGPU system is not initialized. Call initializeStartingPositions() first.",
        );
        return null;
      }

      material.current.uniforms.uTime.value = time;

      // Alternate between FBOs
      const readFBO = fboPingPongState.current ? fboA : fboB; // Read from the inactive FBO
      const writeFBO = fboPingPongState.current ? fboB : fboA; // Write to the active FBO

      // Set the input texture for the compute shader
      material.current.uniforms.uParticleData.value = readFBO.texture;

      // Render the compute shader to the write FBO
      renderer.setRenderTarget(writeFBO);
      renderer.render(scene.current, camera.current);
      renderer.setRenderTarget(null);

      // Swap FBOs
      fboPingPongState.current = !fboPingPongState.current;

      // Return the texture to use for rendering
      return writeFBO.texture;
    },
    [renderer, fboA, fboB],
  );

  return { computeSimulation, initializeStartingPositions, animationState };
};

export default useGPGPU;
