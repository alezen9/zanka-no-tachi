uniform vec2 uResolution;
uniform float uSizeScale;
uniform sampler2D uParticlesTexture;

varying vec3 vPosition;

attribute vec2 aParticlesUv;

void main()
{
    vec4 particle = texture(uParticlesTexture, aParticlesUv);
    vec3 position = particle.xyz;
    float size = particle.w;
    vPosition = position;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uSizeScale * size;
    gl_PointSize *= (1.0 / - viewPosition.z);
}