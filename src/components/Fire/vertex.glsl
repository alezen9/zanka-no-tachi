#include ../../utils/shaders/simplexNoise/simplexNoise4d.glsl

uniform float uTime;
uniform float uLifetime;
uniform float uScale;

varying vec3 vPosition;

attribute float aSize;

void main() {
    vPosition = position;

    // Modulo time to loop particle lifetime and reset them over time
    float lifetime = mod(uTime + position.y, uLifetime);

    // Base shaping: radial taper with noise
    vec3 newPosition = position;
    float taper = 1.0 - smoothstep(0.0, 2.3, position.y);
    taper += simplexNoise4d(vec4(position * 20.0, uTime * 0.1)) * 0.1; // Add randomness
    newPosition.x *= taper;
    newPosition.z *= taper;

    // Noise-based displacement
    float noise = simplexNoise4d(vec4(position * 2.0, lifetime * 0.1));
    newPosition.x += noise * 0.1;
    newPosition.y += noise * 0.85;
    newPosition.z += noise * 0.1;

    // Upward motion with looping
    newPosition.y += mod(lifetime, uLifetime) * 0.5;

    // Add sinusoidal ascensional motion
    float sinFactor = sin(newPosition.y * 4.2 + uTime) * 0.05;
    newPosition.x += sinFactor;
    newPosition.z += cos(newPosition.y * 1.5 + uTime) * 0.05;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = aSize * uScale * 10.0;
}
