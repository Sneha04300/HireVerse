import { useState, useRef, useCallback } from "react";
import api from "../services/api";

const isDev = process.env.NODE_ENV === "development";

export default function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        setRecordingState("transcribing");
        if (isDev) console.log("[AudioRecorder] Audio uploaded for transcription");

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const response = await api.post("/mock/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const text = response.data?.text || response.data?.data?.text || "";
          if (isDev) console.log("[AudioRecorder] Transcript received:", text?.slice(0, 100));
          setTranscript(text);
          setRecordingState("ready");
        } catch (err) {
          console.error("[AudioRecorder] Transcription failed:", err);
          setError("Unable to transcribe audio.");
          setRecordingState("idle");
        }

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setRecordingState("recording");
      if (isDev) console.log("[AudioRecorder] Recording started");
    } catch (err) {
      console.error("[AudioRecorder] Failed to start recording:", err);
      setError("Microphone access denied or unavailable.");
      setRecordingState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (isDev) console.log("[AudioRecorder] Recording stopped");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
    setRecordingState("idle");
  }, []);

  return {
    recordingState,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}
