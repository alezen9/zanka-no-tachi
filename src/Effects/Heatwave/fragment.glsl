uniform sampler2D uNoiseTexture;
uniform float uStrength;
uniform float uSize;

void mainUv(inout vec2 uv) {
    float animationSpeed = time * 0.25;
    uv.x += texture( uNoiseTexture, fract(uv * uSize + vec2(0.0, animationSpeed))).r * uStrength;
	uv.y += texture( uNoiseTexture, fract(uv * uSize * 3.4 + vec2(0.0, animationSpeed * 1.6))).g * uStrength * 1.3;
}