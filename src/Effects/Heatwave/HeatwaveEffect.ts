import { Effect } from "postprocessing";
import fragmentShader from "./fragment.glsl";
import {
  RepeatWrapping,
  Texture,
  TextureLoader,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import leopardTextureUrl from "/pattern.webp?url";

type Uniforms = {
  uTime: Uniform<number>;
  uNoiseTexture: Uniform<Texture>;
};

class HeatwaveEffect extends Effect {
  constructor() {
    const loader = new TextureLoader();
    const texture = loader.load(leopardTextureUrl);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    const uniforms = new Map<keyof Uniforms, Uniforms[keyof Uniforms]>();
    uniforms.set("uTime", new Uniform(0));
    uniforms.set("uNoiseTexture", new Uniform(texture));

    super("HeatwaveEffect", fragmentShader, {
      uniforms,
    });
  }

  update(_: WebGLRenderer, __: WebGLRenderTarget, deltaTime: number): void {
    const timeUniform = this.uniforms.get("uTime");
    if (timeUniform) timeUniform.value += deltaTime * 0.15;
  }
}

export default HeatwaveEffect;
