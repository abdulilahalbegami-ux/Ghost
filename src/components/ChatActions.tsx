"use client";

import React, { useState } from "react";
import { Copy, Share2, Volume2, VolumeX, Check } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface ChatActionsProps {
  text: string;
}

export const ChatActions = ({ text }: ChatActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      showSuccess("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      showError("Failed to copy text.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Vertex AI Response",
          text: text,
        });
        showSuccess("Shared successfully!");
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showSuccess("Share link copied to clipboard!");
      } catch (err) {
        showError("Failed to share.");
      }
    }
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const newUtterance = new SpeechSynthesisUtterance(text);
        newUtterance.onend = () => setIsSpeaking(false);
        newUtterance.onerror = () => setIsSpeaking(false);
        setUtterance(newUtterance);
        setIsSpeaking(true);
        window.speechSynthesis.speak(newUtterance);
      }
    } else {
      showError("Text-to-speech is not supported in this browser.");
    }
  };

  // Cleanup speech on unmount
  React.useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        title="Copy message"
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      <button
        onClick={handleShare}
        title="Share message"
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleSpeak}
        title={isSpeaking ? "Stop reading" : "Read out loud"}
        className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all ${
          isSpeaking ? "text-emerald-400 bg-emerald-500/10" : "text-white/60 hover:text-white"
        }`}
      >
        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default ChatActions;