/**
* @example
* float circularMask = getCircularMaskFactor();
* float alpha = smoothstep(0.5, 0.45, circularMask);
*/
float getCircularMaskFactor(){
    vec2 coord = gl_PointCoord - vec2(0.5);
    float mask = length(coord);

    return mask;
}