import {
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3,
  CatmullRomCurve3,
  LineBasicMaterial,
  Line,
  MathUtils,
} from "three";
import { computeParticleUvs } from "./useGPGpu";

// Constants
const BASE_HEIGHT_MIN = 0;
const BASE_HEIGHT_MAX = 1.5;
const MIN_PARTICLE_SIZE = 0.1;
const MAX_PARTICLE_SIZE = 1;
const SPINE_PADDING = 0.1;

// Proper U-shaped control points
const SPINE_CONTROL_POINTS = [
  new Vector3(-1.75, 0.15, 0),
  new Vector3(-1.6, 0.1, -1),
  new Vector3(0, 0.025, -1.75),
  new Vector3(1.6, 0.1, -1),
  new Vector3(1.75, 0.15, 0),
];

// Create the Catmull-Rom spline curve
const spineCurve = new CatmullRomCurve3(
  SPINE_CONTROL_POINTS,
  false,
  "catmullrom",
);

const points = spineCurve.getPoints(50);
const geometry = new BufferGeometry().setFromPoints(points);

const material = new LineBasicMaterial({ color: 0xff0000 });

// Create the final object to add to the scene
export const curveObject = new Line(geometry, material);

const computeInitialParticlePositionsAndSize = (count: number) => {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const theta = Math.random(); // Random value along the spine curve (0 to 1).
    const phi = Math.random(); // Random vertical factor (0 to 1).
    const rho = (Math.random() - 0.5) * 2; // Random radial offset (-1 to 1).

    // Get position and tangent from the spline
    const spinePosition = spineCurve.getPoint(theta);
    const tangent = spineCurve.getTangent(theta).normalize();

    // Compute the normal vector
    const normal = new Vector3(0, 1, 0).cross(tangent).normalize();

    // Compute base height and vertical position
    const taperFactor = 1 - Math.abs(theta - 0.5) * 2; // Normalized tapering factor.
    const baseHeight =
      BASE_HEIGHT_MIN + (BASE_HEIGHT_MAX - BASE_HEIGHT_MIN) * taperFactor;
    const y = phi * baseHeight * 0.5;

    // Compute radial offset
    const horizontalFactor = 0.5 * (1 - phi);
    const irregularity = (Math.random() - 0.5) * 0.2 * (1 - phi);
    const radialOffset = rho * horizontalFactor + irregularity;

    // Add radial offset along the normal to the spine position
    const particlePosition = spinePosition
      .clone()
      .addScaledVector(normal, radialOffset)
      .setY(y);

    // Compute the distance from the particle to the spine (core)
    const paddedTheta = MathUtils.mapLinear(
      theta,
      0,
      1,
      0 + SPINE_PADDING,
      1 - SPINE_PADDING,
    );
    const paddedSpinePosition = spineCurve.getPoint(paddedTheta);

    const distance = paddedSpinePosition.distanceTo(particlePosition);

    // Map distance to size, proportional to max size at this theta
    const sizeFactor = MathUtils.clamp(
      1 - distance / (0.75 * BASE_HEIGHT_MAX), // Normalize distance to a 0-1 range
      MIN_PARTICLE_SIZE, // Min factor for size
      MAX_PARTICLE_SIZE, // Max factor for size
    );
    const size = taperFactor * sizeFactor;

    data.set([...particlePosition, size], i * 4);
  }
  return data;
};

export const createFireSharedBufferGeometryAndPositions = (count: number) => {
  const geometry = new BufferGeometry();
  geometry.setDrawRange(0, count);
  geometry.boundingSphere = new Sphere(new Vector3(0), 1);

  const particleUvs = computeParticleUvs(count);

  const uvsAttribute = new BufferAttribute(particleUvs, 2);
  geometry.setAttribute("aParticlesUv", uvsAttribute);

  const initialPositionsAndSize = computeInitialParticlePositionsAndSize(count);

  return {
    geometry,
    initialPositionsAndSize,
  };
};
