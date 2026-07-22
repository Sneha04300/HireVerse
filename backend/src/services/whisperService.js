const Groq = require("groq-sdk");
const fs = require("fs");

const STT_MODEL = "whisper-large-v3-turbo";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function transcribeAudio(filePath) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  console.log("[Whisper] Transcription started");

  const client = getClient();
  const transcription = await client.audio.transcriptions.create({
    model: STT_MODEL,
    file: fs.createReadStream(filePath),
    response_format: "json",
  });

  console.log("[Whisper] Complete response:", JSON.stringify(transcription));

  const text = transcription.text || "";

  console.log("[Whisper] Transcription completed, text:", JSON.stringify(text));

  return text;
}

module.exports = { transcribeAudio };
