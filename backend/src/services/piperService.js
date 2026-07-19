const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const AUDIO_DIR = path.join(__dirname, "..", "..", "audio");

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

function getPiperPath() {
  let piperPath = process.env.PIPER_PATH;
  if (!piperPath) throw new Error("PIPER_PATH is not set in environment variables.");
  if (process.platform === "win32" && !piperPath.endsWith(".exe")) {
    piperPath += ".exe";
  }
  return piperPath;
}

function getPiperModel() {
  const modelPath = process.env.PIPER_MODEL;
  if (!modelPath) throw new Error("PIPER_MODEL is not set in environment variables.");
  if (!fs.existsSync(modelPath)) throw new Error(`Piper model file not found: ${modelPath}`);
  return modelPath;
}

function speak(text) {
  return new Promise((resolve, reject) => {
    const filename = `${crypto.randomBytes(12).toString("hex")}.wav`;
    const outputPath = path.join(AUDIO_DIR, filename);

    const piperPath = getPiperPath();
    const modelPath = getPiperModel();

    const child = execFile(
      piperPath,
      ["--model", modelPath, "--output_file", outputPath],
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Piper failed: ${error.message}`));
          return;
        }
        resolve({ filename, path: outputPath, url: `/audio/${filename}` });
      }
    );

    if (child.stdin) {
      child.stdin.write(text);
      child.stdin.end();
    }
  });
}

function cleanupAudio(filename) {
  const filePath = path.join(AUDIO_DIR, filename);
  fs.unlink(filePath, (err) => {
    if (err) console.error("[Piper] Failed to delete audio file:", err.message);
  });
}

module.exports = { speak, cleanupAudio };
