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
    console.log("[useAudioRecorder] ===== startRecording CALLED =====");
    try {
      setError(null);
      setTranscript("");

      console.log("[useAudioRecorder] Calling navigator.mediaDevices.getUserMedia({ audio: true })");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("[useAudioRecorder] getUserMedia SUCCEEDED — microphone permission GRANTED");
      streamRef.current = stream;

      console.log("[useAudioRecorder] Creating MediaRecorder");
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      console.log("[useAudioRecorder] MediaRecorder CREATED, state:", recorder.state);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        console.log("[AudioRecorder] Recording stopped");

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        if (!blob.size) {
          console.error("[AudioRecorder] Empty recording");
          setError("Empty recording. Please try again.");
          setRecordingState("idle");
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          return;
        }

        setRecordingState("transcribing");
        console.log("[AudioRecorder] Uploading audio");

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const response = await api.post("/mock/transcribe", formData, {
            timeout: 30000,
          });

          console.log("[AudioRecorder] Upload completed");

          console.log("[AudioRecorder] Whisper transcription started");

          const text = response.data?.transcript || response.data?.data?.transcript || "";
          console.log("[AudioRecorder] Whisper transcription completed");
          console.log("[AudioRecorder] Transcript received:", JSON.stringify(text));

          setTranscript(text);
          setRecordingState("ready");
        } catch (err) {
          console.error("[AudioRecorder] Transcription failed:", err.message);
          setError("Unable to transcribe audio. Please try again.");
          setRecordingState("idle");
        }

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      console.log("[useAudioRecorder] About to call recorder.start()");
      recorder.start();
      console.log("[useAudioRecorder] recorder.start() called, MediaRecorder state:", recorder.state);
      setRecordingState("recording");
      console.log("[useAudioRecorder] Recording STARTED — state set to 'recording'");
    } catch (err) {
      console.error("[AudioRecorder] Failed to start recording:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Unable to access microphone.");
      }
      setRecordingState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("[useAudioRecorder] stopRecording called, mediaRecorderRef.current:", !!mediaRecorderRef.current, "state:", mediaRecorderRef.current?.state);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      console.log("[useAudioRecorder] Calling mediaRecorder.stop()");
      mediaRecorderRef.current.stop();
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
