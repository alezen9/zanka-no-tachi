#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.3
#define SHIKAI_ANIMATION_SPEED 0.075

uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;
uniform vec3 uConvergencePosition;
uniform float uBankaiAnimationDurationInSeconds;
uniform float uBankaiStartTime;
uniform float uFireHeightMultiplier;
uniform float uShikaiStartTime;

/*
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float currentSize = texture(uParticlesInitialPositions, uv).w;

    if(currentSize <= 0.0) discard;
    
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 basePosition = particle.xyz;
    float baseSize = particle.w;
    

    // Lifetime with per-particle offset for desync
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1; // Random offset per particle
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN); // Looping lifetime

    // Default intensity for Shikai phase
    float intensity = 1.0;

    // Handle Bankai animation progress only if uPhase == 1
    float animationProgress = 0.0;
    float elapsedTime = max(0.0, uTime - uBankaiStartTime); // Time since Bankai started
    if (uPhase == 1) {
        float animationDuration = uBankaiAnimationDurationInSeconds * MILLISECONDS_TO_SECONDS; // Convert to seconds
        animationProgress = clamp(elapsedTime / animationDuration, 0.0, 1.0);
    }

    // Blend fire intensity and expansion based on phase
    float fireExpansionFactor = mix(1.0, 1.5, smoothstep(0.0, 0.75, animationProgress)); // Subtle x, z expansion
    float fireHeightFactor = mix(1.0, uFireHeightMultiplier, smoothstep(0.0, 0.75, animationProgress)); // Height expansion
    float particleSizeFactor = mix(1.0, 4.0, smoothstep(0.0, 0.75, animationProgress)); // Increase particle baseSize

    // Apply expansion to basePosition
    basePosition.x *= fireExpansionFactor;
    basePosition.z *= fireExpansionFactor;
    basePosition.y *= fireHeightFactor;

    // Phase 2: Convergence
    float convergenceFactor = smoothstep(0.75, 1.0, animationProgress); // Blend particles toward center
    
    // Add slight randomness to convergence
    float randomOffset = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime)) * 0.1;

    // Amplify vertical movement during convergence
    vec3 adjustedConvergencePosition = vec3(
        uConvergencePosition.x, 
        uConvergencePosition.y + randomOffset, 
        uConvergencePosition.z
    );

    // Interpolate position toward convergence point
    basePosition = mix(basePosition, adjustedConvergencePosition, convergenceFactor);

    // Reduce particle baseSize during convergence
    baseSize *= mix(particleSizeFactor, 0.0, convergenceFactor); // Shrinks to 0 during convergence

    // Discard particles when baseSize is effectively zero
    if (baseSize <= 0.01) discard;

    // Noise-based displacement for independent wobble
    float baseNoise = simplexNoise4d(vec4(basePosition * 3.0 + uSeed, lifetime * 0.2));
    basePosition.x += baseNoise * 0.05 * basePosition.y * fireHeightFactor;
    basePosition.z += baseNoise * 0.05 * basePosition.y * fireHeightFactor;

    // Subtle vertical wavering motion
    float waveFrequency = 1.0 + uSeed * 0.05; // Frequency variation
    float waveAmplitude = 0.07 * basePosition.y + uSeed * 0.01; // Amplitude variation
    float waveOffset = simplexNoise3d(vec3(basePosition.xz * 1.5 + uSeed, lifetime * 10.3));
    basePosition.x += sin(uTime * 0.2 * waveFrequency + basePosition.y * 1.5 + waveOffset) * waveAmplitude;
    basePosition.z += cos(uTime * 0.3 * waveFrequency + basePosition.x * 1.5 + waveOffset) * waveAmplitude;

    // Upward motion with per-particle height variation
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1; // Random speed per particle
    basePosition.y += lifetime * 1.5 * upwardSpeed * fireHeightFactor;

    // Add spikes to certain particles
    float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1)); // Noise to select spike particles
    float spikeFactor = step(0.85, spikeNoise); // Select particles with noise > 0.85
    basePosition.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetime); // Add noticeable spikes

    // Gradually reduce baseSize as particles rise
    baseSize *= 1.0 - lifetime;

    gl_FragColor = vec4(basePosition, baseSize);
}
*/

vec4 animateShikai(vec2 uv){
    if(uPhase == 1) return vec4(0.0);
    
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 basePosition = particle.xyz;
    float baseSize = particle.w;

    // Lifetime with per-particle offset for desync
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1; // Random offset per particle
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN); // Looping lifetime
    
    float noise = simplexNoise4d(vec4(basePosition * 7.0 + uSeed, lifetime * 0.2));
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime) * noise * 2.0; // Normalized lifetime progression

    // Noise-based displacement for independent wobble
    float baseNoise = simplexNoise4d(vec4(basePosition * 3.0 + uSeed, lifetime * 0.2));
    basePosition.x += baseNoise * 0.05 * basePosition.y * lifetimeFactor;
    basePosition.z += baseNoise * 0.05 * basePosition.y * lifetimeFactor;

    // Subtle vertical wavering motion
    float waveFrequency = 1.0 + uSeed * 0.05; // Frequency variation
    float waveAmplitude = 0.07 * basePosition.y + uSeed * 0.01; // Amplitude variation
    float waveOffset = simplexNoise3d(vec3(basePosition.xz * 1.5 + uSeed, lifetime * 10.3));
    basePosition.x += sin(uTime * 0.2 * waveFrequency + basePosition.y * 1.5 + waveOffset) * waveAmplitude;
    basePosition.z += cos(uTime * 0.3 * waveFrequency + basePosition.x * 1.5 + waveOffset) * waveAmplitude;

    // Upward motion with per-particle height variation
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1; // Random speed per particle
    basePosition.y += lifetimeFactor * 1.5 * upwardSpeed;

    // Add spikes to certain particles
    float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1)); // Noise to select spike particles
    float spikeFactor = step(0.85, spikeNoise); // Select particles with noise > 0.85
    basePosition.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetimeFactor); // Add noticeable spikes

    // Reset particles seamlessly by wrapping lifetime progression
    basePosition.y += mod(lifetime, LIFESPAN); // Allow particles to exceed flat height limits

    // Gradually reduce baseSize as particles rise
    baseSize *= 1.0 - lifetimeFactor;

    return vec4(basePosition, baseSize);
}

// vec4 animateBankai(vec2 uv) {
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch the current and initial particle positions
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv);

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time and animation progress
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);
//     float animationProgress = clamp(elapsedTime / uBankaiAnimationDurationInSeconds, 0.0, 1.0);

//     // Noise-based stagger effect
//     float staggerNoise = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime));
//     float staggeredProgress = clamp(animationProgress + staggerNoise * 0.2, 0.0, 1.0);

//     // Expansion on Y-axis with XZ noise
//     vec3 expandedPosition = initialPosition;
//     float yMultiplier = initialPosition.y; // Use initial Y position to limit movement near the ground
//     expandedPosition.y += smoothstep(0.0, 1.0, staggeredProgress) * 2.0 * yMultiplier;

//     // Add subtle noise for X and Z
//     expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, staggeredProgress)) * 0.2;
//     expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, staggeredProgress)) * 0.2;

//     // Stop particles after expansion
//     vec3 finalPosition = mix(initialPosition, expandedPosition, staggeredProgress);

//     // Return the final position and original size (no shrinking yet)
//     return vec4(finalPosition, initialSize);
// }



// vec4 animateBankai(vec2 uv) {
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch the current and initial particle positions
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv);
    
//     // Fetch the initial and initial particle positions
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv);

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time and animation progress
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);
//     float animationProgress = clamp(elapsedTime / uBankaiAnimationDurationInSeconds, 0.0, 1.0);

//     // Noise-based stagger effect
//     float staggerNoise = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime));
//     float staggeredProgress = clamp(animationProgress + staggerNoise * 0.2, 0.0, 1.0);

//     // Expansion on Y-axis with XZ noise
//     vec3 expandedPosition = initialPosition;
//     float noise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, staggeredProgress)) * 0.2;
//     float yMultiplier = initialPosition.y + abs(noise); // Use initial Y position to limit movement near the ground
//     expandedPosition.y += smoothstep(0.0, 1.0, staggeredProgress) * 2.0 * yMultiplier;

//     // Add subtle noise for X and Z
//     expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, staggeredProgress)) * 0.2;
//     expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, staggeredProgress)) * 0.2;

//     // Stop particles after expansion
//     vec3 finalPosition = mix(initialPosition, expandedPosition, staggeredProgress);

//     // Return the final position and original size (no shrinking yet)
//     return vec4(finalPosition, initialSize);
// }


// vec4 animateShikai(vec2 uv) {
//     if (uPhase == 1) return vec4(0.0);

//     // Fetch the current and initial particle positions
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv); // Current position
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv); // Initial fixed position

//     vec3 currentPosition = currentParticle.xyz;
//     vec3 initialPosition = initialParticle.xyz;
//     float initialSize = initialParticle.w;

//     // Calculate elapsed time and animation progress
//     float elapsedTime = max(0.0, uTime - uShikaiStartTime); // Time since Shikai started
//     float transitionProgress = clamp(elapsedTime / 0.5, 0.0, 1.0); // Smooth transition progress

//     // Transition particles back to initial position
//     vec3 transitionedPosition = mix(currentPosition, initialPosition, smoothstep(0.0, 1.0, transitionProgress));

//     // Lifetime for per-particle desync
//     float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1; // Random offset per particle
//     float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN); // Looping lifetime
//     float lifetimeFactor = smoothstep(0.0, 1.0, lifetime); // Normalized lifetime progression

//     // Noise-based displacement for independent wobble
//     float baseNoise = simplexNoise4d(vec4(transitionedPosition * 3.0 + uSeed, lifetime * 0.2));
//     transitionedPosition.x += baseNoise * 0.05 * transitionedPosition.y * lifetimeFactor;
//     transitionedPosition.z += baseNoise * 0.05 * transitionedPosition.y * lifetimeFactor;

//     // Subtle vertical wavering motion
//     float waveFrequency = 1.0 + uSeed * 0.05; // Frequency variation
//     float waveAmplitude = 0.07 * transitionedPosition.y + uSeed * 0.01; // Amplitude variation
//     float waveOffset = simplexNoise3d(vec3(transitionedPosition.xz * 1.5 + uSeed, lifetime * 10.3));
//     transitionedPosition.x += sin(uTime * 0.2 * waveFrequency + transitionedPosition.y * 1.5 + waveOffset) * waveAmplitude;
//     transitionedPosition.z += cos(uTime * 0.3 * waveFrequency + transitionedPosition.x * 1.5 + waveOffset) * waveAmplitude;

//     // Upward motion with per-particle height variation
//     float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1; // Random speed per particle
//     transitionedPosition.y += lifetimeFactor * 1.5 * upwardSpeed;

//     // Add spikes to certain particles
//     float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1)); // Noise to select spike particles
//     float spikeFactor = step(0.85, spikeNoise); // Select particles with noise > 0.85
//     transitionedPosition.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetimeFactor); // Add noticeable spikes

//     // Gradually reduce size as particles rise
//     float finalSize = initialSize * (1.0 - lifetimeFactor);

//     // Mix position and size for smooth transition
//     return vec4(transitionedPosition, finalSize);
// }


// vec4 animateBankai(vec2 uv) {
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch the current and initial particle positions
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv); // Current position
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv); // Fixed starting position

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time and animation progress
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);
//     float animationProgress = clamp(elapsedTime / uBankaiAnimationDurationInSeconds, 0.0, 1.0);

//     // Noise-based stagger effect
//     float staggerNoise = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime));
//     float staggeredProgress = clamp(animationProgress + staggerNoise * 0.2, 0.0, 1.0);

//     // Expansion on Y-axis with XZ noise (relative to initial position)
//     vec3 expandedPosition = initialPosition;
//     float noise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, staggeredProgress)) * 0.2;
//     float yMultiplier = initialPosition.y + abs(noise); // Grounded particles stay in place
//     expandedPosition.y += smoothstep(0.0, 1.0, staggeredProgress) * 2.0 * yMultiplier;

//     // Add subtle noise for X and Z
//     expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, staggeredProgress)) * 0.2;
//     expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, staggeredProgress)) * 0.2;

//     // Compute the final position using currentParticle for continuity
//     vec3 finalPosition = mix(currentParticle.xyz, expandedPosition, staggeredProgress);

//     // Return the final position and original size
//     return vec4(finalPosition, initialSize);
// }

float easeOutCubic(float t) {
    return 1.0 - pow(1.0 - t, 3.0);
}

vec4 animateBankai(vec2 uv) {
    if (uPhase == 0) return vec4(0.0);

    // Fetch the current and initial particle positions
    vec4 currentParticle = texture(uParticlesCurrentPositions, uv); // Current position
    vec4 initialParticle = texture(uParticlesInitialPositions, uv); // Fixed starting position

    vec3 initialPosition = initialParticle.xyz; // Fixed starting position
    float initialSize = initialParticle.w;     // Initial size of the particle

    // Calculate elapsed time and animation progress
    float elapsedTime = max(0.0, uTime - uBankaiStartTime);
    float animationProgress = clamp(elapsedTime / uBankaiAnimationDurationInSeconds, 0.0, 1.0);

    // Apply Ease-Out for expansion
    float easedProgress = easeOutCubic(animationProgress);

    // Noise-based stagger effect
    float staggerNoise = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime));
    float staggeredProgress = clamp(easedProgress + staggerNoise * 0.2, 0.0, 1.0);

    // Expansion on Y-axis with XZ noise (relative to initial position)
    vec3 expandedPosition = initialPosition;
    float noise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, staggeredProgress)) * 0.2;
    float yMultiplier = initialPosition.y + abs(noise); // Grounded particles stay in place
    expandedPosition.y += smoothstep(0.0, 1.0, staggeredProgress) * 2.0 * yMultiplier;

    // Add subtle noise for X and Z
    expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, staggeredProgress)) * 0.2;
    expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, staggeredProgress)) * 0.2;

    // Compute the final position using currentParticle for continuity
    vec3 finalPosition = mix(currentParticle.xyz, expandedPosition, staggeredProgress);

    // Return the final position and original size
    return vec4(finalPosition, initialSize);
}




void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 shikaiParticle = animateShikai(uv);
    vec4 bankaiParticle = animateBankai(uv);

    vec4 particle = mix(shikaiParticle, bankaiParticle, float(uPhase));

    gl_FragColor = particle;
}
