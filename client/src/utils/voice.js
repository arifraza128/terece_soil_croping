export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    mr: 'mr-IN',
    ur: 'ur-PK'
  };

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langMap[lang] || 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
