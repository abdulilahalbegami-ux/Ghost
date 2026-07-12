"use client";

import React, { useState, useRef } from "react";
import { Download, Play, Pause, Sparkles, RefreshCw } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface GeneratedVideoProps {
  prompt: string;
  videoUrl: string;
}

export const GeneratedVideo = ({ prompt, videoUrl }: GeneratedVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `vertex-motion-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Video download started!");
  };

  return (
    <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-white max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Vertex Motion Core</span>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">MP4 1080p</span>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5 group">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-xs font-mono">Synthesizing frames...</span>
          </div>
        )}
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onClick={handlePlayPause}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "scale-100 blur-0" : "scale-95 blur-md"
          }`}
        />
        {isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="p-2 bg-white text-black hover:bg-white/90 rounded-lg transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/80 line-clamp-2 mr-4 italic">"{prompt}"</p>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-white text-black hover:scale-105 rounded-full transition-all shadow-lg flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedVideo;