#include ../../../utils/shaders/simplexNoise/simplexNoise.glsl

attribute vec4 aParticle;

uniform float uTime;
uniform float uScale;

varying vec3 vColor;

void main()
{
    vec3 position = aParticle.xyz;
    float size = aParticle.w;

    // Rotation angle in radians
    float theta = radians(-110.0);
    // Rotation matrix for z-y plane
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    // Rotate z and y
    float zRotated = cosTheta * position.z - sinTheta * position.y;
    float yRotated = sinTheta * position.z + cosTheta * position.y;
    // Apply parabolic effect in rotated space to match katana curvature
    float parabola = 2.0 * zRotated * zRotated;
    position.y = yRotated + parabola;

    // Add noise-based upward movement with looping
    float verticalNoise = simplexNoise2d(vec2(position.x, position.z));
    verticalNoise = (verticalNoise + 1.0) * 0.5;
    position.y += mod(uTime + position.y, verticalNoise * 2.0);

    // Add wavering on xz axes
    float horizontalNoise =  simplexNoise2d(vec2(verticalNoise, uTime * 0.5 * size)) * 0.075;
    position.x += sin(horizontalNoise * 2.0);
    position.z += cos(horizontalNoise * 5.0) - 1.0;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = size * uScale;
    gl_PointSize *= (1.0 / -viewPosition.z); // Perspective fix

    // Vary the color shade based on noise
    float shadeFactor = simplexNoise2d(position.xz);
    shadeFactor = (shadeFactor + 1.0) * 0.5;

    // Interpolate between yellow and red
    vec3 fireCoreColor = vec3(0.58, 0.55, 0.4);
    vec3 fireRedColor = vec3(0.76, 0.27, 0.09);
    vColor = mix(fireCoreColor, fireRedColor, shadeFactor);
}
