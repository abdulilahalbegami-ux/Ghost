"use client";

import React, { useState } from "react";
import { Brain, Trash2, Plus, Shield, Check } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Memory {
  id: string;
  category: string;
  content: string;
}

export const MemoryManager = () => {
  const [memories, setMemories] = useState<Memory[]>([
    { id: "1", category: "Food", content: "Prefers pepperoni pizza from local pizzerias." },
    { id: "2", category: "Schedule", content: "Prefers appointments after 5:00 PM on weekdays." },
    { id: "3", category: "Budget", content: "Always looks for the cheapest flight and hotel options." },
    { id: "4", category: "Tone", content: "Prefers professional and concise email drafts." },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isLearningEnabled, setIsLearningEnabled] = useState(true);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newContent) return;

    const newMemory: Memory = {
      id: Date.now().toString(),
      category: newCategory,
      content: newContent,
    };

    setMemories([newMemory, ...memories]);
    setNewCategory("");
    setNewContent("");
    showSuccess("Ghost updated its memory core.");
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    showSuccess("Memory forgotten successfully.");
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-white animate-pulse" />
          <h2 className="text-lg font-semibold tracking-wider uppercase">Ghost Memory Core</h2>
        </div>
        <button
          onClick={() => {
            setIsLearningEnabled(!isLearningEnabled);
            showSuccess(isLearningEnabled ? "Autonomous learning paused." : "Autonomous learning active.");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            isLearningEnabled
              ? "bg-white text-black border-white"
              : "bg-transparent text-white/50 border-white/20"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {isLearningEnabled ? "Learning Active" : "Learning Paused"}
        </button>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAddMemory} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-white/60 uppercase tracking-wider">Teach Ghost something new</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Category (e.g. Travel)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="col-span-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
          />
          <input
            type="text"
            placeholder="What should Ghost remember?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="col-span-2 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90 font-medium py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Commit to Memory
        </button>
      </form>

      {/* Memory List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="flex items-start justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all group"
          >
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 bg-white/10 text-[10px] font-semibold uppercase tracking-wider rounded text-white/80">
                {memory.category}
              </span>
              <p className="text-sm text-white/90">{memory.content}</p>
            </div>
            <button
              onClick={() => handleDeleteMemory(memory.id)}
              className="text-white/40 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryManager;