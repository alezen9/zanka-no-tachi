#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.6

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

    // Modulo time to loop particle lifetime and reset them over time
    float intensity = uTime * size * 0.05;
    float lifetime = mod(intensity, LIFESPAN);

    // Base shaping, radial taper with noise
    float baseTaper = 1.0 - smoothstep(0.0, 2.3, position.y);
    float taperNoise = simplexNoise4d(vec4(position, intensity * 0.4)) * 0.1;
    float taper = baseTaper + taperNoise;
    position.xz *= taper; // Apply taper to x and z simultaneously

    // Noise-based displacement
    vec3 noisePosition = position * 3.0;
    float baseNoise = simplexNoise4d(vec4(noisePosition, lifetime * 0.1));
    float yDisplacement = sin(uTime * 0.3 + size * 5.0) * 1.2;
    position.x += baseNoise * 0.1;
    position.y += baseNoise * yDisplacement;
    position.z += baseNoise * 0.1;

    // Add wavering motion only for particles above a certain height
    float heightFactor = smoothstep(0.5, 1.5, position.y); // Gradually apply wavering above 0.5
    float waveFrequency = 2.5 + uSeed * 0.5;               // Frequency varies per fire
    float waveAmplitude = 0.15 + uSeed * 0.05;             // Amplitude varies per fire

    float waveNoise = simplexNoise4d(vec4(position * 1.5 + uSeed, lifetime * 0.5));
    float waveOffset = waveNoise * 3.0 + uSeed * 10.0; // Shared offset for sin/cos
    position.x += sin(uTime * waveFrequency + position.y * 2.0 + waveOffset) * waveAmplitude * heightFactor;
    position.z += cos(uTime * waveFrequency + position.x * 2.0 + waveOffset) * waveAmplitude * heightFactor;

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

// vec4 computeChaoticRagingFire(vec2 uv) {
//     // Sample current and initial particle data
//     vec4 currentParticle = texture(uParticlesCurrentPositions, uv);
//     vec4 initialParticle = texture(uParticlesInitialPositions, uv);
    
//     vec3 currentPosition = currentParticle.xyz;
//     float currentSize = currentParticle.w;
    
//     vec3 initialPosition = initialParticle.xyz;
//     float initialSize = initialParticle.w;
    
//     // Configuration Parameters
//     float cycleTime = 1.0;                 // Total cycle duration in seconds
//     float cycleProgress = mod(uTime, cycleTime) / cycleTime; // [0,1)
    
//     // Phase Factor using sine wave for smooth transitions
//     // sin(0) = 0, sin(pi) = 0, peaks at sin(pi/2) = 1 and sin(3pi/2) = -1
//     // We map cycleProgress [0,1) to angle [0, 2pi)
//     float angle = cycleProgress * 2.0 * 3.14159265;
//     float sineValue = sin(angle); // [-1, 1]
    
//     // Normalize sineValue to [0,1]
//     float phaseFactor = (sineValue + 1.0) * 0.5; // [0,1]
    
//     // Define phase multipliers
//     // During Intensify Phase (phaseFactor ~1), size and motion are increased
//     // During Collapse Phase (phaseFactor ~0), size and motion are normal
//     float sizeMultiplier = mix(1.0, 1.5, phaseFactor);         // Size from 1.0x to 1.5x
//     float motionMultiplier = mix(1.0, 2.0, phaseFactor);       // Motion intensity from 1.0x to 2.0x
    
//     // Time-based chaos intensity
//     float intensity = uTime * initialSize * 0.05; // Base intensity factor
    
//     // Base upward motion with delta time for frame-rate independence
//     float upwardLiftFactor = 0.5; // Base upward motion strength
//     float upwardMotion = smoothstep(0.0, 1.0, currentPosition.y) * upwardLiftFactor;
//     currentPosition.y += upwardMotion * uDeltaTime * motionMultiplier;
    
//     // Chaotic vertical displacement
//     float verticalNoiseScale = 2.5;
//     float verticalNoiseMultiplier = 0.3;
//     float verticalNoise = simplexNoise4d(vec4(currentPosition * verticalNoiseScale, intensity));
//     currentPosition.y += verticalNoise * verticalNoiseMultiplier * motionMultiplier;
    
//     // Chaotic horizontal motion
//     float horizontalNoiseScale = 3.0;
//     float horizontalDisplacementMultiplier = 0.2;
//     float horizontalDisplacement = simplexNoise4d(vec4(currentPosition * horizontalNoiseScale, intensity));
//     currentPosition.x += horizontalDisplacement * horizontalDisplacementMultiplier * motionMultiplier;
//     currentPosition.z += horizontalDisplacement * horizontalDisplacementMultiplier * motionMultiplier;
    
//     // Prevent particles from moving below Y = 0
//     currentPosition.y = max(currentPosition.y, 0.0);
    
//     // Tapering effect to keep the fire grounded
//     float taperRange = 3.0;
//     float taperChaosScale = 1.5;
//     float taperChaosMultiplier = 0.1;
//     float taperClampMin = 0.7;
//     float taperClampMax = 1.0;
    
//     float taper = 1.0 - smoothstep(0.0, taperRange, currentPosition.y);
//     taper += simplexNoise4d(vec4(currentPosition * taperChaosScale, intensity)) * taperChaosMultiplier;
//     taper = clamp(taper, taperClampMin, taperClampMax);
//     currentPosition.xz *= taper;
    
//     // Wobble effect to simulate flickering flames
//     float wobbleFrequencyBase = 5.0;
//     float wobbleFrequencySizeMultiplier = 0.5;
//     float wobbleAmplitude = 0.15;
//     float wobblePhaseFactor = 2.5;
    
//     float wobbleFrequency = wobbleFrequencyBase + initialSize * wobbleFrequencySizeMultiplier;
//     currentPosition.x += sin(uTime * wobbleFrequency + currentPosition.y * wobblePhaseFactor) * wobbleAmplitude;
//     currentPosition.z += cos(uTime * wobbleFrequency + currentPosition.x * wobblePhaseFactor) * wobbleAmplitude;
    
//     // Height boost to allow particles to ascend higher
//     float heightBoostScale = 2.5;
//     float heightBoostTimeMultiplier = 0.6;
//     float heightBoostMultiplier = 0.3;
    
//     float heightBoost = simplexNoise4d(vec4(currentPosition * heightBoostScale, uTime * heightBoostTimeMultiplier)) * heightBoostMultiplier;
//     currentPosition.y += heightBoost * motionMultiplier;
    
//     // Size management with phase-based scaling
//     currentSize *= sizeMultiplier;
//     currentSize = clamp(currentSize, initialSize, initialSize * 2.5); // Clamp size between initial and 2.5x
    
//     // Maximum height based on initial size
//     float maxHeightMultiplier = 3.0;      // Configurable maximum height
//     float maxHeight = initialSize * maxHeightMultiplier;
    
//     // Optional: Smoothly collapse particles towards the center when not in intensify phase
//     // We can use the inverse of phaseFactor to smoothly move particles back
//     // This avoids abrupt resets
//     currentPosition.x *= (1.0 - phaseFactor * 0.5); // Move X towards 0
//     currentPosition.z *= (1.0 - phaseFactor * 0.5); // Move Z towards 0
    
//     // Optionally, clamp Y to maxHeight smoothly
//     float yFactor = clamp(currentPosition.y / maxHeight, 0.0, 1.0);
//     currentPosition.y = mix(currentPosition.y, maxHeight * yFactor, smoothstep(0.0, 1.0, 1.0 - phaseFactor));
    
//     return vec4(currentPosition, currentSize);
// }



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
