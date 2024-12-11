import {
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector2Tuple,
  Vector3,
  Vector3Tuple,
} from "three";
import { computeParticleUvs } from "./useGPGpu";

// Constants
const SPINE_Z_OFFSET = -2;
const BASE_HEIGHT_MIN = 0.05;
const BASE_HEIGHT_MAX = 0.65;

// Helper Functions
const computeSpinePosition = (normalizedTheta: number): Vector2Tuple => {
  const x = 2 * Math.cos(Math.PI * normalizedTheta);
  const z = 8 * (normalizedTheta - 0.5) ** 2 + SPINE_Z_OFFSET;
  return [x, z];
};

const computeTangentAndNormal = (normalizedTheta: number): Vector2Tuple => {
  const tangentX = -2 * Math.PI * Math.sin(Math.PI * normalizedTheta);
  const tangentZ = 16 * (normalizedTheta - 0.5);
  const normalX = tangentZ;
  const normalZ = -tangentX;
  const normalLength = Math.sqrt(normalX ** 2 + normalZ ** 2);
  return [normalX / normalLength, normalZ / normalLength];
};

const computeBaseHeight = (normalizedTheta: number): number => {
  const taperFactor = 1 - Math.abs(normalizedTheta - 0.5) * 2;
  return BASE_HEIGHT_MIN + (BASE_HEIGHT_MAX - BASE_HEIGHT_MIN) * taperFactor;
};

const computeRadialOffset = (rho: number, phi: number): number => {
  const horizontalFactor = 0.6 * (1 - phi);
  const irregularity = (Math.random() - 0.5) * 0.2 * (1 - phi);
  return rho * horizontalFactor + irregularity;
};

// Main Function
const computeFireParticlePosition = (): Vector3Tuple => {
  const theta = Math.random() * Math.PI; // Random angle - used to move along the "spine" curve of the shape
  const phi = Math.random(); // Rndom fraction - vertical fraction along the cross-section of the shape, phi=0 -> bottom, phi=1 -> top
  const rho = (Math.random() - 0.5) * 2; // Radial offset - how far we move radially outward from the central spine

  const normalizedTheta = theta / Math.PI; // Normalize theta to [0, 1]

  // Compute spine curve and tangent/normal
  const [spineX, spineZ] = computeSpinePosition(normalizedTheta);
  const [normalXNorm, normalZNorm] = computeTangentAndNormal(normalizedTheta);

  // Compute heights and radial offset
  const baseHeight = computeBaseHeight(normalizedTheta);
  const y = phi * baseHeight;
  const radialOffset = computeRadialOffset(rho, phi);

  // Final position
  const x = spineX + radialOffset * normalXNorm;
  const z = spineZ + radialOffset * normalZNorm;

  return [x, y, z];
};

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const computeFireParticleSize = (
  position: Vector3Tuple,
  scale: number,
  minEdgeSize: number = 7, // Minimum size for edge particles
  edgeDecreaseRate: number = 12.5, // Rate of size decrease for edges
): number => {
  const [x, y, z] = position;

  // Compute the distance from the central Y-axis
  const distFromAxis = Math.sqrt(x * x + z * z);

  // Define the maximum distance at which particles are still "large"
  const maxDist = 3.5; // Adjust this based on the flame's width
  const normalizedDist = Math.min(distFromAxis / maxDist, 1);

  // Additional size decrease logic for particles closer to the edges (z < 0)
  const edgeStart = -2; // Start decreasing size at z = -2
  const edgeEnd = 0.0; // Fully decrease size at z = 0

  let edgeFactor = smoothstep(edgeEnd, edgeStart, z);
  edgeFactor = Math.max(minEdgeSize, edgeFactor * edgeDecreaseRate);

  // Compute the vertical shrinking factor
  const maxHeight = 1.25; // Maximum height of the flame
  const verticalFactor = Math.max(0.1, 1 - y / maxHeight); // Shrink size as y increases, minimum size 0.1

  // New factor to progressively shrink size as y grows
  const yShrinkFactor = 1 - Math.min(y / maxHeight, 1); // Reduces size linearly as y approaches maxHeight

  // Combine the distance-based size, edge shrinking, and vertical shrinking
  const size =
    (1 - normalizedDist) * verticalFactor * edgeFactor * yShrinkFactor * scale;

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
