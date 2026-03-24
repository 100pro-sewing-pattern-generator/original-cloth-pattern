import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import ObjUploader from "./ObjUploader";

function Model({ objText }) {
  const [object, setObject] = useState();

  React.useEffect(() => {
    if (!objText) return;
    const loader = new OBJLoader();
    const obj = loader.parse(objText);
    setObject(obj);
  }, [objText]);

  if (!object) return null;
  return <primitive object={object} />;
}

export default function App() {
  const [objText, setObjText] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ObjUploader onFileLoad={setObjText} />
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {objText && <Model objText={objText} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
}