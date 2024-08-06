import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { saveAs } from 'file-saver'; 

function RevolutJoint({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[15, 15, 2, 32]} />
      <meshLambertMaterial color={0xdf1111} transparent opacity={1}/>
    </mesh>
  );
}

function Link({ position, dimensions, color }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={dimensions} />
      <meshLambertMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

function Manipulator({ angles }) {
  const linkRefs = useRef(angles.map(() => React.createRef()));

  useFrame(() => {
      linkRefs.current.forEach((ref, index) => {
          if (ref.current) {
              // Apply rotation only to links based on the angles
              ref.current.rotation.z = angles[index] * (Math.PI / 180);
          }
      });
  });

  return (
      <>
          <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]} />  
          <Chain angles={angles} refs={linkRefs.current} index={0} />
      </>
  );
}

function Chain({ angles, refs, index }) {
  if (index >= angles.length) return null;
  const position = [0, 40 * index, 0];  // Adjust position to stack links correctly
  return (
      <group ref={refs[index]} position={position} rotation={[0, 0, angles[index] * (Math.PI / 180)]}>
          <Link dimensions={[5, 5, 40]} color={'orange'} position={[0, 20, 0]} />
          <Chain angles={angles} refs={refs} index={index + 1} />
      </group>
  );
}


function GridHelper() {
  const { scene } = useThree();
  useEffect(() => {
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);
    return () => {
      scene.remove(gridHelper);
    };
  }, [scene]);
  return null;
}

export default function RobotComponent() {
  const [angles, setAngles] = useState([0, 0]);  
  // const [angles, setAngles] = useState([0]);  

  const increaseAngle1 = () => setAngles((prev) => [Math.min(prev[0] + 1, 90), prev[1]]);
  const decreaseAngle1 = () => setAngles((prev) => [Math.max(prev[0] - 1, -90), prev[1]]);
  const increaseAngle2 = () => setAngles((prev) => [prev[0], Math.min(prev[1] + 1, 90)]);
  const decreaseAngle2 = () => setAngles((prev) => [prev[0], Math.max(prev[1] - 1, -90)]);

  const saveAngles = () => {
    const filename = prompt('Enter the filename to save joint angles:', 'joint_angles.txt');
    if (filename) {
      const fileContent = `Joint 1 Angle: ${angles[0]} degrees\nJoint 2 Angle: ${angles[1]} degrees`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
    }
  };

  return (
    <>
      <div id="control-panel">
        <div>
          <label>Joint 1: </label>
          <button onClick={increaseAngle1}>+</button>
          <input type="text" value={angles[0]} readOnly />
          <button onClick={decreaseAngle1}>-</button>
        </div>
        <div>
          <label>Joint 2: </label>
          <button onClick={increaseAngle2}>+</button>
          <input type="text" value={angles[1]} readOnly />
          <button onClick={decreaseAngle2}>-</button>
        </div>
        <button onClick={saveAngles}>Save</button>
      </div>
      <Canvas camera={{position:[300,140,100],fov:75}}>
        <ambientLight intensity={0.4}/>
        <OrbitControls/>
        <GridHelper/>
        <Manipulator angles={angles} />
      </Canvas>
    </>
  );
}