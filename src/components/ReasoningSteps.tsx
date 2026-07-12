"use client";

import React from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  status: "pending" | "running" | "completed";
  log?: string;
}

interface ReasoningStepsProps {
  steps: Step[];
}

export const ReasoningSteps = ({ steps }: ReasoningStepsProps) => {
  return (
    <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">Multi-Step Reasoning Core</h4>
        <span className="text-[10px] text-white/40 animate-pulse">Autonomous Agent Active</span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              {step.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : step.status === "running" ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-white/30" />
              )}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 my-1 ${
                    step.status === "completed" ? "bg-white" : "bg-white/10"
                  }`}
                />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <p
                className={`text-xs font-semibold ${
                  step.status === "completed"
                    ? "text-white"
                    : step.status === "running"
                    ? "text-white animate-pulse"
                    : "text-white/40"
                }`}
              >
                {step.title}
              </p>
              {step.log && step.status === "running" && (
                <p className="text-[11px] font-mono text-white/60 bg-black/50 p-2 rounded border border-white/5 animate-pulse">
                  {step.log}
                </p>
              )}
              {step.log && step.status === "completed" && (
                <p className="text-[11px] font-mono text-white/50 bg-black/30 p-2 rounded border border-white/5">
                  {step.log}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReasoningSteps;