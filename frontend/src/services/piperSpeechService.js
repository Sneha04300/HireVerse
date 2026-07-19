let audioElement = null;

function getAudioElement() {
  if (!audioElement) {
    audioElement = new Audio();
  }
  return audioElement;
}

export function playAudio(url) {
  return new Promise((resolve) => {
    const audio = getAudioElement();
    audio.pause();
    audio.src = "";
    audio.src = url;
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play().catch(() => resolve());
  });
}

export function stopAudio() {
  const audio = getAudioElement();
  audio.pause();
  audio.src = "";
}
