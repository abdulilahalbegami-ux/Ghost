"use client";

import React from "react";
import { FileText, X, Eye } from "lucide-react";

interface DocumentPreviewProps {
  name: string;
  size?: string;
  onRemove?: () => void;
  interactive?: boolean;
}

export const DocumentPreview = ({ name, size, onRemove, interactive = true }: DocumentPreviewProps) => {
  return (
    <div className="relative flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-white/10 max-w-xs group">
      <div className="p-2 bg-white/10 rounded-lg text-white">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{name}</p>
        {size && <p className="text-[10px] text-white/40">{size}</p>}
      </div>
      {interactive && onRemove && (
        <button
          onClick={onRemove}
          className="p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-full transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default DocumentPreview;