import {
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3,
  Vector3Tuple,
} from "three";
import { computeParticleUvs } from "./useGPGpu";

const computeFireParticlePosition = (): Vector3Tuple => {
  const theta = Math.random() * Math.PI; // Angular position around the center
  const phi = Math.random(); // Vertical fraction [0, 1]
  const rho = (Math.random() - 0.5) * 2; // Radial offset [-1, 1]

  const t = theta / Math.PI; // Normalized range [0, 1]

  // Spine path along XZ plane
  const spineX = 2 * Math.cos(Math.PI * t);
  const spineZ = 8 * (t - 0.5) ** 2 - 2;

  // Tangent vector for the curve
  const tangentX = -2 * Math.PI * Math.sin(Math.PI * t);
  const tangentZ = 16 * (t - 0.5);

  // Normalized normal vector (perpendicular to tangent)
  const normalX = tangentZ;
  const normalZ = -tangentX;
  const normalLength = Math.sqrt(normalX ** 2 + normalZ ** 2);
  const normalXNorm = normalX / normalLength;
  const normalZNorm = normalZ / normalLength;

  const spikeHeight = 0;

  // Vertical position with slight elevation for edge spikes
  const baseHeight = 0.05 + 0.6 * (1 - Math.abs(t - 0.5) * 2); // Taller at the center
  const y = phi * (baseHeight + spikeHeight);

  // Radial (horizontal) offset
  const horizontalFactor = 0.6 * (1 - phi); // Narrower at the top
  const irregularity = (Math.random() - 0.5) * 0.2 * (1 - phi);
  const radialOffset = rho * horizontalFactor + irregularity;

  // Final position with radial offset applied
  const x = spineX + radialOffset * normalXNorm;
  const z = spineZ + radialOffset * normalZNorm;

  return [x, y, z];
};

// Custom smoothstep implementation
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
