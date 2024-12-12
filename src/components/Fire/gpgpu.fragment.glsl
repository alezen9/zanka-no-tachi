#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.3
#define SHIKAI_ANIMATION_SPEED 0.075

uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;
uniform vec3 uConvergencePosition;


vec4 computeFireAnimation(vec2 uv) {
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Lifetime with per-particle offset for desync
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1; // Random offset per particle
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN); // Looping lifetime
    
    float noise = simplexNoise4d(vec4(position * 7.0 + uSeed, lifetime * 0.2));
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime) * noise * 2.0; // Normalized lifetime progression

    // Noise-based displacement for independent wobble
    float baseNoise = simplexNoise4d(vec4(position * 3.0 + uSeed, lifetime * 0.2));
    position.x += baseNoise * 0.35 * lifetimeFactor;
    position.z += baseNoise * 0.35 * lifetimeFactor;

    // Subtle vertical wavering motion
    float waveFrequency = 1.0 + uSeed * 0.05; // Frequency variation
    float waveAmplitude = 0.07 + uSeed * 0.01; // Amplitude variation
    float waveOffset = simplexNoise3d(vec3(position.xz * 1.5 + uSeed, lifetime * 10.3));
    position.x += sin(uTime * 0.2 * waveFrequency + position.y * 1.5 + waveOffset) * waveAmplitude;
    position.z += cos(uTime * 0.3 * waveFrequency + position.x * 1.5 + waveOffset) * waveAmplitude;

    // Upward motion with per-particle height variation
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1; // Random speed per particle
    position.y += lifetimeFactor * 1.5 * upwardSpeed;

    // Add spikes to certain particles
    float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1)); // Noise to select spike particles
    float spikeFactor = step(0.85, spikeNoise); // Select particles with noise > 0.85
    position.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetimeFactor); // Add noticeable spikes

    // Reset particles seamlessly by wrapping lifetime progression
    position.y += mod(lifetime, LIFESPAN); // Allow particles to exceed flat height limits

    // Gradually reduce size as particles rise
    size *= 1.0 - lifetimeFactor;

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
