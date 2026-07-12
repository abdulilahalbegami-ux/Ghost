"use client";

import React, { useState } from "react";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface GeneratedImageProps {
  prompt: string;
  imageUrl: string;
}

export const GeneratedImage = ({ prompt, imageUrl }: GeneratedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `vertex-art-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Image download started!");
  };

  return (
    <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-white max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Vertex Imagine Core</span>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">HD 1024x1024</span>
      </div>

      <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 group">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-xs font-mono">Rendering pixels...</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={prompt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "scale-100 blur-0" : "scale-95 blur-md"
          }`}
        />
        {isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
            <p className="text-xs text-white/80 line-clamp-2 mr-4 italic">"{prompt}"</p>
            <button
              onClick={handleDownload}
              className="p-2 bg-white text-black hover:bg-white/90 rounded-lg transition-all shadow-lg flex-shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImage;