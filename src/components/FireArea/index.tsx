import Fire from "../Fire";

const FireArea = () => {
  return (
    <group scale={[5, 6, 5]} position-y={-1}>
      <Fire position={[0, 0, -3.5]} scale={[2, 1.2, 1]} particleScale={3.5} />

      <Fire
        position={[-1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <Fire position={[-2, 0, -1.5]} scale={[1, 0.9, 1]} particleScale={3} />
      <Fire position={[-3, 0, -0.5]} scale={[1, 0.6, 2]} particleScale={2.5} />

      <Fire
        position={[1, 0, -2.5]}
        scale={[1.5, 1.05, 1.5]}
        particleScale={4}
      />
      <Fire position={[2, 0, -1.5]} scale={[1, 0.9, 1]} particleScale={3} />
      <Fire position={[3, 0, -0.5]} scale={[1, 0.6, 2]} particleScale={2.5} />
    </group>
  );
};

export default FireArea;
