import { Effect } from "postprocessing";
import fragmentShader from "./fragment.glsl";
import { RepeatWrapping, Texture, TextureLoader, Uniform } from "three";
import leopardTextureUrl from "/pattern.webp?url";

type Uniforms = {
  uNoiseTexture: Uniform<Texture>;
};

class HeatwaveEffect extends Effect {
  constructor() {
    const loader = new TextureLoader();
    const texture = loader.load(leopardTextureUrl);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    const uniforms = new Map<keyof Uniforms, Uniforms[keyof Uniforms]>();
    uniforms.set("uNoiseTexture", new Uniform(texture));

    super("HeatwaveEffect", fragmentShader, {
      uniforms,
    });
  }
}

export default HeatwaveEffect;
