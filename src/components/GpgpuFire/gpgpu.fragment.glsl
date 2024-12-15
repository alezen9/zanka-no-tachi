#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.3
#define SHIKAI_ANIMATION_SPEED 0.075
#define BANKAI_EXPANSION_ANIMATION_DURATION 0.5 // Seconds
#define BANKAI_TRANSITION_ANIMATION_DURATION 0.15 // Seconds
#define BANKAI_CONVERGENCE_ANIMATION_DURATION 0.2 // Seconds
#define BANKAI_EXPANSION_HEIGHT_FACTOR 2.0
#define BANKAI_SIZE_INCREASE_DECREASE_FACTOR 1.3

uniform float uTime;
uniform sampler2D uParticlesInitialPositions;
uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Expand + Converge)
uniform float uSeed;
uniform vec3 uConvergencePosition;
uniform float uBankaiStartTime;

// Shikai Animation
vec4 animateShikai(vec2 uv){
    if(uPhase == 1) return vec4(0.0);
    
    vec4 particle = texture(uParticlesInitialPositions, uv);
    vec3 position = particle.xyz;
    float size = particle.w;

    // Calculate lifetime with per-particle offset
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1;
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN);
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime) * simplexNoise4d(vec4(position * 7.0 + uSeed, lifetime * 0.2)) * 2.0;

    // Apply wobble based on lifetime
    float baseNoise = simplexNoise4d(vec4(position * 3.0 + uSeed, lifetime * 0.2));
    position.x += baseNoise * 0.05 * position.y * lifetimeFactor;
    position.z += baseNoise * 0.05 * position.y * lifetimeFactor;

    // Vertical wavering motion
    float waveFreq = 1.0 + uSeed * 0.05;
    float waveAmp = 0.07 * position.y + uSeed * 0.01;
    float waveOff = simplexNoise3d(vec3(position.xz * 1.5 + uSeed, lifetime * 10.3));
    position.x += sin(uTime * 0.2 * waveFreq + position.y * 1.5 + waveOff) * waveAmp;
    position.z += cos(uTime * 0.3 * waveFreq + position.x * 1.5 + waveOff) * waveAmp;

    // Upward motion with variable speed
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1;
    position.y += lifetimeFactor * 1.5 * upwardSpeed;

    // Add spikes to certain particles
    float spikeNoise = simplexNoise3d(vec3(uv * 10.0 + uSeed, lifetime * 0.1));
    float spikeFactor = step(0.85, spikeNoise);
    position.y += spikeFactor * 0.8 * smoothstep(0.8, 1.0, lifetimeFactor);

    // Reset position to loop the animation
    position.y += mod(lifetime, LIFESPAN);

    // Gradually reduce size as particles rise
    size *= 1.0 - lifetimeFactor;

    return vec4(position, size);
}

// Bankai Animation
vec4 animateBankai(vec2 uv) {
    if (uPhase == 0) return vec4(0.0);

    float currentSize = texture(uParticlesCurrentPositions, uv).w;
    if(currentSize <= 0.0) return vec4(0.0);

    vec4 particle = texture(uParticlesInitialPositions, uv);
    vec3 initialPosition = particle.xyz;
    float initialSize = particle.w;

    // Calculate elapsed time since Bankai started
    float elapsedTime = max(0.0, uTime - uBankaiStartTime);

    // Staggered start using 2D noise
    float staggerNoise = simplexNoise2d(uv * 10.0 + uSeed);
    float staggerFactor = staggerNoise * 0.3;

    // ---- Phase 1: Expansion ----
    float expansionProgress = clamp(
        (elapsedTime - staggerFactor) / BANKAI_EXPANSION_ANIMATION_DURATION,
        0.0,
        1.0
    );

    // Simultaneous expansion on X and Y based on expansionProgress
    vec3 expandedPosition = initialPosition;

    // Vertical expansion with noise
    float verticalNoise = simplexNoise4d(vec4(initialPosition * 7.0 + uSeed, expansionProgress)) * 0.2;
    float verticalMultiplier = initialPosition.y + abs(verticalNoise);
    float expansionScale = smoothstep(0.0, 1.0, expansionProgress);
    expandedPosition.y += expansionScale * BANKAI_EXPANSION_HEIGHT_FACTOR * verticalMultiplier;

    // Horizontal expansion based on x distance from center
    float bendStrength = 0.3; // Controls how much particles bend outward
    float xTranslation = initialPosition.x * bendStrength * expansionScale;
    expandedPosition.x += xTranslation;

    // Increase size during expansion
    initialSize = mix(initialSize, initialSize * BANKAI_SIZE_INCREASE_DECREASE_FACTOR, expansionScale);

    // ---- Phase 2: Intense Burning ----
    float burnStartTime = BANKAI_EXPANSION_ANIMATION_DURATION;
    float burnProgress = clamp(
        (elapsedTime - burnStartTime) / BANKAI_TRANSITION_ANIMATION_DURATION,
        0.0,
        1.0
    );

    vec3 burningPosition = expandedPosition;

    // Continue Shikai-like animation during burning
    float lifetimeOffset = uv.x * 0.3 + uv.y * 0.2 + uSeed * 0.1;
    float lifetime = mod(uTime * SHIKAI_ANIMATION_SPEED + lifetimeOffset, LIFESPAN);
    float lifetimeFactor = smoothstep(0.0, 1.0, lifetime);

    // Apply wobble
    float shikaiNoiseX = simplexNoise4d(vec4(burningPosition * 3.0 + uSeed, lifetime));
    float shikaiNoiseZ = simplexNoise4d(vec4(burningPosition * 5.0 - uSeed, lifetime));
    burningPosition.x += shikaiNoiseX * 0.05 * burningPosition.y * lifetimeFactor;
    burningPosition.z += shikaiNoiseZ * 0.05 * burningPosition.y * lifetimeFactor;

    // Upward motion with variable speed
    float upwardSpeed = 0.3 + uv.x * 0.2 + uv.y * 0.1;
    burningPosition.y += lifetimeFactor * 1.5 * upwardSpeed;

    // ---- Phase 3: Convergence ----
    float convergenceStartTime = burnStartTime + BANKAI_TRANSITION_ANIMATION_DURATION;
    float convergenceProgress = clamp(
        (elapsedTime - convergenceStartTime - staggerFactor) / BANKAI_CONVERGENCE_ANIMATION_DURATION,
        0.0,
        1.0
    );
    float convergenceScale = smoothstep(0.0, 1.0, convergenceProgress);

    // Move towards convergence point (0,0,0)
    initialPosition = mix(burningPosition, uConvergencePosition, convergenceScale);

    // Shrink size to 0 during convergence
    initialSize = mix(initialSize * BANKAI_SIZE_INCREASE_DECREASE_FACTOR, 0.0, convergenceScale);

    return vec4(initialPosition, initialSize);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 shikaiParticle = animateShikai(uv);
    vec4 bankaiParticle = animateBankai(uv);

    // Select particle based on current phase
    vec4 particle = mix(shikaiParticle, bankaiParticle, float(uPhase));

    gl_FragColor = particle;
}
