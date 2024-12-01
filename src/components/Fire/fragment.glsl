varying vec3 vPosition;

void main() {
    // Fire color gradient with horizontal randomness
    vec3 fireBaseColor = vec3(1.0, 1.0, 0.8); // Yellow
    vec3 fireTipColor = vec3(1.0, 0.1, 0.0);  // Red
    float gradient = smoothstep(0.0, 2.0, vPosition.y + sin(vPosition.x * 10.0) * 0.3); // Add randomness
    vec3 fireColor = mix(fireBaseColor, fireTipColor, gradient);

    // Circular shape
    float dist = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.45, dist);
    gl_FragColor = vec4(fireColor, alpha);
}