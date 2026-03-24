import React, { useState } from "react";

export default function ObjUploader({ onFileLoad }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target.result;
      onFileLoad(contents);
    };

    reader.readAsText(file); // OBJはテキストなので
  };

  return (
    <div>
      <input type="file" accept=".obj" onChange={handleFileChange} />
      {fileName && <p>Uploaded: {fileName}</p>}
    </div>
  );
}