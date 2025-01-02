#include "../../utils/shaders/simplexNoise/simplexNoise.glsl"

uniform sampler2D cracksTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec3 bladeColor = vec3(-0.25);

    float crackMask = texture2D(cracksTexture, vUv).r; // Red channel for grayscale

    float noise = simplexNoise2d(vUv);
    noise = (noise + 1.0) * 0.5;

    float redChannel = sin(uTime + noise * 10.0) + 2.0;

    vec3 crackColor = vec3(redChannel, 0.64, 0.45);
    vec3 finalColor = mix(bladeColor, crackColor, crackMask);

    gl_FragColor = vec4(finalColor, 1.0);
}