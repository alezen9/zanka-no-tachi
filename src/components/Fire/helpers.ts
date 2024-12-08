import {
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3,
  Vector3Tuple,
} from "three";
import { computeParticleUvs } from "./useGPGpu";

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

export const createFireSharedBufferGeometryAndPositions = (
  count: number,
  scale: number,
) => {
  const geometry = new BufferGeometry();
  geometry.setDrawRange(0, count);
  geometry.boundingSphere = new Sphere(new Vector3(0), 1);

  const particleUvs = computeParticleUvs(count);

  const uvsAttribute = new BufferAttribute(particleUvs, 2);
  geometry.setAttribute("aParticlesUv", uvsAttribute);

  const initialPositionsAndSize = computeInitialParticlePositions(count, scale);

  return {
    geometry,
    initialPositionsAndSize,
  };
};
