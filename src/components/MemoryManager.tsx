"use client";

import React, { useState } from "react";
import { Brain, Trash2, Plus, Shield, Search, Tag, AlertCircle, Network } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Memory {
  id: string;
  category: string;
  content: string;
  importance: "high" | "medium" | "low";
  dateAdded: string;
  tags: string[];
}

export const MemoryManager = () => {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: "1",
      category: "Food",
      content: "Prefers pepperoni pizza from local pizzerias.",
      importance: "medium",
      dateAdded: "2025-02-15",
      tags: ["pizza", "dinner", "preferences"],
    },
    {
      id: "2",
      category: "Schedule",
      content: "Prefers appointments after 5:00 PM on weekdays.",
      importance: "high",
      dateAdded: "2025-02-14",
      tags: ["calendar", "work", "availability"],
    },
    {
      id: "3",
      category: "Budget",
      content: "Always looks for the cheapest flight and hotel options.",
      importance: "high",
      dateAdded: "2025-02-12",
      tags: ["travel", "finance", "savings"],
    },
    {
      id: "4",
      category: "Tone",
      content: "Prefers professional and concise email drafts.",
      importance: "low",
      dateAdded: "2025-02-10",
      tags: ["writing", "email", "style"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImportance, setNewImportance] = useState<"high" | "medium" | "low">("medium");
  const [newTags, setNewTags] = useState("");
  const [isLearningEnabled, setIsLearningEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newContent) return;

    const newMemory: Memory = {
      id: Date.now().toString(),
      category: newCategory,
      content: newContent,
      importance: newImportance,
      dateAdded: new Date().toISOString().split("T")[0],
      tags: newTags ? newTags.split(",").map((t) => t.trim().toLowerCase()) : [],
    };

    setMemories([newMemory, ...memories]);
    setNewCategory("");
    setNewContent("");
    setNewTags("");
    showSuccess("Nuvio updated its memory core.");
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    showSuccess("Memory forgotten successfully.");
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-semibold tracking-wider uppercase">Nuvio Memory Core</h2>
            <p className="text-[10px] text-zinc-400 dark:text-white/40">Semantic knowledge graph & user preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-zinc-200 dark:border-white/10">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                viewMode === "list"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                viewMode === "graph"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Semantic Graph
            </button>
          </div>
          <button
            onClick={() => {
              setIsLearningEnabled(!isLearningEnabled);
              showSuccess(isLearningEnabled ? "Autonomous learning paused." : "Autonomous learning active.");
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              isLearningEnabled
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent"
                : "bg-transparent text-zinc-500 dark:text-white/50 border-zinc-200 dark:border-white/20"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {isLearningEnabled ? "Learning Active" : "Learning Paused"}
          </button>
        </div>
      </div>

      {/* Memory Health Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Memory Health</p>
            <p className="text-base font-bold font-mono">98.4%</p>
          </div>
          <AlertCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Total Nodes</p>
            <p className="text-base font-bold font-mono">{memories.length} Active</p>
          </div>
          <Network className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Last Synced</p>
            <p className="text-xs font-bold font-mono">Just now</p>
          </div>
          <Brain className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Search & Add Memory Form */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search memories, tags, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
              />
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3 bg-zinc-100 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10">
              <p className="text-xs text-zinc-500 dark:text-white/60 uppercase tracking-wider font-bold">Teach Nuvio something new</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Category (e.g. Travel)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="What should Nuvio remember?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="sm:col-span-2 bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-white/40">Importance:</span>
                  <div className="flex bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                    {(["high", "medium", "low"] as const).map((imp) => (
                      <button
                        key={imp}
                        type="button"
                        onClick={() => setNewImportance(imp)}
                        className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider transition-all ${
                          newImportance === imp
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                            : "text-zinc-500 dark:text-white/60"
                        }`}
                      >
                        {imp}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Tags (comma separated: pizza, dinner)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-medium py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Commit to Memory
              </button>
            </form>
          </div>

          {/* Memory List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="flex items-start justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition-all group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2 py-0.5 bg-zinc-100 dark:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded text-zinc-600 dark:text-white/80">
                      {memory.category}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        memory.importance === "high"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : memory.importance === "medium"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                      }`}
                    >
                      {memory.importance}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-white/30 font-mono">{memory.dateAdded}</span>
                  </div>
                  <p className="text-xs md:text-sm text-zinc-800 dark:text-white/90">{memory.content}</p>
                  {memory.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      {memory.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] text-zinc-500 dark:text-white/50 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMemory(memory.id)}
                  className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Semantic Graph Visualization */
        <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 h-64 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative flex flex-wrap items-center justify-center gap-6 max-w-md">
            {/* Core Node */}
            <div className="absolute w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-indigo-500" />
            </div>

            {/* Connected Nodes */}
            {memories.map((m, idx) => {
              const angle = (idx / memories.length) * 2 * Math.PI;
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={m.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/20 rounded-xl text-[10px] font-semibold shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{m.category}</span>
                </div>
              );
            })}
          </div>
          <p className="absolute bottom-3 text-[9px] text-zinc-400 dark:text-white/30 uppercase tracking-wider font-bold">
            Interactive Semantic Link Map
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryManager;