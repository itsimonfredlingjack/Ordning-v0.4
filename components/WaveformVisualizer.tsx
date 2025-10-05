
import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(155, 89, 182, 0.7)');
      gradient.addColorStop(0.5, 'rgba(155, 89, 182, 1)');
      gradient.addColorStop(1, 'rgba(155, 89, 182, 0.7)');
      
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = gradient;

      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} width="600" height="100" className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2" />;
};

export default WaveformVisualizer;
