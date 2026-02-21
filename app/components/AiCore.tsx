"use client";
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const Core = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    meshRef.current.rotation.y += delta * 0.1;
    const scale = 1 + 0.05 * Math.sin(time.current * 2);
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Icosahedron ref={meshRef} args={[2.5, 5]}>
      <meshBasicMaterial color="#00ffff" wireframe />
    </Icosahedron>
  );
};

const Shell = ({ rotationSpeed = 0.05 }: { rotationSpeed?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    useFrame((_, delta) => {
        meshRef.current.rotation.x += delta * rotationSpeed;
        meshRef.current.rotation.y += delta * rotationSpeed;
    });

    return (
        <Icosahedron ref={meshRef} args={[3, 5]}>
          <meshStandardMaterial
            color="#8A2BE2"
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Icosahedron>
    );
}

export const AiCoreScene = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0 opacity-50">
    <Canvas>
      <ambientLight intensity={1} />
      <Core />
      <Shell rotationSpeed={0.03}/>
      <Shell rotationSpeed={-0.02}/>
    </Canvas>
  </div>
);