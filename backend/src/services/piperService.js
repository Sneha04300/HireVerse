const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const AUDIO_DIR = path.join(__dirname, "..", "..", "public", "audio");

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

function generateSpeech(text) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const filename = `question_${timestamp}.wav`;
    const outputPath = path.join(AUDIO_DIR, filename);

    const piperPath = getPiperPath();
    const modelPath = getPiperModel();

    console.log("[Piper] Speech Generated");

    const child = spawn(piperPath, [
      "--model", modelPath,
      "--output_file", outputPath,
    ], {
      stdio: ["pipe", "ignore", "ignore"],
    });

    child.on("error", (err) => {
      reject(new Error(`Piper failed: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Piper exited with code ${code}`));
        return;
      }
      console.log("[Piper] Audio Path:", `/audio/${filename}`);
      resolve({ filename, path: outputPath, url: `/audio/${filename}` });
    });

    child.stdin.write(text);
    child.stdin.end();
  });
}

module.exports = { generateSpeech, speak: generateSpeech };
