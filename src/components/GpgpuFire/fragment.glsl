#include ../../utils/shaders/getHexagonalMaskFactor.glsl

uniform float uTime;

varying vec3 vPosition;
varying float vSize;

void main()
{
    vec3 fireCoreColor = vec3(0.58, 0.55, 0.4);       // White for the core
    vec3 fireTipColor = vec3(0.76, 0.27, 0.09);  // Red for outer particles


    float coreFactor = smoothstep(2.0, 0.0, vSize);
    vec3 fireColor = mix(fireCoreColor, fireTipColor, coreFactor);

    fireColor *= 0.45;
    
    float maskFactor = getHexagonalMaskFactor();
    float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);

    gl_FragColor = vec4(fireColor, alpha);
}
