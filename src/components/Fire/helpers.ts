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

  // Symmetrical spike pattern with slight elevation for edge spikes
  const spikes = [
    { position: 0.0, height: 0.02 }, // Starts slightly above ground
    { position: 0.1, height: 0.1 },
    { position: 0.25, height: 0.2 },
    { position: 0.5, height: 0.25 }, // Tallest spike in the center
  ];

  // Symmetrize `t` to reflect around the center
  const mirroredT = t <= 0.5 ? t : 1 - t;

  // Find closest spike and calculate height offset
  const closestSpike = spikes.reduce((prev, curr) =>
    Math.abs(curr.position - mirroredT) < Math.abs(prev.position - mirroredT)
      ? curr
      : prev,
  );
  const spikeHeight = Math.max(
    0,
    closestSpike.height *
      (1 - Math.abs(mirroredT - closestSpike.position) * 10),
  );

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

const computeFireParticleSize = (
  position: Vector3Tuple,
  scale: number,
): number => {
  const [x, y, z] = position;

  // Compute the distance from the central Y-axis
  const distFromAxis = Math.sqrt(x * x + z * z);

  // Define the maximum distance at which particles are still "large"
  const maxDist = 3.5; // Adjust this based on the flame's width
  const normalizedDist = Math.min(distFromAxis / maxDist, 1);

  // Compute the vertical shrinking factor
  const maxHeight = 2.0; // Maximum height of the flame
  const verticalFactor = Math.max(0, 1 - y / maxHeight); // Shrink size as y increases

  // Combine the distance-based size and vertical shrinking
  const size = (1 - normalizedDist) * verticalFactor * scale;

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
