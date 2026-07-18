import { useState, useRef, useCallback, useEffect } from "react";

const ts = () => new Date().toISOString().slice(11, 23);

export default function useSpeechRecognition() {
  console.log("[HOOK] useSpeechRecognition function body invoked");
  console.log("[HOOK] window.SpeechRecognition:", window.SpeechRecognition);
  console.log("[HOOK] window.webkitSpeechRecognition:", window.webkitSpeechRecognition);

  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const finalRef = useRef("");
  const isActiveRef = useRef(false);

  const isSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  console.log("[HOOK] isSupported:", isSupported);

  const start = useCallback(() => {
    console.log(`[SR][${ts()}] === start() called ===`);
    console.log(`[SR][${ts()}] isSupported:`, isSupported);
    console.log(`[SR][${ts()}] has existing recognitionRef:`, !!recognitionRef.current);

    if (!isSupported) {
      console.error(`[SR][${ts()}] NOT SUPPORTED — setting error`);
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      const prev = recognitionRef.current;
      console.log(`[SR][${ts()}] Stopping previous recognition instance`);
      isActiveRef.current = false;
      try {
        prev.stop();
      } catch (e) {
        console.log(`[SR][${ts()}] stop() on previous threw:`, e);
      }
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    console.log(`[SR][${ts()}] Creating new SpeechRecognition instance`);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // ── Lifecycle callbacks ──────────────────────────────────────────────
    recognition.onstart = (event) => {
      console.log(`[SR][${ts()}] onstart fired`, event || "");
      setIsListening(true);
      setError(null);
    };

    recognition.onaudiostart = (event) => {
      console.log(`[SR][${ts()}] onaudiostart fired`, event || "");
    };

    recognition.onsoundstart = (event) => {
      console.log(`[SR][${ts()}] onsoundstart fired`, event || "");
    };

    recognition.onspeechstart = (event) => {
      console.log(`[SR][${ts()}] onspeechstart fired`, event || "");
    };

    recognition.onspeechend = (event) => {
      console.log(`[SR][${ts()}] onspeechend fired`, event || "");
    };

    recognition.onsoundend = (event) => {
      console.log(`[SR][${ts()}] onsoundend fired`, event || "");
    };

    recognition.onaudioend = (event) => {
      console.log(`[SR][${ts()}] onaudioend fired`, event || "");
    };

    recognition.onerror = (event) => {
      console.log(`[SR][${ts()}] onerror fired — error:`, event.error, "message:", event.message || "", "event:", event);

      if (event.error === "no-speech") {
        console.log(`[SR][${ts()}] no-speech — returning silently (recognition will restart via onend)`);
        return;
      }

      if (event.error === "audio-capture") {
        console.error(`[SR][${ts()}] audio-capture — no microphone detected`);
        setError("No microphone detected.");
        return;
      }

      if (event.error === "not-allowed") {
        console.error(`[SR][${ts()}] not-allowed — microphone permission denied`);
        setError("Microphone permission denied.");
        return;
      }

      console.error(`[SR][${ts()}] Unknown error:`, event.error);
      setError(event.error);
    };

    recognition.onend = (event) => {
      console.log(`[SR][${ts()}] onend fired`, event || "");

      setIsListening(false);

      const stillCurrent = recognitionRef.current === recognition;
      console.log(`[SR][${ts()}] recognitionRef.current === this recognition?`, stillCurrent);
      console.log(`[SR][${ts()}] isActiveRef.current:`, isActiveRef.current);

      if (stillCurrent) {
        recognitionRef.current = null;

        if (isActiveRef.current) {
          console.log(`[SR][${ts()}] Auto-restarting in 300ms`);
          setTimeout(() => {
            console.log(`[SR][${ts()}] Auto-restart timeout fired — calling start()`);
            start();
          }, 300);
        } else {
          console.log(`[SR][${ts()}] isActiveRef.current is false — NOT auto-restarting`);
        }
      } else {
        console.log(`[SR][${ts()}] recognitionRef has changed — NOT auto-restarting`);
      }
    };

    recognition.onresult = (event) => {
      console.log(`[SR][${ts()}] onresult fired`);
      console.log(`[SR][${ts()}] event.resultIndex:`, event.resultIndex);
      console.log(`[SR][${ts()}] event.results.length:`, event.results.length);
      console.log(`[SR][${ts()}] event.results:`, event.results);

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        console.log(`[SR][${ts()}]   result[${i}]:`);
        console.log(`[SR][${ts()}]     isFinal:`, result.isFinal);
        console.log(`[SR][${ts()}]     length:`, result.length);
        console.log(`[SR][${ts()}]     transcript[0]:`, result[0]?.transcript);
        console.log(`[SR][${ts()}]     confidence[0]:`, result[0]?.confidence);

        const transcript = result[0]?.transcript || "";
        if (result.isFinal) {
          const prevLen = finalRef.current.length;
          finalRef.current += (finalRef.current ? " " : "") + transcript;
          console.log(`[SR][${ts()}]     -> FINAL: "${transcript}" (finalRef: "${prevLen > 0 ? finalRef.current : '(starts now)'}")`);
        } else {
          interim += transcript;
          console.log(`[SR][${ts()}]     -> INTERIM: "${transcript}"`);
        }
      }

      console.log(`[SR][${ts()}] Accumulated interim: "${interim}"`);
      console.log(`[SR][${ts()}] Final ref value: "${finalRef.current}"`);
      console.log(`[SR][${ts()}] Calling setFinalText("${finalRef.current}")`);
      console.log(`[SR][${ts()}] Calling setInterimText("${interim}")`);

      setFinalText(finalRef.current);
      setInterimText(interim);
    };

    console.log(`[SR][${ts()}] Calling recognition.start()`);
    isActiveRef.current = true;
    try {
      recognition.start();
      recognitionRef.current = recognition;
      console.log(`[SR][${ts()}] recognition.start() succeeded`);
    } catch (e) {
      console.error(`[SR][${ts()}] recognition.start() THREW:`, e);
      recognitionRef.current = null;
      setError(`Speech recognition failed: ${e.message}`);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    console.log(`[SR][${ts()}] === stop() called ===`);
    console.log(`[SR][${ts()}] isActiveRef.current => false`);
    isActiveRef.current = false;
    if (recognitionRef.current) {
      console.log(`[SR][${ts()}] Calling recognition.stop()`);
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    console.log(`[SR][${ts()}] setIsListening(false)`);
  }, []);

  const resetTranscript = useCallback(() => {
    console.log(`[SR][${ts()}] === resetTranscript() called ===`);
    console.log(`[SR][${ts()}] finalRef was: "${finalRef.current}"`);
    finalRef.current = "";
    setFinalText("");
    setInterimText("");
    console.log(`[SR][${ts()}] finalRef cleared, setFinalText(""), setInterimText("")`);
  }, []);

  useEffect(() => {
    return () => {
      console.log(`[SR][${ts()}] === Cleanup on unmount ===`);
      isActiveRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  console.log("[HOOK] start function type:", typeof start);
  console.log("[HOOK] stop function type:", typeof stop);
  console.log("[HOOK] resetTranscript function type:", typeof resetTranscript);

  return {
    interimText,
    finalText,
    isListening,
    error,
    isSupported,
    start,
    stop,
    resetTranscript,
  };
}