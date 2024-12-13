#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.3
#define SHIKAI_ANIMATION_SPEED 0.075
#define BANKAI_EXPANSION_ANIMATION_DURATION 0.25 // Seconds
#define BANKAI_TRANSITION_ANIMATION_DURATION 0.25 // Seconds
#define BANKAI_CONVERGENCE_ANIMATION_DURATION 0.25 // Seconds

uniform float uTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;
uniform vec3 uConvergencePosition;
uniform float uBankaiStartTime;

vec4 animateShikai(vec2 uv){
    if(uPhase == 1) return vec4(0.0);
    
    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 initialPosition = particle.xyz;
    float initialSize = particle.w;

    // Lifetime with per-particle offset for desync
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1; // Random offset per particle
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN); // Looping lifetime
    
    float noise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, lifetime * 0.2));
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime) * noise * 2.0; // Normalized lifetime progression

    // Noise-based displacement for independent wobble
    float baseNoise = simplexNoise4d(vec4(initialPosition * 3.0 + uSeed, lifetime * 0.2));
    initialPosition.x += baseNoise * 0.05 * initialPosition.y * lifetimeFactor;
    initialPosition.z += baseNoise * 0.05 * initialPosition.y * lifetimeFactor;

    // Subtle vertical wavering motion
    float waveFrequency = 1.0 + uSeed * 0.05; // Frequency variation
    float waveAmplitude = 0.07 * initialPosition.y + uSeed * 0.01; // Amplitude variation
    float waveOffset = simplexNoise3d(vec3(initialPosition.xz * 1.5 + uSeed, lifetime * 10.3));
    initialPosition.x += sin(uTime * 0.2 * waveFrequency + initialPosition.y * 1.5 + waveOffset) * waveAmplitude;
    initialPosition.z += cos(uTime * 0.3 * waveFrequency + initialPosition.x * 1.5 + waveOffset) * waveAmplitude;

    // Upward motion with per-particle height variation
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1; // Random speed per particle
    initialPosition.y += lifetimeFactor * 1.5 * upwardSpeed;

    // Add spikes to certain particles
    float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1)); // Noise to select spike particles
    float spikeFactor = step(0.85, spikeNoise); // Select particles with noise > 0.85
    initialPosition.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetimeFactor); // Add noticeable spikes

    // Reset particles seamlessly by wrapping lifetime progression
    initialPosition.y += mod(lifetime, LIFESPAN); // Allow particles to exceed flat height limits

    // Gradually reduce initialSize as particles rise
    initialSize *= 1.0 - lifetimeFactor;

    return vec4(initialPosition, initialSize);
}

vec4 animateBankai(vec2 uv) {
    if (uPhase == 0) return vec4(0.0);

    vec4 particle = texture(uParticlesInitialPositions, uv);

    vec3 initialPosition = particle.xyz;
    float initialSize = particle.w;

    // Bankai animation progress so far
    float elapsedTime = max(0.0, uTime - uBankaiStartTime);

    // Noise for staggered effect
    float noise = simplexNoise2d(uv * 10.0 + uSeed);
    float staggerFactor = noise * 0.3;

    // ---- Phase 1: Expansion ----
    float expansionProgress = clamp(
        (elapsedTime - staggerFactor) / BANKAI_EXPANSION_ANIMATION_DURATION,
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
    float burnStartTime = BANKAI_EXPANSION_ANIMATION_DURATION;
    float burnProgress = clamp(
        (elapsedTime - burnStartTime) / BANKAI_TRANSITION_ANIMATION_DURATION,
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
    float convergenceStartTime = burnStartTime + BANKAI_TRANSITION_ANIMATION_DURATION;
    float convergenceProgress = clamp(
        (elapsedTime - convergenceStartTime - staggerFactor) / BANKAI_CONVERGENCE_ANIMATION_DURATION,
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

    return vec4(convergencePosition, convergenceSize);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 shikaiParticle = animateShikai(uv);
    vec4 bankaiParticle = animateBankai(uv);

    vec4 particle = mix(shikaiParticle, bankaiParticle, float(uPhase));

    gl_FragColor = particle;
}
