#include ../../../utils/shaders/simplexNoise/simplexNoise.glsl

attribute vec4 aParticle;

uniform float uTime;
uniform float uScale;

varying float vSize;

void main()
{
    vec3 position = aParticle.xyz;
    float size = aParticle.w;
    vSize = size;

    // Apply parabolic base along z-axis to follow the blade
    float parabola = 1.5 * position.z * position.z;
    position.y += parabola;

    // Add noise-based upward movement with looping
    float noise = simplexNoise2d(position.xz);
    noise = (noise + 1.0) * 0.5;
    position.y += mod(uTime + position.y, noise * 2.0);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = size * uScale;
    gl_PointSize *= (1.0 / -viewPosition.z); // Perspective fix
}
