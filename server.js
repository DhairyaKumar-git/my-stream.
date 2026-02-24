const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Public folder (HTML, CSS) serve karne ke liye
app.use(express.static("public"));

// Videos folder serve karne ke liye
app.use("/videos", express.static("videos"));

// Simple video streaming route
app.get("/video/:name", (req, res) => {
  const videoPath = path.join(__dirname, "videos", req.params.name);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found");
  }
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Server start
app.listen(PORT, () => {
  console.log("Server running at http://localhost:3000");
});