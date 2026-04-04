import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CyberRoboModel({ agentState }) {
  const { scene } = useGLTF("/models/robot.glb");
  const modelRef = useRef();

  useFrame((state) => {
    if (!modelRef.current) return;

    const t = state.clock.getElapsedTime();

    // floating
    modelRef.current.position.y = Math.sin(t) * 0.1;

    // follow cursor
    modelRef.current.rotation.y = THREE.MathUtils.lerp(
      modelRef.current.rotation.y,
      state.pointer.x * 0.5,
      0.1
    );

    // error shake
    if (agentState === "error") {
      modelRef.current.rotation.z = Math.sin(t * 40) * 0.2;
    } else {
      modelRef.current.rotation.z = THREE.MathUtils.lerp(
        modelRef.current.rotation.z,
        0,
        0.1
      );
    }
  });

  return <primitive ref={modelRef} object={scene} scale={1.5} />;
}

export default CyberRoboModel;

useGLTF.preload("/models/robot.glb");