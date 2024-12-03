#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.6

uniform float uTime;
uniform sampler2D uBase;

vec4 computeFireAnimation(vec2 uv){
    // Reference the base positions
    vec4 particle = texture(uBase, uv);
    
    vec3 position = particle.xyz;
    float size = particle.w;
    
    // Modulo time to loop particle lifetime and reset them over time
    float intensity = uTime * size * 0.05;
    float lifetime = mod(intensity, LIFESPAN);

    // Base shaping, radial taper with noise
    vec3 newPosition = position;
    float taper = 1.0 - smoothstep(0.0, 2.1, position.y);
    taper += simplexNoise4d(vec4(position, intensity * 0.4)) * 0.1;
    newPosition.x *= taper;
    newPosition.z *= taper;

    // Noise-based displacement
    float noise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
    newPosition.x += noise * 0.1;
    newPosition.y += noise * (sin(uTime * 0.3 + size * 5.0)) * 1.2;
    newPosition.z += noise * 0.1;

    // Upward motion with looping
    newPosition.y += mod(lifetime, LIFESPAN) * 0.5;

    return vec4(newPosition, size);
}



vec4 computeConvergenceAnimation(vec2 uv){
    // Reference the up-to-date positions
    vec4 position = texture(uParticles, uv);
    return position;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 particle = computeFireAnimation(uv);

    gl_FragColor = particle;
}

