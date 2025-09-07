
import { useState, useEffect, useCallback, useRef } from 'react';

// Use the new, correct API key provided by the user.
const ELEVENLABS_API_KEY = 'sk_44c589ae4c0890134e7d03422b51382cfe3615b74af79233';
// Use the voice ID from the user's example for a better voice.
const ELEVENLABS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // Antoni

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // isSupported now primarily reflects the availability of the fallback
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    // Stop browser TTS
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const fallbackSpeak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Ensure any previous speech is stopped
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error:", e);
        setIsSpeaking(false);
    }
    window.speechSynthesis.speak(utterance);
  }, []);


  const speak = useCallback(async (text: string) => {
    if (isSpeaking) {
      return;
    }
    stop(); // Ensure everything is stopped before starting a new speech
    setIsSpeaking(true);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          // Use the newer, more capable model from the user's example
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
        }),
      });

      if (!response.ok) {
        // Log the error for debugging but don't show to the user
        console.error(`ElevenLabs API request failed with status ${response.status}`, await response.text());
        throw new Error('ElevenLabs API request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
          console.error("Error playing ElevenLabs audio, using fallback.");
          setIsSpeaking(false); // Reset state before fallback
          fallbackSpeak(text);
      }
      
      await audio.play();

    } catch (error) {
      console.error('ElevenLabs TTS failed, switching to fallback:', error);
      fallbackSpeak(text);
    }
  }, [isSpeaking, stop, fallbackSpeak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { isSpeaking, isSupported, speak, stop };
};
