"use client";

import React, { useEffect, useState } from "react";

interface VoiceVisualizerProps {
  isListening: boolean;
}

export const VoiceVisualizer = ({ isListening }: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(15).fill(10));

  useEffect(() => {
    if (!isListening) {
      setBars(Array(15).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array(15)
          .fill(0)
          .map(() => Math.floor(Math.random() * 60) + 10)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          style={{ height: `${height}px` }}
          className="w-1 bg-white rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;