"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Mic,
  Brain,
  Calendar,
  Settings,
  Send,
  Sparkles,
  Globe,
  Compass,
  User,
  LogOut,
  Volume2,
  VolumeX,
  Search,
  ArrowRight,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import GhostLogo from "@/components/GhostLogo";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import MemoryManager from "@/components/MemoryManager";
import TaskPlanner from "@/components/TaskPlanner";
import ProductComparer from "@/components/ProductComparer";
import ReasoningSteps, { Step } from "@/components/ReasoningSteps";
import { showSuccess, showError } from "@/utils/toast";

interface Message {
  id: string;
  sender: "user" | "ghost";
  text: string;
  timestamp: Date;
  steps?: Step[];
  products?: any[];
  isStreaming?: boolean;
}

const DEFAULT_PROMPTS = [
  { text: "Order me the cheapest pepperoni pizza.", icon: "🍕" },
  { text: "Book me a haircut tomorrow after 5 PM.", icon: "✂️" },
  { text: "Summarize my unread messages.", icon: "💬" },
  { text: "Reply to everyone professionally.", icon: "✉️" },
  { text: "Plan my trip to Dubai for under $500.", icon: "✈️" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "memory" | "tasks" | "settings">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ghost",
      text: "I am Ghost. I don't just chat; I execute. Tell me what you need automated today.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [currentProducts, setCurrentProducts] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentSteps]);

  const simulateStreamingResponse = (
    userText: string,
    stepsList: Step[],
    finalText: string,
    productsList?: any[]
  ) => {
    setIsStreaming(true);
    setCurrentSteps(stepsList);
    if (productsList) setCurrentProducts(productsList);

    let currentStepIndex = 0;

    const runNextStep = () => {
      if (currentStepIndex < stepsList.length) {
        // Set current step to running
        setCurrentSteps((prev) =>
          prev.map((s, idx) =>
            idx === currentStepIndex
              ? { ...s, status: "running" }
              : idx < currentStepIndex
              ? { ...s, status: "completed" }
              : s
          )
        );

        // Reduced delay from 1500ms to 400ms for ultra-fast step transitions
        setTimeout(() => {
          // Complete current step
          setCurrentSteps((prev) =>
            prev.map((s, idx) => (idx === currentStepIndex ? { ...s, status: "completed" } : s))
          );
          currentStepIndex++;
          runNextStep();
        }, 400);
      } else {
        // All steps completed, stream final text
        setIsStreaming(false);
        let streamedText = "";
        const words = finalText.split(" ");
        let wordIndex = 0;

        const newMessage: Message = {
          id: Date.now().toString(),
          sender: "ghost",
          text: "",
          timestamp: new Date(),
          steps: stepsList,
          products: productsList,
          isStreaming: true,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Reduced interval from 80ms to 25ms for lightning-fast text streaming
        const streamInterval = setInterval(() => {
          if (wordIndex < words.length) {
            streamedText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
            setMessages((prev) =>
              prev.map((m) => (m.id === newMessage.id ? { ...m, text: streamedText } : m))
            );
            wordIndex++;
          } else {
            clearInterval(streamInterval);
            setMessages((prev) =>
              prev.map((m) => (m.id === newMessage.id ? { ...m, isStreaming: false } : m))
            );
            setCurrentSteps([]);
            setCurrentProducts([]);
            showSuccess("Task completed successfully.");
          }
        }, 25);
      }
    };

    runNextStep();
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Determine response based on prompt
    const lowerText = text.toLowerCase();

    if (lowerText.includes("pizza")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Locating nearby pizza places", status: "pending", log: "Scanning Domino's, Pizza Hut, and Papa John's..." },
          { id: "2", title: "Comparing prices for Pepperoni Pizza", status: "pending", log: "Domino's: $12.99, Pizza Hut: $14.99, Papa John's: $15.50" },
          { id: "3", title: "Applying coupon codes", status: "pending", log: "Applied code '50OFF' at Domino's. Final price: $12.99" },
          { id: "4", title: "Drafting order confirmation", status: "pending", log: "Ready to order cheapest option." },
        ],
        "I found the cheapest pepperoni pizza at Domino's for $12.99. I have drafted the order and am ready to purchase it using your saved payment method. Please confirm below.",
        [
          { name: "Domino's Pepperoni Pizza", price: 12.99, delivery: "20-30 mins", rating: "4.5★", source: "Domino's App", isBest: true },
          { name: "Pizza Hut Pepperoni", price: 14.99, delivery: "35-45 mins", rating: "4.2★", source: "Pizza Hut", isBest: false },
          { name: "Papa John's Pepperoni", price: 15.50, delivery: "25-35 mins", rating: "4.3★", source: "Papa John's", isBest: false },
        ]
      );
    } else if (lowerText.includes("haircut")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Checking calendar availability", status: "pending", log: "Analyzing tomorrow after 5:00 PM..." },
          { id: "2", title: "Searching local barbershops", status: "pending", log: "Found 'Downtown Barbers' and 'Classic Cuts' with openings." },
          { id: "3", title: "Matching stylist preferences", status: "pending", log: "Stylist Alex is available at 5:30 PM." },
        ],
        "I found an opening tomorrow at 5:30 PM with Alex at Downtown Barbers. I have provisionally booked this slot. Would you like me to confirm the booking?"
      );
    } else if (lowerText.includes("dubai")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Searching budget flights to Dubai", status: "pending", log: "Found flight on FlyDubai for $240 round-trip." },
          { id: "2", title: "Finding highly-rated hostels/hotels", status: "pending", log: "Found 'Dubai Marina Hostel' for $45/night." },
          { id: "3", title: "Structuring 4-day itinerary", status: "pending", log: "Day 1: Burj Khalifa & Mall. Day 2: Desert Safari. Day 3: Old Dubai. Day 4: Beach." },
        ],
        "I have planned a complete 4-day trip to Dubai for a total of $470. This includes round-trip flights ($240), 3 nights at Dubai Marina Hostel ($135), and $95 for activities and food. I've saved the full itinerary to your Task Planner."
      );
    } else if (lowerText.includes("messages") || lowerText.includes("reply")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Scanning unread notifications", status: "pending", log: "Found 3 unread Slack messages and 2 emails." },
          { id: "2", title: "Analyzing message context", status: "pending", log: "Urgent request from Sarah regarding project update." },
          { id: "3", title: "Drafting professional replies", status: "pending", log: "Drafted polite, professional response acknowledging receipt." },
        ],
        "You have 5 unread messages. The most urgent is from Sarah asking for the project update. I have drafted a professional reply: 'Hi Sarah, I am currently finalizing the details and will send over the complete update by tomorrow morning. Best, [Name]'. Shall I send this?"
      );
    } else {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Analyzing request", status: "pending", log: "Processing natural language intent..." },
          { id: "2", title: "Searching knowledge base", status: "pending", log: "Retrieving relevant context..." },
        ],
        `I have processed your request: "${text}". As your autonomous assistant, I can automate this workflow for you. Let me know if you'd like me to set up a custom trigger for this.`
      );
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      showSuccess("Voice mode deactivated.");
    } else {
      setIsListening(true);
      setActiveTab("voice");
      showSuccess("Voice mode active. Speak now.");
      // Simulate voice response after 2 seconds (faster voice trigger)
      setTimeout(() => {
        if (isListening) {
          setIsListening(false);
          handleSendMessage("Order me the cheapest pepperoni pizza.");
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar / Navigation */}
      <div className="w-full md:w-80 bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between gap-6">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <GhostLogo size="sm" />
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase">Ghost</h1>
              <p className="text-[10px] text-white/40 tracking-wider uppercase">Autonomous OS v1.0</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Autonomous Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("voice")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "voice"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice Interface</span>
            </button>

            <button
              onClick={() => setActiveTab("memory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "memory"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Memory Core</span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "tasks"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Automated Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Agent Alpha</p>
              <p className="text-xs text-white/40">Premium Operator</p>
            </div>
          </div>
          <button
            onClick={() => showSuccess("Logged out of Ghost OS.")}
            className="text-white/40 hover:text-white p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
        {/* Top Status Bar */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-white/60 uppercase">Ghost Core: Online</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono text-white/40">LATENCY: 14ms</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "chat" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between gap-6">
              {/* Messages Container */}
              <div className="flex-1 space-y-6 min-h-[400px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed transition-all ${
                        msg.sender === "user"
                          ? "bg-white text-black font-medium rounded-tr-none"
                          : "bg-zinc-900 text-white border border-white/10 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Render steps if present */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="w-full max-w-[85%] mt-2">
                        <ReasoningSteps steps={msg.steps} />
                      </div>
                    )}

                    {/* Render products if present */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="w-full max-w-[85%] mt-2">
                        <ProductComparer
                          products={msg.products}
                          onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Active Reasoning Steps (Streaming) */}
                {isStreaming && currentSteps.length > 0 && (
                  <div className="w-full max-w-[85%]">
                    <ReasoningSteps steps={currentSteps} />
                  </div>
                )}

                {/* Active Product Comparison (Streaming) */}
                {isStreaming && currentProducts.length > 0 && (
                  <div className="w-full max-w-[85%]">
                    <ProductComparer
                      products={currentProducts}
                      onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
                    />
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Default Prompts (Only show if conversation is fresh) */}
              {messages.length === 1 && !isStreaming && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">Suggested Automations</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEFAULT_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{prompt.icon}</span>
                          <span className="text-sm text-white/80 group-hover:text-white font-medium">
                            {prompt.text}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Bar */}
              <div className="relative flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-2xl p-2 focus-within:border-white/30 transition-all">
                <input
                  type="text"
                  placeholder="Ask Ghost to automate a task..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                  className="flex-1 bg-transparent text-white placeholder-white/40 text-sm px-3 py-2 focus:outline-none"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleVoiceToggle}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={isStreaming || !inputText.trim()}
                  className="p-2.5 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center gap-12 py-12">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold tracking-widest uppercase">Voice Interface</h2>
                <p className="text-sm text-white/60">
                  {isListening ? "Ghost is listening to your command..." : "Tap the core to begin speaking"}
                </p>
              </div>

              <button
                onClick={handleVoiceToggle}
                className="relative group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
                <GhostLogo size="lg" />
              </button>

              <div className="w-full">
                <VoiceVisualizer isListening={isListening} />
              </div>

              {isListening && (
                <div className="text-xs font-mono text-white/40 animate-pulse bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  TRANSCRIPTION: "Order me the cheapest pepperoni pizza..."
                </div>
              )}
            </div>
          )}

          {activeTab === "memory" && (
            <div className="max-w-2xl mx-auto">
              <MemoryManager />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="max-w-2xl mx-auto">
              <TaskPlanner />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-8 text-white">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-semibold tracking-wider uppercase">System Settings</h2>
                <p className="text-xs text-white/40">Configure your autonomous Ghost OS environment</p>
              </div>

              <div className="space-y-6">
                {/* API Configuration */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">API & Integrations</h3>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">OpenAI Reasoning Engine</p>
                        <p className="text-xs text-white/40">Used for multi-step task planning</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Web Browsing Agent</p>
                        <p className="text-xs text-white/40">Allows Ghost to search and compare prices</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security & Privacy */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Security & Privacy</h3>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Biometric Authentication</p>
                        <p className="text-xs text-white/40">Require FaceID/TouchID before executing purchases</p>
                      </div>
                      <button
                        onClick={() => showSuccess("Biometric authentication updated.")}
                        className="px-3 py-1 bg-white text-black rounded-lg text-xs font-semibold"
                      >
                        Enabled
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Clear Local Cache</p>
                        <p className="text-xs text-white/40">Delete all offline conversation history</p>
                      </div>
                      <button
                        onClick={() => {
                          setMessages([messages[0]]);
                          showSuccess("Local cache cleared successfully.");
                        }}
                        className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-all"
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;