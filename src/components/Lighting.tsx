import { PointLightProps } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import useInterfaceStore from "../stores/useInterfaceStore";
import { PointLight } from "three";
import gsap from "gsap";

const Lighting = () => {
  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        // transition background color
        document.body.classList.toggle("bankai");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <group name="shikai-lights">
        <CustomPointLight
          color="darkorange"
          position={[0, 10, -5]}
          shikaiIntensity={5000}
          bankaiIntensity={0}
          decay={3}
        />
        <CustomPointLight
          color="darkorange"
          position={[-20, 10, -27.5]}
          shikaiIntensity={5000}
          bankaiIntensity={0}
          decay={3}
        />
        <CustomPointLight
          color="darkorange"
          position={[10, 10, -30]}
          shikaiIntensity={10000}
          bankaiIntensity={0}
          decay={3}
        />
        <CustomPointLight
          color="darkorange"
          position={[-5, 15, 5]}
          shikaiIntensity={5000}
          bankaiIntensity={0}
          decay={3}
        />
        <CustomPointLight
          color="darkorange"
          position={[5, 15, 5]}
          shikaiIntensity={5000}
          bankaiIntensity={0}
          decay={3}
        />
      </group>
      <group name="bankai-lights">
        <CustomPointLight
          color="white"
          position={[-10, 20, 0]}
          shikaiIntensity={0}
          bankaiIntensity={1000}
          decay={2}
        />
        <CustomPointLight
          color="white"
          position={[10, 20, 0]}
          shikaiIntensity={0}
          bankaiIntensity={1000}
          decay={2}
        />
      </group>
    </>
  );
};

export default Lighting;

const CustomPointLight = (
  props: Omit<PointLightProps, "intensity"> & {
    shikaiIntensity: number;
    bankaiIntensity: number;
  },
) => {
  const { shikaiIntensity, bankaiIntensity } = props;
  const light = useRef<PointLight>(null);
  const gsapRef = useRef<GSAPTween>();

  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        gsapRef.current?.kill();
        gsapRef.current = gsap.to(light.current, {
          intensity: state.isBankaiActive ? bankaiIntensity : shikaiIntensity,
          duration: state.isBankaiActive ? 0.25 : 0,
          ease: "power2.out",
          delay: state.isBankaiActive ? 0.5 : 0,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [shikaiIntensity, bankaiIntensity]);

  return (
    <pointLight
      {...props}
      intensity={shikaiIntensity}
      ref={light}
      // castShadow
      // shadow-mapSize={2048}
      // shadow-bias={-0.001}
    />
  );
};
