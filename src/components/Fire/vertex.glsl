uniform float uTime;
uniform vec2 uResolution;
varying vec3 vPosition;

void main() {
    vPosition = position;
    
    // Simulate vertical movement with a sine wave
    vec3 newPosition = position;
    newPosition.y += sin(uTime + position.x * 10.0) * 0.1;

    // Transform position to clip space
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Scale point size based on resolution and absolute depth
    gl_PointSize = 0.03 * uResolution.y;
    gl_PointSize *= (1.0 / abs(viewPosition.z)); // Absolute depth for consistent scaling
    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
}
