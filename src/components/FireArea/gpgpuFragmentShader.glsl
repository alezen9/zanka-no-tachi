uniform sampler2D uParticleData; // The input FBO texture
uniform vec3 uConvergencePoint;  // Where particles should converge
uniform float uTime;
uniform float uPhase; // 0 = spreading, 1 = converging

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particleData = texture2D(uParticleData, uv); // Read the input FBO

    vec3 position = particleData.rgb; // Decode particle position
    vec3 velocity = vec3(0.0);        // Initialize velocity (you can store this in alpha if needed)

    // Particle behavior logic (spreading or converging)
    if (uPhase < 1.0) {
        // Spreading phase logic
        position += velocity + vec3(random(uv) - 0.5) * 0.1;
    } else {
        // Converging phase logic
        vec3 direction = normalize(uConvergencePoint - position);
        position += direction * 0.5;
    }

    gl_FragColor = vec4(position, velocity.r); // Encode updated position and velocity
}
