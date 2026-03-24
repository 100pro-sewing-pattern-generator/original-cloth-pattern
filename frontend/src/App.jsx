import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default function ObjViewerWithSVG() {
  const [objText, setObjText] = useState(null);
  const [svgUrl, setSvgUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // OBJファイル読み込み
    const text = await file.text();
    setObjText(text);

    // サーバーに送信してSVG取得
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8002/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      console.log(url)
      setSvgUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  // OBJ表示用コンポーネント
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
      {/* ファイル選択ボタン */}
      <div style={{ flexBasis: "100%" }}>
        <input type="file" accept=".obj" onChange={handleFileChange} />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
      {/* 左: OBJ表示 */}
      <div style={{ width: "500px", height: "500px", justifyContent: "center", alignItems: "center"}}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 5]} />
          <Model objText={objText} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* 右: SVG表示 */}
      <div
        style={{
          width: "500px",
          height: "500px",
          display: "flex",
          justifyContent: "center", // 横方向中央
          alignItems: "center",     // 縦方向中央
        }}
      >
        {svgUrl && (
          <img
            src={svgUrl}
            alt="Generated SVG"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        )}
      </div>
    </div>
    </div>
  );
}