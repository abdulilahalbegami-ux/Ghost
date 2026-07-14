"use client";

import React, { useEffect, useState } from "react";
import { Cpu, HardDrive, Activity, DollarSign, Zap } from "lucide-react";

export const SystemMonitor = () => {
  const [stats, setStats] = useState({
    cpu: 42,
    memory: 68,
    network: 124,
    cost: 0.142,
    tokens: 18420,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + Math.floor(Math.random() * 15) - 7)),
        memory: Math.max(50, Math.min(90, prev.memory + Math.floor(Math.random() * 3) - 1)),
        network: Math.max(20, Math.min(300, prev.network + Math.floor(Math.random() * 40) - 20)),
        cost: prev.cost + 0.0002,
        tokens: prev.tokens + Math.floor(Math.random() * 12),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white/5 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-white/40">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Agent CPU</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">{stats.cpu}%</span>
          <span className="text-[9px] text-emerald-500">Optimal</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div style={{ width: `${stats.cpu}%` }} className="bg-indigo-500 h-full transition-all duration-500" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-white/40">
          <HardDrive className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Memory Core</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">{stats.memory}%</span>
          <span className="text-[9px] text-zinc-400">1.2 GB free</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div style={{ width: `${stats.memory}%` }} className="bg-amber-500 h-full transition-all duration-500" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-white/40">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Network I/O</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">{stats.network}</span>
          <span className="text-[9px] text-zinc-400">KB/s</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div style={{ width: `${(stats.network / 300) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-white/40">
          <DollarSign className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Session Cost</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">${stats.cost.toFixed(4)}</span>
          <span className="text-[9px] text-zinc-400">USD</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div style={{ width: `${(stats.cost / 0.5) * 100}%` }} className="bg-rose-500 h-full transition-all duration-500" />
        </div>
      </div>

      <div className="space-y-1 col-span-2 sm:col-span-1">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-white/40">
          <Zap className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tokens Used</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">{stats.tokens}</span>
          <span className="text-[9px] text-zinc-400">ctx</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div style={{ width: `${(stats.tokens / 32000) * 100}%` }} className="bg-cyan-500 h-full transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;