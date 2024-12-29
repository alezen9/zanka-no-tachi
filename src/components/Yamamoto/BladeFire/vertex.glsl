#include ../../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.3

attribute vec4 aParticle;

uniform float uTime;
uniform float uScale;

varying float vSize;

void main()
{
    vec3 position = aParticle.xyz;
    float size = aParticle.w;
    vSize = size;

    float noise = simplexNoise2d(position.xz);
    noise = (noise + 1.0) * 0.5;

    // Upward movement with looping (mod for repeating motion + noise to create simple spikes)
    position.y += mod(uTime + position.y, LIFESPAN * noise * 5.0);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = size * uScale;
    gl_PointSize *= (1.0 / -viewPosition.z); // Perspective fix

}
