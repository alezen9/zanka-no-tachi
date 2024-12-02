import Fire from "../Fire";

const FireArea = () => {
  return (
    <group>
      <Fire
        position={[-5, 0, -7.5]}
        scale={2.5}
        particleScale={0.75}
        intensity={2}
      />
      <Fire position={[0, 0, -8]} scale={3.1} particleScale={1} intensity={2} />
      <Fire
        position={[5, 0, -7.5]}
        scale={2.5}
        particleScale={0.75}
        intensity={2}
      />

      {/** ========================================== */}

      <Fire
        position={[-6.5, 0, -5]}
        scale={2.2}
        particleScale={0.9}
        intensity={1.7}
      />
      <Fire
        position={[-2, 0, -5]}
        scale={3}
        particleScale={0.75}
        intensity={2}
      />
      <Fire
        position={[2, 0, -5]}
        scale={3}
        particleScale={0.75}
        intensity={1.5}
      />
      <Fire
        position={[6.5, 0, -5]}
        scale={2.2}
        particleScale={1}
        intensity={1.8}
      />

      {/** ========================================== */}

      <Fire
        position={[-8.5, 0, -2.5]}
        scale={1.9}
        particleScale={0.9}
        intensity={1.5}
      />
      <Fire
        position={[-4.5, 0, -2.5]}
        scale={2.5}
        particleScale={0.75}
        intensity={1}
      />
      <Fire
        position={[0, 0, -2.5]}
        scale={2}
        particleScale={0.8}
        intensity={1.3}
      />
      <Fire
        position={[4.5, 0, -2.5]}
        scale={2.5}
        particleScale={0.75}
        intensity={1.3}
      />
      <Fire
        position={[8.5, 0, -2.5]}
        scale={1.9}
        particleScale={1}
        intensity={1.15}
      />

      {/** ========================================== */}

      <Fire
        position={[-7.5, 0, 0]}
        scale={1.9}
        particleScale={0.9}
        intensity={1.5}
      />
      <Fire
        position={[-3.5, 0, 0]}
        scale={2.5}
        particleScale={0.75}
        intensity={1}
      />
      <Fire
        position={[3.5, 0, 0]}
        scale={2.5}
        particleScale={0.75}
        intensity={1.3}
      />
      <Fire
        position={[7.5, 0, 0]}
        scale={1.9}
        particleScale={1}
        intensity={1.15}
      />

      {/** ========================================== */}

      <Fire
        position={[-5.5, 0, 2]}
        scale={1.9}
        particleScale={0.9}
        intensity={1.5}
      />
      <Fire
        position={[5.5, 0, 2]}
        scale={2.5}
        particleScale={0.75}
        intensity={1}
      />
    </group>
  );
};

export default FireArea;
