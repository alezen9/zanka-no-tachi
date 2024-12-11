#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.6

uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;
uniform vec3 uConvergencePosition;

// vec4 computeFireAnimation(vec2 uv) {
//     vec4 particle = texture(uParticlesInitialPositions, uv);

//     vec3 position = particle.xyz;
//     float size = particle.w;

//     // Modulo time to loop particle lifetime and reset them over time
//     float intensity = (uTime + uv.x * 0.1 + uv.y * 0.1) * size * 0.02; // Add uv offsets for desync
//     float lifetime = mod(intensity, LIFESPAN);

//     // Noise-based displacement
//     float baseNoise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
//     float yDisplacement = sin(uTime * 0.3 + size * 5.0) * position.y * 1.2;
//     position.x += baseNoise * 0.1;
//     position.y += baseNoise * yDisplacement * 0.5;
//     position.z += baseNoise * 0.1;

//     // Add wavering motion only for particles above a certain height
//     float heightFactor = smoothstep(0.1, 1.5, position.y); // Gradually apply wavering starting near ground
//     float waveFrequency = 2.5 + uSeed * 0.5;               // Frequency varies per fire
//     float waveAmplitude = 0.15 + uSeed * 0.05;             // Amplitude varies per fire

//     float waveNoise = simplexNoise4d(vec4(position * 1.5 + uSeed, lifetime * 0.5));
//     float waveOffset = waveNoise * 3.0 + uSeed * 10.0; // Shared offset for sin/cos
//     position.x += sin(uTime * waveFrequency + position.y * 2.0 + waveOffset) * waveAmplitude * heightFactor;
//     position.z += cos(uTime * waveFrequency + position.x * 2.0 + waveOffset) * waveAmplitude * heightFactor;

//     // Upward motion with looping
//     position.y += mod(lifetime, LIFESPAN) * 0.5;
    
//     float groundFade = smoothstep(0.0, 0.11, position.y);
//     size *= groundFade;

//     return vec4(position, size);
// }

vec4 computeFireAnimation(vec2 uv) {
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Modulo time to loop particle lifetime and reset them over time
    float intensity = (uTime + uv.x * 0.1 + uv.y * 0.1) * size * 0.02; // Add uv offsets for desync
    float lifetime = mod(intensity, LIFESPAN);

    // Noise-based displacement
    float baseNoise = simplexNoise4d(vec4(position * 4.5, lifetime * 0.1));
    baseNoise = (baseNoise + 1.0) / 0.5;
    baseNoise *= 0.2;
    float yDisplacement = sin(uTime * 0.3 + size * 5.0) * position.y * 0.05;
    float wobble = sin(uTime * 3.0 + uv.x * 10.0 + baseNoise * 5.0) * 0.3;

    position.x += baseNoise * 0.2 * wobble;
    position.y += baseNoise * yDisplacement * 0.5;
    position.z += baseNoise * 0.2 * wobble;

    // Compute upward movement limitation based on z value
    float upwardMotion = mod(lifetime, LIFESPAN) * 0.5;

    // Apply upward motion with limitation
    position.y += (baseNoise * upwardMotion);

    float groundFade = smoothstep(0.01, 0.1, position.y);
    size *= groundFade;

    return vec4(position, size);
}


vec4 computeConvergeAnimation(vec2 uv) {
    vec4 particle = texture(uParticlesCurrentPositions, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Calculate vector toward the convergence point
    vec3 toConvergence = uConvergencePosition - position;

    // Normalize progress over time (linear movement)
    float progress = uTime * 0.1; // Speed factor (adjust 0.1 for faster/slower)
    progress = clamp(progress, 0.0, 1.0); // Clamp progress to [0, 1]

    // Linearly interpolate position
    position = mix(position, uConvergencePosition, progress);

    // Gradually shrink particles (optional)
    size *= 1.0 - progress;

    return vec4(position, size);
}

vec4 computeChaoticRagingFire(vec2 uv) {
    vec4 particle = texture(uParticlesCurrentPositions, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Time-based chaos intensity
    float intensity = uTime * size * 0.05;

    // Add base upward motion, keeping the fire grounded
    float upwardMotion = smoothstep(0.0, 1.0, position.y) * 0.5; // More lift for higher particles
    position.y += upwardMotion; // Gradual rise

    // Add chaotic vertical displacement
    float verticalNoise = simplexNoise4d(vec4(position * 2.0, intensity));
    position.y += verticalNoise * 0.3; // Controlled vertical flicker

    // Horizontal chaotic motion
    float horizontalDisplacement = simplexNoise4d(vec4(position * 3.0, intensity));
    position.x += horizontalDisplacement * 0.4; // Stronger left-right movement
    position.z += horizontalDisplacement * 0.4;

    // Add tapering effect to keep the fire grounded
    float taper = 1.0 - smoothstep(0.0, 2.5, position.y); // Stronger tapering further up
    taper += simplexNoise4d(vec4(position * 1.5, intensity)) * 0.1; // Chaotic taper
    position.xz *= taper;

    // Add a stronger wobble effect to simulate flickering flames
    float wobbleFrequency = 4.0 + size * 0.5; // Frequency scales with size
    position.x += sin(uTime * wobbleFrequency + position.y * 2.0) * 0.2; // Subtle wobble
    position.z += cos(uTime * wobbleFrequency + position.x * 2.0) * 0.2;

    // Control height increase to make the fire taller
    float heightBoost = simplexNoise4d(vec4(position * 2.0, uTime * 0.5)) * 0.3;
    position.y += heightBoost;

    // Slight size adjustment for larger flames
    size *= 1.1 + simplexNoise4d(vec4(position * 1.5, intensity)) * 0.1;

    return vec4(position, size);
}



void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;    
    vec4 particle;

    if (uPhase == 0) { // Shikai
        particle = computeFireAnimation(uv); // works great
    } else { // Bankai
        // particle = computeExpandAnimation(uv); // works well enough

        // particle = computeConvergeAnimation(uv); // the convergence point seems to be over written by the last Fire instance
    
        particle = computeConvergeAnimation(uv);
    }

    gl_FragColor = particle;
}
