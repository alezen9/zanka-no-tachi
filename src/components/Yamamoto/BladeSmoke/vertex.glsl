#include ../../../utils/shaders/simplexNoise/simplexNoise.glsl

attribute vec4 aParticle;

uniform float uTime;
uniform float uScale;

varying float vSize;
varying vec3 vColor;

void main()
{
    vec3 position = aParticle.xyz;
    float size = aParticle.w;
    vSize = size;

    // Rotation angle in radians
    float theta = radians(-7.0);

    // Rotation matrix for z-y plane
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);

    // Rotate z and y
    float zRotated = cosTheta * position.z - sinTheta * position.y;
    float yRotated = sinTheta * position.z + cosTheta * position.y;

    // Apply parabolic effect in rotated space
    float parabola = 0.15 * zRotated * zRotated;
    position.y = yRotated + parabola;

    // Add noise-based upward movement with looping
    float verticalNoise = simplexNoise2d(position.xz);
    verticalNoise = (verticalNoise + 1.0) * 0.5;
    position.y += mod(uTime * 0.15 + position.y, verticalNoise * 2.0);

    // Apply squashing effect along z-axis as particles move upward
    float squishingStrength = 5.0;
    float squashFactor = exp(-squishingStrength * position.y);
    squashFactor = max(0.01, squashFactor); // Prevent squash from going to 0
    position.z *= squashFactor;

    // Add wavering to the squished pillar (dynamic motion)
    float horizontalNoiseX = simplexNoise2d(vec2(position.y, uTime * 0.2)) * 0.25; // Noise for x
    float horizontalNoiseZ = simplexNoise2d(vec2(position.y + 10.0, uTime * 0.2)) * 0.25; // Noise for z

    // Waver the pillar along x and z axes
    position.x += sin(uTime * 0.01 + horizontalNoiseX * 5.0) * 0.1;
    position.z += cos(uTime * 0.01 + horizontalNoiseZ * 5.0) * 0.1; // Add to squished z


    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Compute size attenuation based on y position
    float attenuationFactor = exp(-1.0 * position.y); // Exponential shrink as y increases
    attenuationFactor = max(0.1, attenuationFactor); // Prevent size from becoming too small

    // Apply attenuation to the point size
    gl_PointSize = size * uScale * attenuationFactor;
    gl_PointSize *= (1.0 / -viewPosition.z); // Perspective fix

    // Use noise or another factor to vary the shade of grey
    float shadeFactor = simplexNoise2d(position.xz); // Noise value for variation
    shadeFactor = (shadeFactor + 1.0) * 0.5; // Normalize to [0, 1]

    // Interpolate between dark and light grey
    vec3 darkGrey = vec3(0.4, 0.4, 0.4); // RGB: (102, 102, 102)
    vec3 lightGrey = vec3(0.8, 0.8, 0.8); // RGB: (204, 204, 204)
    vColor = mix(darkGrey, lightGrey, shadeFactor);
}
