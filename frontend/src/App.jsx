import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default function App() {
  const [objText, setObjText] = useState(null);
  const [svgUrl, setSvgUrl] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setSvgUrl(null);
    setObjText(null);
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
      const url = URL.createObjectURL(svgBlob);
      setSvgUrl(url);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* タイトル */}
      <h1
        style={{
          textAlign: "center",
          margin: 0,
          padding: "16px",
          borderBottom: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        Pattern Generator
      </h1>

      {/* メイン */}
      <div style={{ flex: 1, display: "flex", gap: "1rem", padding: "1rem" }}>

        {/* 左: 画像 */}
        <div style={{ flex: 1 }}>
          {imgUrl && (
            <img
              src={imgUrl}
              style={{ width: "100%", objectFit: "contain" }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleUploadImg} />
        </div>

        {/* 中: OBJ */}
        <div
          style={{
            width: "400px",
            height: "400px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {objText ? (
          <Canvas
            style={{ width: "100%", height: "100%" }}
            camera={{ position: [0, 0, 5] }}
          >
            <ambientLight />
            <Model objText={objText} />
            <OrbitControls />
          </Canvas>
        ) : (
          <div
            style={{
              display: "flex",
              width: "400px",
              height: "400px",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
            }}
          >
            Mesh is coming ...
          </div>
        )}
        </div>

        {/* 右: SVG */}
        <div style={{ flex: 1 }}>
          <div style={{ height: "100%" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                ⏳ Generating Pattern...
              </div>
            ) : (
              svgUrl && (
                <>
                  <img
                    src={svgUrl}
                    style={{ width: "100%", objectFit: "contain" }}
                  />

                  <a
                    href={svgUrl}
                    download="pattern.svg"
                    style={{
                      display: "block",
                      marginTop: "10px",
                      textAlign: "center",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      textDecoration: "none",
                      color: "black",
                      background: "#f5f5f5",
                      cursor: "pointer",
                    }}
                  >
                    ⬇ Download SVG
                  </a>
                </>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}