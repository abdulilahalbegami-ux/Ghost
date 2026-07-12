"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle2, Clock, ExternalLink, Play } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Task {
  id: string;
  title: string;
  status: "completed" | "pending" | "running";
  time: string;
  details: string;
}

export const TaskPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Order Pepperoni Pizza",
      status: "completed",
      time: "Today, 6:15 PM",
      details: "Ordered from Domino's (Cheapest option: $12.99). Delivery in 25 mins.",
    },
    {
      id: "2",
      title: "Book Haircut Appointment",
      status: "pending",
      time: "Tomorrow, 5:30 PM",
      details: "Scheduled at 'Downtown Barbers'. Confirmed with stylist Alex.",
    },
    {
      id: "3",
      title: "Dubai Trip Itinerary",
      status: "completed",
      time: "Yesterday",
      details: "Planned 4-day trip under $500. Flights ($240) + Hostel ($180) + Activities ($70).",
    },
    {
      id: "4",
      title: "Summarize Unread Messages",
      status: "running",
      time: "Just now",
      details: "Scanning Slack, WhatsApp, and Email notifications...",
    },
  ]);

  const handleRunTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, status: "running", details: "Executing automated workflow..." } : t))
    );
    setTimeout(() => {
      setTasks(
        tasks.map((t) =>
          t.id === id
            ? { ...t, status: "completed", details: "Task successfully completed by Ghost AI." }
            : t
        )
      );
      showSuccess("Task executed successfully.");
    }, 2500);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold tracking-wider uppercase">Automated Tasks</h2>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-white">{task.title}</h3>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Clock className="w-3 h-3" />
                  <span>{task.time}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  task.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : task.status === "running"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-xs text-white/70 bg-black/40 p-2.5 rounded-lg border border-white/5">
              {task.details}
            </p>

            {task.status === "pending" && (
              <button
                onClick={() => handleRunTask(task.id)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-semibold transition-all"
              >
                <Play className="w-3 h-3 fill-current" /> Run Automation Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPlanner;