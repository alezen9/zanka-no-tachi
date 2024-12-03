uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uParticlesTexture;

varying vec3 vColor;
varying vec3 vPosition;

attribute vec2 aParticlesUv;
attribute float aSize;


void main()
{
    vec4 particle = texture(uParticlesTexture, aParticlesUv);
    vPosition = particle.xyz;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uSize * aSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = particle.xyz;
}