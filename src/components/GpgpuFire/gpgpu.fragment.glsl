// #include ../../utils/shaders/simplexNoise/simplexNoise.glsl

// #define LIFESPAN 0.6

// uniform float uTime;
// uniform sampler2D uBase;
// uniform vec3 uConvergencePoint;
// uniform float uAnimationSpeed;
// uniform float uMaxSprayDistance;
// uniform int uPhase; // 0 = Shikai (Fire), 1 = Bankai (Spray + Converge)



// vec4 computeFireAnimation(vec2 uv){
//     // Reference the base positions
//     vec4 particle = texture(uBase, uv);
    
//     vec3 position = particle.xyz;
//     float size = particle.w;
    
//     // Modulo time to loop particle lifetime and reset them over time
//     float intensity = uTime * size * 0.05;
//     float lifetime = mod(intensity, LIFESPAN);

//     // Base shaping, radial taper with noise
//     vec3 newPosition = position;
//     float taper = 1.0 - smoothstep(0.0, 2.1, position.y);
//     taper += simplexNoise4d(vec4(position, intensity * 0.4)) * 0.1;
//     newPosition.x *= taper;
//     newPosition.z *= taper;

//     // Noise-based displacement
//     float noise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
//     newPosition.x += noise * 0.1;
//     newPosition.y += noise * (sin(uTime * 0.3 + size * 5.0)) * 1.2;
//     newPosition.z += noise * 0.1;

//     // Upward motion with looping
//     newPosition.y += mod(lifetime, LIFESPAN) * 0.5;

//     return vec4(newPosition, size);
// }

// vec4 computeSprayAnimation(vec2 uv) {
//     vec4 position = texture(uParticles, uv); // Current position
//     vec3 direction = normalize(position.xyz); // Spray outward
//     float distance = position.a * uMaxSprayDistance; // Precomputed random spray distance
//     position.xyz += direction * distance * uAnimationSpeed; // Move outward
//     return position;
// }

// vec4 computeConvergenceAnimation(vec2 uv) {
//     vec4 position = texture(uParticles, uv); // Current position
//     vec3 toCenter = normalize(uConvergencePoint - position.xyz); // Direction to convergence
//     position.xyz += toCenter * uAnimationSpeed; // Move toward convergence
//     return position;
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy / resolution.xy;

//     vec4 particle = computeFireAnimation(uv);

//     gl_FragColor = particle;
// }


#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

#define LIFESPAN 0.6

uniform float uTime;
uniform sampler2D uBase;
uniform vec3 uConvergencePoint;
uniform float uAnimationSpeed;
uniform float uMaxSprayDistance;
uniform int uPhase; // 0 = Fire, 1 = Convergence (Spray + Converge)
uniform float uConvergenceStartTime;
uniform mat4 uSceneMatrixWorldInverse;

vec4 computeFireAnimation(vec2 uv) {
    vec4 particle = texture(uBase, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Modulo time to loop particle lifetime and reset them over time
    float intensity = uTime * size * 0.05;
    float lifetime = mod(intensity, LIFESPAN);

    // Base shaping, radial taper with noise
    float taper = 1.0 - smoothstep(0.0, 2.1, position.y);
    taper += simplexNoise4d(vec4(position, intensity * 0.4)) * 0.1;
    position.x *= taper;
    position.z *= taper;

    // Noise-based displacement
    float noise = simplexNoise4d(vec4(position * 3.0, lifetime * 0.1));
    position.x += noise * 0.1;
    position.y += noise * (sin(uTime * 0.3 + size * 5.0)) * 1.2;
    position.z += noise * 0.1;

    // Upward motion with looping
    position.y += mod(lifetime, LIFESPAN) * 0.5;

    return vec4(position, size);
}

vec4 computeExpandAnimation(vec2 uv) {
    vec4 particle = texture(uParticles, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Current distance from the origin
    float currentDistance = length(position);
    currentDistance += 0.01 * uAnimationSpeed;
    float maxDistance = uMaxSprayDistance * size * 0.1;
    currentDistance = min(currentDistance, maxDistance);

    // Restrict downward expansion
    position.y = abs(position.y);

    // Calculate new position by scaling the direction vector
    vec3 direction = normalize(position);

    position = direction * currentDistance;

    return vec4(position, size);
}

vec4 computeConvergeAnimation(vec2 uv) {
    vec4 particle = texture(uParticles, uv);

    vec3 position = particle.xyz;
    float size = particle.w;

    // Transform the world-space convergence point to local space
    vec3 convergencePosition = (uSceneMatrixWorldInverse * vec4(uConvergencePoint, 1.0)).xyz;

    // Calculate the vector to the convergence point
    vec3 toConvergence = convergencePosition - position;

    // Step size proportional to animation speed
    float stepSize = 0.01 * uAnimationSpeed;

    // Smoothly move the particle closer to the convergence point

    position += toConvergence * stepSize * (1.0 + simplexNoise3d(position * 0.1));


    // Ensure particles don't overshoot the convergence point
    if (length(toConvergence) < stepSize) {
        position = convergencePosition;
    }

    return vec4(position, size);
}



void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 particle;

    if (uPhase == 0) {
        // Normal fire animation
        particle = computeFireAnimation(uv); // works great
    } else {
        // particle = computeExpandAnimation(uv); // works well enough

        // Calculate convergence progress
        float convergenceDuration = 2.0;

        particle = computeConvergeAnimation(uv);
    }

    gl_FragColor = particle;
}
