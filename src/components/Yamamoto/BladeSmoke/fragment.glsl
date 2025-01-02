
#include ../../../utils/shaders/getHexagonalMaskFactor.glsl

varying float vSize;
varying vec3 vColor;

void main(){
    float maskFactor = getHexagonalMaskFactor();
    float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);
    alpha *= 0.5;

    gl_FragColor = vec4(vColor, alpha);
}