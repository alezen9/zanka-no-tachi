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
uniform float uBankaiBurnTime; // Time for intense fire phase
uniform float uBankaiConvergenceTime; // Time for particles to converge

uniform float uBankaiExpansionTimeInSeconds;
uniform float uBankaiTransitionTimeInSeconds;
uniform float uBankaiConvergenceTimeInSeconds;

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

float easeOutCubic(float t) {
    return 1.0 - pow(1.0 - t, 3.0);
}

// vec4 animateBankai(vec2 uv) {
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch the current and initial particle positions
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv); // Current position
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv); // Fixed starting position

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time and animation progress
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);

//     // Convergence timing
//     float burnProgress = clamp(elapsedTime / uBankaiBurnTime, 0.0, 1.0); // Time during intense fire burn
//     float convergenceProgress = clamp((elapsedTime - uBankaiBurnTime) / uBankaiConvergenceTime, 0.0, 1.0); // Convergence timing

//     // Noise-based stagger effect for convergence
//     float staggerNoise = simplexNoise3d(vec3(uv * 20.0 + uSeed, elapsedTime));
//     float staggeredConvergence = clamp(convergenceProgress + staggerNoise * 0.2, 0.0, 1.0);

//     // Expansion on Y-axis with XZ noise during intense burning
//     vec3 expandedPosition = initialPosition;
//     float noise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, burnProgress)) * 0.2;
//     float yMultiplier = initialPosition.y + abs(noise); // Grounded particles stay in place
//     expandedPosition.y += smoothstep(0.0, 1.0, burnProgress) * 2.0 * yMultiplier;

//     // Add subtle noise for X and Z
//     expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, burnProgress)) * 0.2;
//     expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, burnProgress)) * 0.2;

//     // Convergence to center
//     vec3 convergencePosition = mix(expandedPosition, uConvergencePosition, smoothstep(0.0, 1.0, staggeredConvergence));

//     // Size animation during convergence
//     float sizeDuringConvergence = mix(initialSize * 2.0, 0.0, staggeredConvergence); // Shrink to 0

//     // Decide final position and size based on the phase
//     vec3 finalPosition = mix(currentParticle.xyz, convergencePosition, smoothstep(0.0, 1.0, staggeredConvergence));
//     float finalSize = mix(currentParticle.w, sizeDuringConvergence, smoothstep(0.0, 1.0, staggeredConvergence));

//     return vec4(finalPosition, finalSize);
// }

// vec4 animateBankai(vec2 uv) {
//     // Exit if not in Bankai phase
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch particle data
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv);
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv);

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);

//     // Initialize variables for final output
//     vec3 finalPosition = initialPosition; // Start with initial position
//     float finalSize = initialSize;        // Start with initial size

//     // Noise for staggered effects
//     float noise = simplexNoise2d(uv * 10.0 + uSeed);
//     float staggerFactor = noise * 0.3; // Adjust stagger range as needed

//     // ---- Phase 1: Expansion ----
//     float expansionProgress = clamp(
//         (elapsedTime - staggerFactor) / uBankaiExpansionTimeInSeconds,
//         0.0,
//         1.0
//     );

//     if (expansionProgress > 0.0) {
//         // Expand fire on the Y-axis and add noise for X and Z
//         vec3 expandedPosition = initialPosition;
//         float verticalNoise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, expansionProgress)) * 0.2;
//         float verticalMultiplier = initialPosition.y + abs(verticalNoise); // Keep particles near ground low
//         expandedPosition.y += smoothstep(0.0, 1.0, expansionProgress) * 2.0 * verticalMultiplier;

//         // Add subtle noise for X and Z
//         expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, expansionProgress)) * 0.2;
//         expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, expansionProgress)) * 0.2;

//         finalPosition = expandedPosition;
//     }

//     // ---- Phase 2: Intense Burning ----
//     float burnStartTime = uBankaiExpansionTimeInSeconds;
//     float burnProgress = clamp(
//         (elapsedTime - burnStartTime) / uBankaiTransitionTimeInSeconds,
//         0.0,
//         1.0
//     );

//     if (burnProgress > 0.0) {
//         // Keep particles in place during intense burning
//         finalPosition = mix(finalPosition, initialPosition, 0.0); // No movement during burning
//         finalSize = initialSize; // Maintain size
//     }

//     // ---- Phase 3: Convergence ----
//     float convergenceStartTime = burnStartTime + uBankaiTransitionTimeInSeconds;
//     float convergenceProgress = clamp(
//         (elapsedTime - convergenceStartTime - staggerFactor) / uBankaiConvergenceTimeInSeconds,
//         0.0,
//         1.0
//     );

//     if (convergenceProgress > 0.0) {
//         // Move particles toward the convergence point
//         finalPosition = mix(finalPosition, uConvergencePosition, smoothstep(0.0, 1.0, convergenceProgress));

//         // Shrink particle size to 0 during convergence
//         finalSize = mix(finalSize, 0.0, smoothstep(0.0, 1.0, convergenceProgress));
//     }

//     // Output final position and size
//     return vec4(finalPosition, finalSize);
// }



// vec4 animateBankai(vec2 uv) {
//     // Exit early if not in Bankai phase
//     if (uPhase == 0) return vec4(0.0);

//     // Fetch particle data
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv);
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv);

//     vec3 initialPosition = initialParticle.xyz; // Fixed starting position
//     float initialSize = initialParticle.w;     // Initial size of the particle

//     // Calculate elapsed time
//     float elapsedTime = max(0.0, uTime - uBankaiStartTime);

//     // Noise for staggered effects
//     float noise = simplexNoise2d(uv * 10.0 + uSeed);
//     float staggerFactor = noise * 0.3; // Adjust stagger range as needed

//     // ---- Phase 1: Expansion ----
//     float expansionProgress = clamp(
//         (elapsedTime - staggerFactor) / uBankaiExpansionTimeInSeconds,
//         0.0,
//         1.0
//     );

//     vec3 expandedPosition = initialPosition;
//     float verticalNoise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, expansionProgress)) * 0.2;
//     float verticalMultiplier = initialPosition.y + abs(verticalNoise); // Grounded particles stay low
//     expandedPosition.y += smoothstep(0.0, 1.0, expansionProgress) * 2.0 * verticalMultiplier;

//     expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, expansionProgress)) * 0.2;
//     expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, expansionProgress)) * 0.2;

//     // ---- Phase 2: Intense Burning ----
//     float burnStartTime = uBankaiExpansionTimeInSeconds;
//     float burnProgress = clamp(
//         (elapsedTime - burnStartTime) / uBankaiTransitionTimeInSeconds,
//         0.0,
//         1.0
//     );

//     vec3 burningPosition = mix(expandedPosition, expandedPosition, burnProgress); // Keep position from expansion
//     float burningSize = initialSize; // Maintain size during burning

//     // Add dynamic wobble for lively fire
//     float burnNoiseX = simplexNoise4d(vec4(expandedPosition * 3.0 + uSeed, burnProgress));
//     float burnNoiseZ = simplexNoise4d(vec4(expandedPosition * 5.0 - uSeed, burnProgress));
//     burningPosition.x += burnNoiseX * 0.1;
//     burningPosition.z += burnNoiseZ * 0.1;

//     // ---- Phase 3: Convergence ----
//     float convergenceStartTime = burnStartTime + uBankaiTransitionTimeInSeconds;
//     float convergenceProgress = clamp(
//         (elapsedTime - convergenceStartTime - staggerFactor) / uBankaiConvergenceTimeInSeconds,
//         0.0,
//         1.0
//     );

//     vec3 convergencePosition = mix(
//         burningPosition,
//         uConvergencePosition,
//         smoothstep(0.0, 1.0, convergenceProgress)
//     );

//     float convergenceSize = mix(
//         burningSize,
//         0.0,
//         smoothstep(0.0, 1.0, convergenceProgress)
//     );

//     // Final position and size
//     return vec4(convergencePosition, convergenceSize);
// }



vec4 animateBankai(vec2 uv) {
    // Exit early if not in Bankai phase
    if (uPhase == 0) return vec4(0.0);

    // Fetch particle data
    vec4 currentParticle = texture(uParticlesCurrentPositions, uv);
    vec4 initialParticle = texture(uParticlesInitialPositions, uv);

    vec3 initialPosition = initialParticle.xyz; // Fixed starting position
    float initialSize = initialParticle.w;     // Initial size of the particle

    // Calculate elapsed time
    float elapsedTime = max(0.0, uTime - uBankaiStartTime);

    // Noise for staggered effects
    float noise = simplexNoise2d(uv * 10.0 + uSeed);
    float staggerFactor = noise * 0.3; // Adjust stagger range as needed

    // ---- Phase 1: Expansion ----
    float expansionProgress = clamp(
        (elapsedTime - staggerFactor) / uBankaiExpansionTimeInSeconds,
        0.0,
        1.0
    );

    vec3 expandedPosition = initialPosition;
    float verticalNoise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, expansionProgress)) * 0.2;
    float verticalMultiplier = initialPosition.y + abs(verticalNoise); // Grounded particles stay low
    expandedPosition.y += smoothstep(0.0, 1.0, expansionProgress) * 2.0 * verticalMultiplier;

    expandedPosition.x += simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, expansionProgress)) * 0.2;
    expandedPosition.z += simplexNoise4d(vec4(initialPosition * 5.0 - uSeed, expansionProgress)) * 0.2;

    // ---- Phase 2: Intense Burning (Retain Shikai Animation) ----
    float burnStartTime = uBankaiExpansionTimeInSeconds;
    float burnProgress = clamp(
        (elapsedTime - burnStartTime) / uBankaiTransitionTimeInSeconds,
        0.0,
        1.0
    );

    vec3 burningPosition = expandedPosition;

    // Incorporate Shikai animation during burning
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1;
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN);
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime);

    float shikaiNoiseX = simplexNoise4d(vec4(expandedPosition * 3.0 + uSeed, lifetime));
    float shikaiNoiseZ = simplexNoise4d(vec4(expandedPosition * 5.0 - uSeed, lifetime));

    burningPosition.x += shikaiNoiseX * 0.05 * burningPosition.y * lifetimeFactor;
    burningPosition.z += shikaiNoiseZ * 0.05 * burningPosition.y * lifetimeFactor;

    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1;
    burningPosition.y += lifetimeFactor * 1.5 * upwardSpeed;

    // ---- Phase 3: Convergence ----
    float convergenceStartTime = burnStartTime + uBankaiTransitionTimeInSeconds;
    float convergenceProgress = clamp(
        (elapsedTime - convergenceStartTime - staggerFactor) / uBankaiConvergenceTimeInSeconds,
        0.0,
        1.0
    );

    vec3 convergencePosition = mix(
        burningPosition,
        uConvergencePosition,
        smoothstep(0.0, 1.0, convergenceProgress)
    );

    float convergenceSize = mix(
        initialSize,
        0.0,
        smoothstep(0.0, 1.0, convergenceProgress)
    );

    // Final position and size
    return vec4(convergencePosition, convergenceSize);
}



void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 shikaiParticle = animateShikai(uv);
    vec4 bankaiParticle = animateBankai(uv);

    vec4 particle = mix(shikaiParticle, bankaiParticle, float(uPhase));

    gl_FragColor = particle;
}
