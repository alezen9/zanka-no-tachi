#include ../../utils/shaders/simplexNoise/simplexNoise4d.glsl

uniform float uTime;
uniform float uLifetime;
uniform float uAnimationSpeed;

varying vec3 vPosition;

attribute float aSize;
attribute float aIntensity;

void main() {
    vPosition = position;
    float intensity = uTime * aIntensity;

    // Modulo time to loop particle lifetime and reset them over time
    float lifetime = mod(intensity + position.y, uLifetime);

    // Base shaping: radial taper with noise
    vec3 newPosition = position;
    float taper = 1.0 - smoothstep(0.0, 2.3, position.y);
    taper += simplexNoise4d(vec4(position, intensity * 0.4)) * 0.3; // Add randomness
    newPosition.x *= taper;
    newPosition.z *= taper;

    // Noise-based displacement
    float noise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
    newPosition.x += noise * 0.1;
    newPosition.y += noise * 0.85;
    newPosition.z += noise * 0.1;

    // Upward motion with looping
    newPosition.y += mod(lifetime, uLifetime) * 0.5;

    // Add sinusoidal ascensional motion
    float sinFactor = sin(newPosition.y * noise + intensity) * 0.05;
    newPosition.x += sinFactor;
    newPosition.z += cos(newPosition.y * noise + intensity) * 0.05;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    gl_PointSize = aSize;

    // Fix perspective size
    gl_PointSize *= (1.0 / -viewPosition.z);
}
