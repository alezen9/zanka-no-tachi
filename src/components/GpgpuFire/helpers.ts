import { Vector3, CatmullRomCurve3, MathUtils } from "three";

const BASE_HEIGHT_MIN = 0;
const BASE_HEIGHT_MAX = 1.5;
const MIN_PARTICLE_SIZE = 0.3;
const MAX_PARTICLE_SIZE = 1;
const SPINE_PADDING = 0.3;

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
    // Random values to determine particle placement and offset
    const theta = Math.random(); // Random point along curve's length (from 0 to 1)
    const phi = Math.random(); // Random vertical scaling factor (0 at the bottom, 1 at the top)
    const rho = (Math.random() - 0.5) * 2 * 1.5; // Random radial offset for spread (-1.5 to 1.5)

    // Get position and tangent (curve direction) from the spline
    const spinePosition = fireCurve.getPoint(theta);
    const tangent = fireCurve.getTangent(theta).normalize();

    // Compute perpendicular vector to tangent in XZ plane
    // Used to offset the particle radially from the curve
    const normal = new Vector3(0, 1, 0).cross(tangent).normalize();

    // Compute tapering to simulate the narrowing and widening of the fire shape
    const taperFactor = 1 - Math.abs(theta - 0.5) * 2; // Max taper at the center of the curve
    const baseHeight =
      BASE_HEIGHT_MIN + (BASE_HEIGHT_MAX - BASE_HEIGHT_MIN) * taperFactor;
    const y = phi * baseHeight * 0.5;

    // Compute the radial spread factor (horizontal factor decreases with height)
    const horizontalFactor = 0.5 * (1 - phi); // Wider at the base, narrower near the top
    const irregularity = (Math.random() - 0.5) * 0.2 * (1 - phi); // Slight randomness to spread
    const radialOffset = rho * horizontalFactor + irregularity;

    const particlePosition = spinePosition
      .clone()
      .addScaledVector(normal, radialOffset) // Spread the particle around the curve
      .setY(y); // Set the vertical position

    // Apply padding to the theta value to prevent particles from clustering at the edges
    const paddedTheta = MathUtils.mapLinear(
      theta,
      0,
      1,
      0 + SPINE_PADDING,
      1 - SPINE_PADDING,
    );
    const paddedSpinePosition = fireCurve.getPoint(paddedTheta);

    // Used to scale the particle size based on its proximity to the spine
    const distance = paddedSpinePosition.distanceTo(particlePosition);

    // Size factor based on how far the particle is from the spine
    const sizeFactor = MathUtils.clamp(1 - distance / BASE_HEIGHT_MAX, 0, 1);

    // Compute the base size of the particle, scaled between min and max size
    const baseSize = MathUtils.lerp(
      MIN_PARTICLE_SIZE,
      MAX_PARTICLE_SIZE,
      sizeFactor,
    );

    // Adjust the size using the taper factor for a smooth size gradient along the curve
    const size = baseSize * (0.8 + 0.2 * taperFactor); // Taper influences the size without reducing it below baseSize

    data.set([...particlePosition, size], i * 4);
  }
  return data;
};
