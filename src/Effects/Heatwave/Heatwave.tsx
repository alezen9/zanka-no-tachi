import { useMemo } from "react";
import HeatwaveEffect from "./HeatwaveEffect";

const Heatwave = () => {
  const effect = useMemo(() => new HeatwaveEffect(), []);
  return <primitive object={effect} />;
};

export default Heatwave;
