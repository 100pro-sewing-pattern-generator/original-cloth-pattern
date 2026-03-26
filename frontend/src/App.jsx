import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default function App() {
  const [objText, setObjText] = useState(null);
  const [svgUrl, setSvgUrl] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  const handleUploadImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 画像表示
    setImgUrl(URL.createObjectURL(file));

    try {
      // -------------------------------
      // 画像 → OBJ
      // -------------------------------
      const formData = new FormData();
      formData.append("file", file);

      const res1 = await fetch("http://localhost:8000/image-to-obj", {
        method: "POST",
        body: formData,
      });

      if (!res1.ok) throw new Error("image-to-obj failed");

      const objBlob = await res1.blob();

      // OBJ表示用
      const objText = await objBlob.text();
      setObjText(objText);

      // -------------------------------
      // OBJ → SVG
      // -------------------------------
      const objFile = new File([objBlob], "generated.obj");

      const formData2 = new FormData();
      formData2.append("file", objFile);

      const res2 = await fetch("http://localhost:8002/predict", {
        method: "POST",
        body: formData2,
      });

      if (!res2.ok) throw new Error("obj-to-svg failed");

      const svgBlob = await res2.blob();
      const svgUrl = URL.createObjectURL(svgBlob);

      setSvgUrl(svgUrl);

    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  // OBJ表示
  // -------------------------------
  const Model = ({ objText }) => {
    const [object, setObject] = useState(null);

    useEffect(() => {
      if (!objText) return;
      const loader = new OBJLoader();
      const obj = loader.parse(objText);
      setObject(obj);
    }, [objText]);

    return object ? <primitive object={object} /> : null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* アップロード（画像のみ） */}
      <input type="file" accept="image/*" onChange={handleUploadImg} />

      <div style={{ display: "flex", gap: "1rem" }}>

        {/* 左: 画像 */}
        <div style={{ width: 400 }}>
          {imgUrl && <img src={imgUrl} style={{ width: "100%" }} />}
        </div>

        {/* 中: OBJ */}
        <div style={{ width: 400, height: 400 }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight />
            <Model objText={objText} />
            <OrbitControls />
          </Canvas>
        </div>

        {/* 右: SVG */}
        <div style={{ width: 400 }}>
          {svgUrl && <img src={svgUrl} style={{ width: "100%" }} />}
        </div>

      </div>
    </div>
  );
}