uniform vec2 uResolution;
uniform sampler2D uParticlesCurrentPositions;
uniform float uScale;

varying vec3 vPosition;
varying float vSize;

attribute vec2 aParticlesUv;

void main()
{
    vec4 particle = texture(uParticlesCurrentPositions, aParticlesUv);
    vec3 position = particle.xyz;
    float size = particle.w;
    vPosition = position;
    vSize = size;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = size * uScale;
    gl_PointSize *= (1.0 / - viewPosition.z); // Fix perspective
}