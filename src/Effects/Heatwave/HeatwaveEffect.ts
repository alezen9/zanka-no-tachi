import { Effect } from "postprocessing";
import fragmentShader from "./fragment.glsl";
import { RepeatWrapping, Texture, TextureLoader, Uniform } from "three";
import leopardTextureUrl from "/pattern.webp?url";
import useInterfaceStore from "../../stores/useInterfaceStore";
import gsap from "gsap";

type Uniforms = {
  uNoiseTexture: Uniform<Texture>;
  uStrength: Uniform<number>;
  uSize: Uniform<number>;
};

type MapKey = keyof Uniforms;
type MapValue<K extends MapKey> = Uniforms[K];

class HeatwaveEffect extends Effect {
  private unsubsribe: VoidFunction | undefined;

  constructor() {
    const loader = new TextureLoader();
    const texture = loader.load(leopardTextureUrl);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    const uniforms = new Map<MapKey, MapValue<MapKey>>();
    uniforms.set("uNoiseTexture", new Uniform(texture));
    uniforms.set("uStrength", new Uniform(0));
    uniforms.set("uSize", new Uniform(0));

    super("HeatwaveEffect", fragmentShader, {
      uniforms,
    });
  }

  initialize() {
    this.animateWhenActive();
  }

  private animateWhenActive() {
    this.unsubsribe = useInterfaceStore.subscribe((state, prevState) => {
      const uStrength = this.uniforms.get("uStrength");
      const uSize = this.uniforms.get("uSize");
      if (!uStrength || !uSize) return;
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        gsap.killTweensOf(uStrength);
        gsap.killTweensOf(uSize);
        if (!state.isBankaiActive) {
          uStrength.value = 0;
          uSize.value = 0;
        } else {
          gsap.to(uStrength, {
            value: 0.002,
            duration: 5,
            delay: 2.5,
          });
          gsap.to(uSize, {
            value: 1,
            duration: 5,
            delay: 2.5,
          });
        }
      }
    });
  }

  dispose() {
    this.unsubsribe?.();
  }
}

export default HeatwaveEffect;
