import {
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3,
  Vector3Tuple,
} from "three";
import GpgpuFire from "../GpgpuFire";
import { computeParticleUvs } from "../GpgpuFire/useGPGpu";

const PARTICLES_COUNT = 5000;
const PARTICLE_SCALE = 1200;

/**
 * ############################## Helpers ##############################
 */

const computeFireParticlePosition = (): Vector3Tuple => {
  // Random angle and radius for circular distribution
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * 1.5; // Random radius, sqrt for even distribution

  // Convert polar coordinates to Cartesian for xz-plane
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.random() * 1.66; // y position remains the same

  return [x, y, z];
};

const computeFireParticleSize = (position: Vector3Tuple, scale: number) => {
  const [x, y, z] = position;
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
  const size = (1 - normalizedDist) * scale;
  return size;
};

const computeInitialParticlePositions = (count: number, scale: number) => {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const position = computeFireParticlePosition();
    const size = computeFireParticleSize(position, scale);
    data.set([...position, size], i * 4);
  }
  return data;
};

const fireGeometry = new BufferGeometry();
fireGeometry.setDrawRange(0, PARTICLES_COUNT);
fireGeometry.boundingSphere = new Sphere(new Vector3(0), 1);

const particleUvs = computeParticleUvs(PARTICLES_COUNT);

const uvsAttribute = new BufferAttribute(particleUvs, 2);
fireGeometry.setAttribute("aParticlesUv", uvsAttribute);

const initialPositionsAndSize = computeInitialParticlePositions(
  PARTICLES_COUNT,
  PARTICLE_SCALE,
);

const GpgpuFireArea = () => {
  return (
    <group scale={[5, 6, 5]} position-y={-1}>
      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[0, 0, -3.5]}
        scale={[2, 1.2, 1]}
      />

      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[-1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
      />
      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[-2, 0, -1.5]}
        scale={[1, 0.9, 1]}
      />
      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[-3, 0, -0.5]}
        scale={[1, 0.6, 2]}
      />

      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
      />
      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[2, 0, -1.5]}
        scale={[1, 0.9, 1]}
      />
      <GpgpuFire
        geometry={fireGeometry}
        particlesCount={PARTICLES_COUNT}
        initialPositionsAndSize={initialPositionsAndSize}
        position={[3, 0, -0.5]}
        scale={[1, 0.6, 2]}
      />
    </group>
  );
};

export default GpgpuFireArea;
