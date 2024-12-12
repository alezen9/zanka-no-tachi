import { Vector3, CatmullRomCurve3, MathUtils } from "three";

const BASE_HEIGHT_MIN = 0;
const BASE_HEIGHT_MAX = 1.5;
const MIN_PARTICLE_SIZE = 0.1;
const MAX_PARTICLE_SIZE = 1;

// U-shaped control points
const SPINE_CONTROL_POINTS = [
  new Vector3(-1.75, 0.15, 0),
  new Vector3(-1.6, 0.1, -1),
  new Vector3(0, 0.025, -1.75),
  new Vector3(1.6, 0.1, -1),
  new Vector3(1.75, 0.15, 0),
];

// Create the Catmull-Rom spline curve
const fireCurve = new CatmullRomCurve3(
  SPINE_CONTROL_POINTS,
  false,
  "catmullrom",
);

// Visualise curve
// const points = fireCurve.getPoints(50);
// const geometry = new BufferGeometry().setFromPoints(points);

// const material = new LineBasicMaterial({ color: 0xff0000 });

// // Create the final object to add to the scene
// export const curveObject = new Line(geometry, material);

export const computeInitialParticlePositionsAndSize = (count: number) => {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const theta = Math.random(); // Random horizontal point on curve (0 start of curve, 1 end of curve)
    const phi = Math.random(); // Random vertical factor (0 to 1)
    const rho = (Math.random() - 0.5) * 2 * 1.5; // Random radial offset (-1 to 1)

    // Get position and tangent from the spline
    const spinePosition = fireCurve.getPoint(theta);
    const tangent = fireCurve.getTangent(theta).normalize();

    // Compute the normal vector
    const normal = new Vector3(0, 1, 0).cross(tangent).normalize();

    // Compute base height and vertical position
    const taperFactor = 1 - Math.abs(theta - 0.5) * 2; // Normalized tapering factor
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

    const distance = spinePosition.distanceTo(particlePosition);

    // Map distance to size, proportional to max size at this theta
    const sizeFactor = MathUtils.clamp(
      1 - distance / (1 * BASE_HEIGHT_MAX), // Normalize distance to a 0-1 range
      MIN_PARTICLE_SIZE, // Min factor for size
      MAX_PARTICLE_SIZE, // Max factor for size
    );
    const size = taperFactor * sizeFactor;

    data.set([...particlePosition, size], i * 4);
  }
  return data;
};
