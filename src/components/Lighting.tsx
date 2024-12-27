import { PointLightProps } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import useInterfaceStore from "../stores/useInterfaceStore";
import { PointLight } from "three";
import gsap from "gsap";
import { BakeShadows } from "@react-three/drei";

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
          position={[0, 20, -20]}
          shikaiIntensity={1500}
          bankaiIntensity={0}
          decay={2}
          castShadow
        />
        <CustomPointLight
          color="darkorange"
          position={[0, 20, 5]}
          shikaiIntensity={1500}
          bankaiIntensity={0}
          decay={2}
        />
      </group>
      <group name="bankai-lights">
        <CustomPointLight
          color="white"
          position={[0, 20, -20]}
          shikaiIntensity={0}
          bankaiIntensity={1500}
          decay={2}
          castShadow
        />
        <CustomPointLight
          color="white"
          position={[0, 20, 5]}
          shikaiIntensity={0}
          bankaiIntensity={1500}
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
    <>
      <BakeShadows />
      <pointLight
        {...props}
        intensity={shikaiIntensity}
        ref={light}
        shadow-mapSize={2048}
        shadow-bias={-0.001}
      />
    </>
  );
};
