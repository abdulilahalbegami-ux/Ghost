"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle2, Clock, Play, Plus, Trash2, Cpu, DollarSign, ListTodo } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  status: "completed" | "pending" | "running";
  time: string;
  details: string;
  subTasks: SubTask[];
  cpuUsage: number;
  cost: number;
  logs: string[];
}

export const TaskPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Order Pepperoni Pizza",
      status: "completed",
      time: "Today, 6:15 PM",
      details: "Ordered from Domino's (Cheapest option: $12.99). Delivery in 25 mins.",
      subTasks: [
        { id: "1-1", title: "Scan local pizza places", completed: true },
        { id: "1-2", title: "Compare prices & apply coupons", completed: true },
        { id: "1-3", title: "Draft order confirmation", completed: true },
      ],
      cpuUsage: 12,
      cost: 0.004,
      logs: ["Domino's API connected", "Coupon '50OFF' applied successfully", "Order drafted"],
    },
    {
      id: "2",
      title: "Book Haircut Appointment",
      status: "pending",
      time: "Tomorrow, 5:30 PM",
      details: "Scheduled at 'Downtown Barbers'. Confirmed with stylist Alex.",
      subTasks: [
        { id: "2-1", title: "Check calendar availability", completed: true },
        { id: "2-2", title: "Search local barbershops", completed: false },
        { id: "2-3", title: "Confirm booking with Alex", completed: false },
      ],
      cpuUsage: 8,
      cost: 0.002,
      logs: ["Calendar scanned", "No conflicts found"],
    },
    {
      id: "3",
      title: "Dubai Trip Itinerary",
      status: "completed",
      time: "Yesterday",
      details: "Planned 4-day trip under $500. Flights ($240) + Hostel ($180) + Activities ($70).",
      subTasks: [
        { id: "3-1", title: "Search budget flights to Dubai", completed: true },
        { id: "3-2", title: "Find highly-rated hostels", completed: true },
        { id: "3-3", title: "Structure 4-day itinerary", completed: true },
      ],
      cpuUsage: 24,
      cost: 0.012,
      logs: ["FlyDubai API scanned", "Dubai Marina Hostel booked", "Itinerary saved"],
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "pending",
      time: newTaskTime || "Scheduled",
      details: newTaskDetails || "No details provided.",
      subTasks: [
        { id: `${Date.now()}-1`, title: "Initialize task parameters", completed: false },
        { id: `${Date.now()}-2`, title: "Execute autonomous workflow", completed: false },
      ],
      cpuUsage: 15,
      cost: 0.005,
      logs: ["Task scheduled in Vertex OS"],
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskTime("");
    setNewTaskDetails("");
    showSuccess("New automated task scheduled.");
  };

  const handleRunTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "running",
              details: "Executing automated workflow...",
              logs: [...t.logs, "Autonomous agent active", "Running sub-tasks..."],
            }
          : t
      )
    );

    setTimeout(() => {
      setTasks(
        tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "completed",
                details: "Task successfully completed by Vertex AI.",
                subTasks: t.subTasks.map((st) => ({ ...st, completed: true })),
                logs: [...t.logs, "All sub-tasks completed", "Task finalized"],
              }
            : t
        )
      );
      showSuccess("Task executed successfully.");
    }, 2500);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    showSuccess("Task removed from planner.");
  };

  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubTasks = t.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted = updatedSubTasks.every((st) => st.completed);
          return {
            ...t,
            subTasks: updatedSubTasks,
            status: allCompleted ? "completed" : t.status === "completed" ? "pending" : t.status,
          };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6 text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-lg font-semibold tracking-wider uppercase">Automated Tasks</h2>
            <p className="text-[10px] text-zinc-400 dark:text-white/40">Autonomous background agent scheduler</p>
          </div>
        </div>
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
            onClick={() => setViewMode("timeline")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
              viewMode === "timeline"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="space-y-3 bg-zinc-100 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10">
        <p className="text-xs text-zinc-500 dark:text-white/60 uppercase tracking-wider font-bold">Schedule a new automation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Task Title (e.g. Book Flight)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Time (e.g. Tomorrow, 5:00 PM)"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
          />
        </div>
        <input
          type="text"
          placeholder="Task Details / Instructions"
          value={newTaskDetails}
          onChange={(e) => setNewTaskDetails(e.target.value)}
          className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-medium py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Task
        </button>
      </form>

      {viewMode === "list" ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{task.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-white/50">
                    <Clock className="w-3 h-3" />
                    <span>{task.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      task.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : task.status === "running"
                        ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 animate-pulse"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {task.status}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-white/70 bg-zinc-50 dark:bg-black/40 p-2.5 rounded-lg border border-zinc-200 dark:border-white/5">
                {task.details}
              </p>

              {/* Sub-tasks */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 dark:text-white/40">
                  <ListTodo className="w-3 h-3" />
                  <span>Sub-tasks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {task.subTasks.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubTask(task.id, st.id)}
                        className="rounded border-zinc-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-xs ${st.completed ? "line-through text-zinc-400 dark:text-white/40" : "text-zinc-700 dark:text-white/80"}`}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resource Usage & Logs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-white/5 text-[10px] text-zinc-400 dark:text-white/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-500" /> CPU: {task.cpuUsage}%
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-rose-500" /> Cost: ${task.cost.toFixed(4)}
                  </span>
                </div>
                {task.logs.length > 0 && (
                  <span className="font-mono text-[9px] bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                    LOG: {task.logs[task.logs.length - 1]}
                  </span>
                )}
              </div>

              {task.status === "pending" && (
                <button
                  onClick={() => handleRunTask(task.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg text-xs font-semibold transition-all"
                >
                  <Play className="w-3 h-3 fill-current" /> Run Automation Now
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4 bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Gantt Timeline</p>
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-4">
                <span className="w-24 text-xs font-semibold truncate">{task.title}</span>
                <div className="flex-1 bg-zinc-200 dark:bg-white/10 h-6 rounded-lg overflow-hidden relative flex items-center px-2">
                  <div
                    style={{
                      width: task.status === "completed" ? "100%" : task.status === "running" ? "50%" : "10%",
                      marginLeft: `${idx * 15}%`,
                    }}
                    className={`h-full rounded-lg absolute left-0 top-0 transition-all duration-1000 ${
                      task.status === "completed"
                        ? "bg-emerald-500/20 border-l-2 border-emerald-500"
                        : task.status === "running"
                        ? "bg-indigo-500/20 border-l-2 border-indigo-500 animate-pulse"
                        : "bg-amber-500/20 border-l-2 border-amber-500"
                    }`}
                  />
                  <span className="relative text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-white/80">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPlanner;