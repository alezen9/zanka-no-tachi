import { AmbientLightProps, PointLightProps } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import useInterfaceStore from "../stores/useInterfaceStore";
import { AmbientLight, PointLight } from "three";
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
      <CustomAmbientLight intensity={0} />
      <CustomPointLight
        color="darkorange"
        position={[0, 10, -10]}
        intensity={200}
        decay={2}
      />
      <CustomPointLight
        color="darkorange"
        position={[-3, 15, 3]}
        intensity={500}
        decay={3}
      />
      <CustomPointLight
        color="darkorange"
        position={[3, 15, 3]}
        intensity={500}
        decay={3}
      />
    </>
  );
};

export default Lighting;

const CustomAmbientLight = (props: AmbientLightProps) => {
  const { intensity } = props;
  const light = useRef<AmbientLight>(null);
  const gsapRef = useRef<GSAPTween>();

  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        gsapRef.current?.kill();
        gsapRef.current = gsap.to(light.current, {
          intensity: state.isBankaiActive ? 2 : intensity,
          duration: state.isBankaiActive ? 0.25 : 0,
          ease: "power2.out",
          delay: state.isBankaiActive ? 0.5 : 0,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [intensity]);

  return <ambientLight {...props} ref={light} />;
};

const CustomPointLight = (props: PointLightProps) => {
  const { intensity = 1 } = props;
  const light = useRef<PointLight>(null);
  const gsapRef = useRef<GSAPTween>();

  useEffect(() => {
    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        gsapRef.current?.kill();
        gsapRef.current = gsap.to(light.current, {
          intensity: state.isBankaiActive ? 0 : intensity,
          duration: state.isBankaiActive ? 0.25 : 0,
          ease: "power2.out",
          delay: state.isBankaiActive ? 0.5 : 0,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [intensity]);

  return <pointLight {...props} ref={light} />;
};
