import { PointsProps, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  MathUtils,
  Points,
  ShaderMaterial,
  Sphere,
  Texture,
  Uniform,
  Vector2,
  Vector3,
} from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import useGPGpu, { computeParticleUvs } from "./useGPGpu";
import { computeInitialParticlePositionsAndSize } from "./helpers";
import usePositionalAudio from "../../hooks/usePositionalAudio";
import shikaiAudioFileUrl from "/shikai.mp3?url";
import bankaiAudioFileUrl from "/bankai.mp3?url";
import useInterfaceStore from "../../stores/useInterfaceStore";

const PARTICLES_COUNT = 5000 * 10;
const PARTICLES_SCALE_MULTIPLIER = 1150;
const CONVERGENCE_POSITION = new Vector3(0, 0.25, 0);

const particleUvs = computeParticleUvs(PARTICLES_COUNT);
const initialPositionsAndSize =
  computeInitialParticlePositionsAndSize(PARTICLES_COUNT);

const uniforms = {
  uResolution: new Uniform(new Vector2(0)),
  uParticlesCurrentPositions: new Uniform(new Texture() as Texture | undefined),
  uTime: new Uniform(0),
  uScale: new Uniform(0),
};

enum Phase {
  Shikai,
  Bankai,
}

type GpgpuUniforms = {
  uTime: number;
  uPhase: Phase;
  uSeed: number;
  uConvergencePosition: Vector3;
  uBankaiStartTime: number;
};

const GpgpuFire = (props: PointsProps) => {
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);
  const clock = useThree(({ clock }) => clock);
  const isBankaiActive = useInterfaceStore((state) => state.isBankaiActive);

  const { initGpgpu, computeGpgpu, updateGpgpuUniforms, isGpgpuActive } =
    useGPGpu<GpgpuUniforms>({
      count: PARTICLES_COUNT,
    });

  const shikai = usePositionalAudio({ url: shikaiAudioFileUrl, loop: true });
  const bankai = usePositionalAudio({ url: bankaiAudioFileUrl });

  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe(
      async (state, prevState) => {
        await shikai.toggleMute(!state.isAudioActive);
        await bankai.toggleMute(!state.isAudioActive);
        await shikai.togglePlay(!state.isBankaiActive);
        if (state.isBankaiActive !== prevState.isBankaiActive)
          await bankai.togglePlay(state.isBankaiActive);
      },
    );
    return () => {
      unsubscribe();
    };
  }, [shikai, bankai]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const bankaiAnimationDurationInMs = 1000;

    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        if (!pointsRef.current) return;

        // Immediately set visibility to true while the animation runs
        pointsRef.current.visible = true;

        // Schedule visibility toggle after bankaiAnimationDurationInMs
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!pointsRef.current) return;
          pointsRef.current.visible = !state.isBankaiActive;
        }, bankaiAnimationDurationInMs);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isGpgpuActive) return;
    initGpgpu(initialPositionsAndSize, {
      uTime: 0,
      uPhase: Phase.Shikai,
      uSeed: (Math.random() - 0.5) * 4,
      uConvergencePosition: new Vector3(0, 0, 0),
      uBankaiStartTime: 0,
    });
  }, [initGpgpu, isGpgpuActive]);

  useEffect(() => {
    const localConvergencePosition =
      pointsRef.current!.worldToLocal(CONVERGENCE_POSITION);
    updateGpgpuUniforms({
      uPhase: isBankaiActive ? Phase.Bankai : Phase.Shikai,
      uConvergencePosition: localConvergencePosition,
      ...(isBankaiActive && { uBankaiStartTime: clock.getElapsedTime() }),
    });
  }, [isBankaiActive, updateGpgpuUniforms, clock]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!pointsRef.current) return;

      const dpr = window.devicePixelRatio;
      const baseHeight = 1080; // Reference vertical resolution
      const verticalScale = window.innerHeight / baseHeight;

      // Final scale combining vertical scaling and DPR adjustment
      const finalScale = dpr * verticalScale;

      uniforms.uScale.value =
        MathUtils.clamp(finalScale, 0.1, 2.0) * PARTICLES_SCALE_MULTIPLIER;
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !isGpgpuActive) return;
    const elapsedTime = clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;

    updateGpgpuUniforms({
      uTime: elapsedTime,
    });

    const texture = computeGpgpu();
    uniforms.uParticlesCurrentPositions.value = texture;
  });

  return (
    <points {...props} ref={pointsRef}>
      <bufferGeometry
        boundingSphere={new Sphere(new Vector3(0), 1)}
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
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        blending={AdditiveBlending}
        transparent
      />
    </points>
  );
};

export default GpgpuFire;
