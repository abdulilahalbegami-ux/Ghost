"use client";

import React, { useState, useEffect } from "react";
import { Brain, Trash2, Plus, Shield, Search, Tag, AlertCircle, Network } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import {
  getStoredMemories,
  addLongTermMemory,
  deleteLongTermMemory,
  isAutonomousLearningEnabled,
  setAutonomousLearningEnabled,
  MemoryItem,
} from "@/utils/memoryStore";

export const MemoryManager = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImportance, setNewImportance] = useState<"high" | "medium" | "low">("medium");
  const [newTags, setNewTags] = useState("");
  const [isLearningEnabled, setIsLearning] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const reloadMemories = () => {
    setMemories(getStoredMemories());
    setIsLearning(isAutonomousLearningEnabled());
  };

  useEffect(() => {
    reloadMemories();
    const handleUpdate = () => reloadMemories();
    window.addEventListener("nuvio_memory_updated", handleUpdate);
    return () => window.removeEventListener("nuvio_memory_updated", handleUpdate);
  }, []);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newContent.trim()) return;

    const tagsArr = newTags ? newTags.split(",").map((t) => t.trim()) : [];
    addLongTermMemory(newCategory, newContent, newImportance, tagsArr);

    setNewCategory("");
    setNewContent("");
    setNewTags("");
    showSuccess("Saved to Nuvio's Long-Term Memory Core.");
  };

  const handleDeleteMemory = (id: string) => {
    deleteLongTermMemory(id);
    showSuccess("Memory erased from long-term store.");
  };

  const handleToggleLearning = () => {
    const nextState = !isLearningEnabled;
    setAutonomousLearningEnabled(nextState);
    setIsLearning(nextState);
    showSuccess(nextState ? "Autonomous memory core active." : "Autonomous memory learning paused.");
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
            <p className="text-[10px] text-zinc-400 dark:text-white/40">Persistent knowledge graph & user preferences</p>
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
            onClick={handleToggleLearning}
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
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Memory Integrity</p>
            <p className="text-base font-bold font-mono">100% Synced</p>
          </div>
          <AlertCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Stored Nodes</p>
            <p className="text-base font-bold font-mono">{memories.length} Active</p>
          </div>
          <Network className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-bold">Persistence</p>
            <p className="text-xs font-bold font-mono text-emerald-500">Local Storage Active</p>
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
                  placeholder="Category (e.g. Preferences)"
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
                <Plus className="w-4 h-4" /> Commit to Long-Term Memory
              </button>
            </form>
          </div>

          {/* Memory List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredMemories.length === 0 ? (
              <p className="text-center text-xs text-zinc-400 dark:text-white/40 py-6">No memories match your query.</p>
            ) : (
              filteredMemories.map((memory) => (
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
              ))
            )}
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
              const angle = (idx / Math.max(memories.length, 1)) * 2 * Math.PI;
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
            Interactive Long-Term Semantic Link Map
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryManager;