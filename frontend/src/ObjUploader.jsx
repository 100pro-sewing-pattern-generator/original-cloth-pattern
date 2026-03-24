import React, { useState } from "react";

export default function ObjUploader({ onFileLoad }) {
  const [svgUrl, setSvgUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8002/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      const blob = await response.blob();

      // SVG用URLを作成してステートにセット
      const url = window.URL.createObjectURL(blob);
      setSvgUrl(url);

      // オプションで親コンポーネントにSVGを渡す
      if (onFileLoad) onFileLoad(blob);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input type="file" accept=".obj" onChange={handleFileChange} />

      {/* SVG表示部分 */}
      {svgUrl && (
        <img
          src={svgUrl}
          alt="Generated SVG"
          style={{ width: "100%", height: "auto", marginTop: "1rem" }}
        />
      )}
    </div>
  );
}