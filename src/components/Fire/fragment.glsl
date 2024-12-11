#define SQRT_3_OVER_3 0.57735 // tan(30) = sqrt(3) / 3, defines the slope of the hexagon's longer diagonal edges
#define SQRT_3 1.1547 // tan(60) = sqrt(3), defines the slope of the hexagon's shorter diagonal edges
#define COS_30_DEG 0.866025
#define SIN_30_DEG 0.5
#define PI 3.14159265358979323846

uniform float uTime;

// Varyings
varying vec3 vPosition;

float getHexagonalMaskFactor() {
    // gl_PointCoord goes from (0, 0) at the bottom-left corner to (1, 1) at the top-right corner
    // Remap it so the origin is at the center, going from (-1, -1) to (1, 1)
    vec2 uv = gl_PointCoord * 2.0 - 1.0;

    // Reflect coordinates into the positive quadrant for symmetry
    // This simplifies the math because the hexagon is symmetric
    uv = abs(uv);

    // Rotate UV coordinates by 30 degrees to have pointy vertices up and down (closest vertex is at 30deg)
    uv = vec2(
        COS_30_DEG * uv.x - SIN_30_DEG * uv.y,
        SIN_30_DEG * uv.x + COS_30_DEG * uv.y
    );

    // Hexagon geometry
    // - Two vertical boundaries are at x = -1 and x = 1, handled by uv.x automatically being in [0, 1].
    // - Four diagonal boundaries define the rest of the hexagon:
    //   1. Boundaries for the side edges:
    //      These edges run at an angle of 30° to the horizontal.
    //      The condition combines both uv.x (horizontal position) and uv.y (vertical position).
    //      This ensures that the side edges intersect correctly with the diagonal edges.
    //      Without this condition the side edges would be at the extremes of the particle
    //      making the hexagonal shape non-equilateral and stretched.
    //      Formula: uv.x + uv.y * sqrt(3)/3
    //
    //   2. Boundaries for the diagonal edges:
    //      These edges connect the hexagon vertices directly and run at an angle of 60° to the horizontal.
    //      Only uv.y (vertical position) matters because these boundaries follow the steeper diagonals.
    //      Formula: uv.y * sqrt(3)

    // Calculate the boundary for the side edges (30° lines)
    float sideBoundary = uv.x + uv.y * SQRT_3_OVER_3;

    // Calculate the boundary for the diagonal edges (60° lines)
    float diagonalBoundary = uv.y * SQRT_3;

    // Hexagonal mask: the point is inside the hexagon if it satisfies both conditions
    float mask = max(sideBoundary, diagonalBoundary);

    // Used with smoothstep to define transparency
    return mask;
}

// void main()
// {
//     vec3 fireBaseColor = vec3(0.97, 0.97, 0.49); // Yellow/white (hottest)
//     vec3 fireTipColor = vec3(1.0, 0.1, 0.0);  // Red (cooler)

//     vec3 corePosition = vec3(0.0, 0.2, 0.0);
//     float distFromCore = length(vPosition - corePosition);

//     float gradient = smoothstep(-0.5, 2.5, distFromCore);

//     vec3 fireColor = mix(fireBaseColor, fireTipColor, gradient);
//     fireColor *= 0.3; // Dim fire color to avoid overexposure due to blending

//     float maskFactor = getHexagonalMaskFactor();

//     float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);

//     gl_FragColor = vec4(fireColor, alpha);
// }

void main()
{
    vec3 fireBaseColor = vec3(0.97, 0.97, 0.49);
    vec3 fireTipColor = vec3(1.0, 0.1, 0.0);

    // Define the core line parameters
    float R = 0.05;     // Major radius of the donut's core line
    float coreY = 0.25; // Vertical position of the core line

    // Compute angle from the origin in XZ plane
    vec2 xz = vPosition.xz;
    float angle = atan(xz.y, xz.x);

    // Ensure angle is within [0, PI]
    // If angle < 0, add PI: negCorrection = 1 when angle<0, else 0
    float negCorrection = 1.0 - step(0.0, angle); 
    angle += negCorrection * PI;
    angle = clamp(angle, 0.0, PI);

    vec3 corePoint = vec3(R * cos(angle), coreY, R * sin(angle));
    float distFromCore = length(vPosition - corePoint);

    // Create gradient from core (yellow-white) to outside (red)
    float gradient = smoothstep(-0.5, 3.25, distFromCore);
    vec3 fireColor = mix(fireBaseColor, fireTipColor, gradient);
    fireColor *= 0.65;

    float maskFactor = getHexagonalMaskFactor();
    float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);

    gl_FragColor = vec4(fireColor, alpha);
}