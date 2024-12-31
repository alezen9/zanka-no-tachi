#define STRENGTH 0.002
#define SIZE 1.0

uniform sampler2D uNoiseTexture;

void mainUv(inout vec2 uv) {
    float animationSpeed = time * 0.25;
    uv.x += texture( uNoiseTexture, fract(uv * SIZE + vec2(0.0, animationSpeed))).r * STRENGTH;
	uv.y += texture( uNoiseTexture, fract(uv * SIZE * 3.4 + vec2(0.0, animationSpeed * 1.6))).g * STRENGTH * 1.3;
}