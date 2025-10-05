import { useState, useRef, useCallback } from 'react';

export const useAudioVisualizer = () => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setIsInitializing(true);
    try {
      if (audioContextRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Fix: Cast window to 'any' to allow access to vendor-prefixed webkitAudioContext for broader browser compatibility.
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      
      source.connect(analyserNode);
      setAnalyser(analyserNode);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // You might want to set an error state here
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyser(null);
  }, []);

  return { analyser, isInitializing, start, stop };
};