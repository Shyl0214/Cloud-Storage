import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const { "*": dirPath } = useParams(); // example: "images"
  console.log("Current dirPath:", dirPath);

  async function getDirectoryItems() {
    try {
      const url = dirPath
        ? `${BASE_URL}/directory/${dirPath}` // subdir
        : `${BASE_URL}/directory`; // root dir
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch directory items");
      }

      const data = await response.json();
      setDirectoryItems(data);
    } catch (err) {
      console.error("Error fetching directory:", err);
      setDirectoryItems([]);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirPath]); // reload if directory changes

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/files/${file.name}`, true);

    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const totalProgress = (e.loaded / e.total) * 100;
        setProgress(totalProgress.toFixed(2));
      }
    });

    xhr.send(file);
  }

  async function handleDelete(filename) {
    const response = await fetch(`${BASE_URL}/files/${filename}`, {
      method: "DELETE",
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  function renameFile(oldFilename) {
    setNewFilename(oldFilename);
  }

  async function saveFilename(oldFilename) {
    const response = await fetch(`${BASE_URL}/files/${oldFilename}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename }),
    });

    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  return (
    <>
      <h1>My Files</h1>

      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <p>Progress: {progress}%</p>

      {directoryItems.map(({ name, isDirectory }, i) => (
        <div key={i}>
          {name}{" "}
          {isDirectory ? (
            // ✅ Single level only
            <Link to={`/${name}`}>Open</Link>
          ) : (
            <>
              <a href={`${BASE_URL}/files/${name}?action=open`}>Open</a>{" "}
              <a href={`${BASE_URL}/files/${name}?action=download`}>Download</a>
            </>
          )}
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFilename(name)}>Save</button>
          <button onClick={() => handleDelete(name)}>Delete</button>
          <br />
        </div>
      ))}
    </>
  );
}

export default DirectoryView;
