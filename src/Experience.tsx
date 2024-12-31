import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Scene from "./components/Scene";
import { useEffect, useState } from "react";
import { EffectComposer } from "@react-three/postprocessing";
import Heatwave from "./Effects/Heatwave/Heatwave";
import useInterfaceStore from "./stores/useInterfaceStore";

const Experience = () => {
  const [isDebug] = useState(() => window.location.hash === "#debug");
  const [isEffectComposerEnabled, setIsEffectComposerEnabled] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const unsubscribe = useInterfaceStore.subscribe((state, prevState) => {
      if (state.isBankaiActive !== prevState.isBankaiActive) {
        clearTimeout(timeoutId);
        if (!state.isBankaiActive) {
          setIsEffectComposerEnabled(false);
        } else {
          timeoutId = setTimeout(() => {
            setIsEffectComposerEnabled(true);
          }, 2000);
        }
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {isDebug && <Perf position="top-left" />}
      <OrbitControls
        makeDefault
        enableDamping
        maxDistance={60}
        minDistance={6.5}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0}
      />
      <Scene position-y={-3} />
      <EffectComposer enabled={isEffectComposerEnabled}>
        <Heatwave />
      </EffectComposer>
    </>
  );
};

export default Experience;
