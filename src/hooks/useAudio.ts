"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface AudioOptions {
  src: string;
  fallbackText: string;
  lang?: string;
}

export function useAudio({ src, fallbackText, lang = "ja-JP" }: AudioOptions) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reducedData = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-data: reduce)").matches;
  }, []);

  const ensureAudio = useCallback(async () => {
    if (!src) {
      return null;
    }
    if (audioRef.current || reducedData) {
      return audioRef.current;
    }
    setLoading(true);
    return new Promise<HTMLAudioElement | null>((resolve) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = "metadata";
      audio.addEventListener("canplaythrough", () => {
        audioRef.current = audio;
        setLoading(false);
        resolve(audio);
      });
      audio.addEventListener("error", () => {
        setLoading(false);
        setError("Audio unavailable");
        resolve(null);
      });
      audio.load();
    });
  }, [src, reducedData]);

  useEffect(() => {
    setError(null);
    audioRef.current = null;
  }, [src]);

  const speakFallback = useCallback(async () => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [fallbackText, lang]);

  const play = useCallback(async () => {
    const audio = await ensureAudio();
    if (audio) {
      try {
        await audio.play();
        return;
      } catch (err) {
        setError((err as Error).message);
      }
    }
    await speakFallback();
  }, [ensureAudio, speakFallback]);

  return {
    play,
    isLoading,
    error,
    hasNativeAudio: !reducedData && Boolean(src)
  };
}
