#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.6

uniform float uTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;

vec4 computeFireAnimation(vec2 uv) {
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Modulo time to loop particle lifetime and reset them over time
    float intensity = uTime * size * 0.05;
    float lifetime = mod(intensity, LIFESPAN);

    // Base shaping, radial taper with noise
    float taper = 1.0 - smoothstep(0.0, 2.3, position.y);
    taper += simplexNoise4d(vec4(position, intensity * 0.4)) * 0.1;
    position.x *= taper;
    position.z *= taper;

    // Noise-based displacement
    float noise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
    position.x += noise * 0.1;
    position.y += noise * (sin(uTime * 0.3 + size * 5.0)) * 1.2;
    position.z += noise * 0.1;

    // Add wavering motion only for particles above a certain height
    float heightFactor = smoothstep(0.5, 1.5, position.y); // Gradually apply wavering above 0.5
    float waveFrequency = 2.5 + uSeed * 0.5;               // Frequency varies per fire
    float waveAmplitude = 0.15 + uSeed * 0.05;             // Amplitude varies per fire

    float waveNoise = simplexNoise4d(vec4(position * 1.5 + uSeed, lifetime * 0.5));
    position.x += sin(uTime * waveFrequency + position.y * 2.0 + waveNoise * 3.0 + uSeed * 10.0) * waveAmplitude * heightFactor;
    position.z += cos(uTime * waveFrequency + position.x * 2.0 + waveNoise * 3.0 + uSeed * 15.0) * waveAmplitude * heightFactor;

    // Upward motion with looping
    position.y += mod(lifetime, LIFESPAN) * 0.5;

    return vec4(position, size);
}

// vec4 computeExpandAnimation(vec2 uv) {
//     vec4 particle = texture(uParticlesCurrentPositions, uv);

//     vec3 position = particle.xyz;
//     float size = particle.w;

//     // Current distance from the origin
//     float currentDistance = length(position);
//     currentDistance += 0.01 * uAnimationSpeed;
//     float maxDistance = uMaxSprayDistance * size * 0.1;
//     currentDistance = min(currentDistance, maxDistance);

//     // Restrict downward expansion
//     position.y = abs(position.y);

//     // Calculate new position by scaling the direction vector
//     vec3 direction = normalize(position);

//     position = direction * currentDistance;

//     return vec4(position, size);
// }

// vec4 computeConvergeAnimation(vec2 uv) {
//     vec4 particle = texture(uParticlesCurrentPositions, uv);

//     vec3 position = particle.xyz;
//     float size = particle.w;

//     // Transform the world-space convergence point to local space
//     vec3 convergencePosition = (uSceneMatrixWorldInverse * vec4(uConvergencePoint, 1.0)).xyz;

//     // Calculate the vector to the convergence point
//     vec3 toConvergence = convergencePosition - position;

//     // Step size proportional to animation speed
//     float stepSize = 0.01 * uAnimationSpeed;

//     // Smoothly move the particle closer to the convergence point

//     position += toConvergence * stepSize * (1.0 + simplexNoise3d(position * 0.1));


//     // Ensure particles don't overshoot the convergence point
//     if (length(toConvergence) < stepSize) {
//         position = convergencePosition;
//     }

//     return vec4(position, size);
// }



void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = computeFireAnimation(uv); // works great
    
    // vec4 particle;

    // if (uPhase == 0) {
    //     // Normal fire animation
    //     particle = computeFireAnimation(uv); // works great
    // } else {
    //     particle = computeExpandAnimation(uv); // works well enough

    //     // // Calculate convergence progress
    //     // float convergenceDuration = 2.0;

    //     // particle = computeConvergeAnimation(uv);
    // }

    gl_FragColor = particle;
}
