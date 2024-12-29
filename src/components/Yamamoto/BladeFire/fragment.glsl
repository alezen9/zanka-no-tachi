
#include ../../../utils/shaders/getHexagonalMaskFactor.glsl

varying float vSize;

void main(){
    float maskFactor = getHexagonalMaskFactor();
    float alpha = 1.0 - smoothstep(0.9, 1.0, maskFactor);

    vec3 fireCoreColor = vec3(0.58, 0.55, 0.4);
    vec3 fireRedColor = vec3(0.76, 0.27, 0.09);

    vec3 particleColor = mix(fireCoreColor, fireRedColor, vSize);
    particleColor *= 0.25;


    gl_FragColor = vec4(particleColor, alpha);
}