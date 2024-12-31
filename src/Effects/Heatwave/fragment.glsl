#define STRENGTH 0.0035
#define SIZE 1.0

uniform float uTime;
uniform sampler2D uNoiseTexture;

void mainUv(inout vec2 uv) {

    uv.x += texture( uNoiseTexture, fract(uv * SIZE + vec2(0.0, uTime))).r * STRENGTH;
	uv.y += texture( uNoiseTexture, fract(uv * SIZE * 3.4 + vec2(0.0, uTime * 1.6))).g * STRENGTH * 1.3;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = inputColor;
}