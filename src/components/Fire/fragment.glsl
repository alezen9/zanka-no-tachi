varying vec3 vPosition;

// Fire gradient based on height
vec3 fireBaseColor = vec3(1.0, 1.0, 0.8); // Yellow
vec3 fireMidColor = vec3(1.0, 0.5, 0.0);  // Orange
vec3 fireTipColor = vec3(1.0, 0.1, 0.0);  // Red

void main() {
    float gradient = smoothstep(0.0, 2.0, vPosition.y); // Map height to [0, 2]
    vec3 fireColor = mix(
        mix(fireBaseColor, fireMidColor, gradient), // Interpolate Yellow -> Orange
        fireTipColor, gradient                           // Interpolate Orange -> Red
    );

    // Transparency for circular particles
    float dist = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.45, dist); // Smooth fade-out
    gl_FragColor = vec4(fireColor, alpha);
}
