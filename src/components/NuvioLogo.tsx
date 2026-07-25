"use client";

import React from "react";

export const NuvioLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glowing ring */}
      <div
        className={`absolute rounded-full border border-indigo-400/20 animate-ping duration-1000 ${dimensions[size]}`}
      />
      {/* Middle rotating ring */}
      <div
        className={`absolute rounded-full border-2 border-dashed border-indigo-500/40 animate-spin [animation-duration:10s] ${dimensions[size]}`}
      />
      {/* Inner solid ring */}
      <div
        className={`absolute rounded-full border border-white/60 ${
          size === "sm" ? "w-8 h-8" : size === "md" ? "w-16 h-16" : "w-24 h-24"
        }`}
      />
      {/* Core glowing orb */}
      <div
        className={`rounded-full bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.8)] animate-pulse ${
          size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"
        }`}
      />
    </div>
  );
};

export default NuvioLogo;