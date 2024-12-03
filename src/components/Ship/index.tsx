import { useGLTF } from "@react-three/drei";
import glbModel from "/ship.glb?url";
import {
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Uniform,
  Vector2,
} from "three";
import { useEffect, useMemo, useRef } from "react";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { useFrame, useThree } from "@react-three/fiber";
import gpgpuParticlesShader from "./gpgpu.fragment.glsl";

const uniforms = {
  uSize: new Uniform(0.07),
  uResolution: new Uniform(new Vector2(0, 0)),
  uParticlesTexture: new Uniform(undefined),
};

const Ship = () => {
  const debugMaterial = useRef<MeshBasicMaterial>(null);
  const material = useRef<ShaderMaterial>(null);
  const model = useGLTF(glbModel);
  const geometry = (model.scene.children[0] as Mesh).geometry;
  const count = geometry.attributes.position.count;

  const fboSize = Math.ceil(Math.sqrt(count));
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

  useEffect(() => {
    console.log("hereee");
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      baseParticleTexture.current.image.data[i4 + 0] =
        geometry.attributes.position.array[i3 + 0];
      baseParticleTexture.current.image.data[i4 + 1] =
        geometry.attributes.position.array[i3 + 1];
      baseParticleTexture.current.image.data[i4 + 2] =
        geometry.attributes.position.array[i3 + 2];
      baseParticleTexture.current.image.data[i4 + 3] = Math.random();
    }

    gpgpuComputationRenderer.current.setVariableDependencies(
      gpgpuParticlesVariable.current,
      [gpgpuParticlesVariable.current],
    );

    gpgpuParticlesVariable.current.material.uniforms.uTime = new Uniform(0.0);
    gpgpuParticlesVariable.current.material.uniforms.uDeltaTime = new Uniform(
      0.0,
    );
    gpgpuParticlesVariable.current.material.uniforms.uBase = new Uniform(
      baseParticleTexture,
    );
    gpgpuParticlesVariable.current.material.uniforms.uFlowFieldInfluence =
      new Uniform(0.5);

    gpgpuParticlesVariable.current.material.uniforms.uFlowFieldStrength =
      new Uniform(2);

    gpgpuParticlesVariable.current.material.uniforms.uFlowFieldFrequency =
      new Uniform(0.5);

    gpgpuComputationRenderer.current.init();
    if (!debugMaterial.current) return;
    debugMaterial.current.map =
      gpgpuComputationRenderer.current.getCurrentRenderTarget(
        gpgpuParticlesVariable.current,
      ).texture;
  }, [count, geometry]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!material.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const x = window.innerWidth * dpr;
      const y = window.innerHeight * dpr;
      material.current.uniforms.uResolution.value.set(x, y);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  const { aParticlesUv, aSize } = useMemo(() => {
    const aParticlesUv = new Float32Array(count * 2);
    const aSize = new Float32Array(count);

    for (let y = 0; y < fboSize; y++) {
      for (let x = 0; x < fboSize; x++) {
        const i = y * fboSize + x;
        const i2 = i * 2;
        const uvX = (x + 0.5) / fboSize;
        const uvY = (y + 0.5) / fboSize;

        aParticlesUv[i2 + 0] = uvX;
        aParticlesUv[i2 + 1] = uvY;

        aSize[i] = Math.random();
      }
    }

    return { aParticlesUv, aSize };
  }, [count, fboSize]);

  useFrame(({ clock }, deltaTime) => {
    if (!material.current) return;
    const elapsedTime = clock.getElapsedTime();
    gpgpuParticlesVariable.current.material.uniforms.uTime.value = elapsedTime;
    gpgpuParticlesVariable.current.material.uniforms.uDeltaTime.value =
      deltaTime;

    // GPGPU update
    gpgpuComputationRenderer.current.compute();
    material.current.uniforms.uParticlesTexture.value =
      gpgpuComputationRenderer.current.getCurrentRenderTarget(
        gpgpuParticlesVariable.current,
      ).texture;
  });

  return (
    <group position-y={0.5}>
      <points>
        <bufferGeometry
          drawRange={{
            start: 0,
            count,
          }}
        >
          <bufferAttribute
            attach="attributes-aColor"
            count={count}
            array={geometry.attributes.color.array}
            itemSize={4}
          />
          <bufferAttribute
            attach="attributes-aParticlesUv"
            count={count}
            array={aParticlesUv}
            itemSize={2}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={count}
            array={aSize}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          depthWrite={false}
          transparent
        />
      </points>
      <mesh>
        <planeGeometry />
        <meshBasicMaterial ref={debugMaterial} />
      </mesh>
    </group>
  );
};

export default Ship;
