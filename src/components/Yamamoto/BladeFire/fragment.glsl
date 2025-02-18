
#include ../../../utils/shaders/getHexagonalMaskFactor.glsl

varying vec3 vColor;

void main(){
    float maskFactor = getHexagonalMaskFactor();
    float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);

    vec3 particleColor = vColor * 0.25;

    gl_FragColor = vec4(particleColor, alpha);
}