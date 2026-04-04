import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function LoginRobot({ state }) {
  const robotRef = useRef();
  const { scene } = useGLTF("/models/robot.glb");

  const targetColor = new THREE.Color();

  useFrame((_, delta) => {
    if (!robotRef.current) return;

    let targetY = 0;
    let rotationY = 0;

    if (state === "idle") {
      targetColor.set("#ffffff"); // white
      targetY = -0.5; // sitting
    }

    if (state === "success") {
      targetColor.set("#22c55e"); // green
      targetY = 0.5; // stand up
      rotationY = Math.sin(Date.now() * 0.002) * 0.1;
    }

    if (state === "error") {
      targetColor.set("#ef4444"); // red
      rotationY = Math.sin(Date.now() * 0.01) * 0.4; // shake head
    }

    robotRef.current.position.y = THREE.MathUtils.lerp(
      robotRef.current.position.y,
      targetY,
      0.05
    );

    robotRef.current.rotation.y = THREE.MathUtils.lerp(
      robotRef.current.rotation.y,
      rotationY,
      0.2
    );

    robotRef.current.traverse((child) => {
      if (child.isMesh) {
        child.material.color.lerp(targetColor, 0.05);
      }
    });
  });

  return (
    <primitive
      ref={robotRef}
      object={scene}
      scale={1.5}
      position={[0, -0.5, 0]}
    />
  );
}