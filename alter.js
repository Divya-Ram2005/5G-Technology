// filepath: c:\Users\sarve\OneDrive\Desktop\5G-tech\trace-vis\index.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import svgexport from "svgexport";

const app = express();
const PORT = process.env.PORT || 3000;

// Specify the directory to store uploaded files
const uploadDir = path.join(process.cwd(), "uploads"); // Change this to your desired path

// Create the uploads directory if it doesn't exist
fs.mkdirSync(uploadDir, { recursive: true });

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/osboxes/5g-trace-visualizer/doc"); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const originalNameWithoutExt = path.parse(file.originalname).name;
    cb(null, file.originalname); // Append timestamp to the file name
  },
});

const upload = multer({ storage: storage });
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Create an endpoint to handle file uploads
app.post("/trace", upload.single("uploadFile"), (req, res) => {
  // Access the file path and original name
  const filePath = req.file.path;
  const originalName = req.file.originalname;

  var command = `cd ; cd 5g-trace-visualizer ; python3 trace_visualizer.py -wireshark "OS" ./doc/${originalName}; sleep 5`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }

    svgexport(
      `/home/osboxes/5g-trace-visualizer/doc/${
        path.parse(req.file.filename).name
      }_OS.svg`,
      `${uploadDir}/output.png`,
      (err) => {
        if (err) {
          return res.status(500).send("Error converting SVG");
        }
        res.sendFile(`${uploadDir}/output.png`);
      }
    );
  });
});

// Serve static files (for front-end)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
