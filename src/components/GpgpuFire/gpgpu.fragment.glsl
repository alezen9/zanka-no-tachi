// uniform float uTime;
// uniform float uDeltaTime;

// // #include ../../utils/shaders/simplexNoise/simplexNoise.glsl

// void main (){
//     float time = uTime * 1.2;
//     vec2 uv = gl_FragCoord.xy / resolution.xy;
//     vec4 particle = texture(uParticles, uv);

//     // if(particle.a >= 1.0){ // Dead
//     //     particle.a = mod(particle.a, 1.0);
//     //     particle.xyz = base.xyz;
//     // } else { // Alive
//     //     // Strength
//     //     float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
//     //     float influence = (0.5 - 0.5) * (-2.0);
//     //     strength = smoothstep(influence, 1.0, strength);

//     //     // Flow field
//     //     vec3 flowField = vec3(
//     //         simplexNoise4d(vec4(particle.xyz * 0.5, time)),
//     //         simplexNoise4d(vec4(particle.xyz * 0.5 + 1.0, time)),
//     //         simplexNoise4d(vec4(particle.xyz * 0.5 + 2.0, time))
//     //     );
//     //     flowField = normalize(flowField);
//     //     particle.xyz += flowField * uDeltaTime * strength * 2.0;

//     //     // Decay
//     //     // particle.a += uDeltaTime * 0.3;
//     // }

//     particle.y = sin(time) + 0.5;

//     gl_FragColor = vec4(particle);
// }


#include ../../utils/shaders/simplexNoise/simplexNoise.glsl

uniform float uTime;
uniform float uLifetime;

void main() {
    float intensity = uTime * 0.0005;

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 position = texture(uParticles, uv);

    // Modulo time to loop particle lifetime and reset them over time
    float lifetime = mod(intensity + position.y, uLifetime);

    // Base shaping, radial taper with noise
    vec4 newPosition = position;
    // float taper = 1.0 - smoothstep(0.0, 2.3, position.y);
    // taper += simplexNoise4d(vec4(position.xyz, intensity * 0.4));
    // newPosition.x *= taper;
    // newPosition.z *= taper;

    // // Noise-based displacement
    // float noise = simplexNoise4d(vec4(position.xyz * 3.0, lifetime * 0.1));
    // newPosition.x += noise * 0.1;
    // newPosition.y += noise * (sin(uTime * 0.3 * 5.0)) * 1.2;
    // newPosition.z += noise * 0.1;

    // // Upward motion with looping
    // newPosition.y += mod(lifetime, uLifetime) * 0.5;

    gl_FragColor = newPosition;
}
