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
  User,
  LogOut,
  LogIn,
  Volume2,
  VolumeX,
  X,
  Cpu,
  Download,
  ImageIcon,
  FileText,
  Shield,
  Bell,
  Palette,
  Globe,
  Info,
  Star,
  Trash2,
  Lock,
  Check,
  Plus,
  Pin,
  Menu,
  Loader2,
  Code2,
} from "lucide-react";
import NuvioLogo from "@/components/NuvioLogo";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import MemoryManager from "@/components/MemoryManager";
import TaskPlanner from "@/components/TaskPlanner";
import ProductComparer from "@/components/ProductComparer";
import ReasoningSteps, { Step } from "@/components/ReasoningSteps";
import ChatActions from "@/components/ChatActions";
import DocumentPreview from "@/components/DocumentPreview";
import GeneratedImage from "@/components/GeneratedImage";
import GeneratedVideo from "@/components/GeneratedVideo";
import { showSuccess, showError } from "@/utils/toast";
import { evaluateMathExpression } from "@/utils/mathEvaluator";
import { answerGeneralQuestion } from "@/utils/questionResponder";

interface Message {
  id: string;
  sender: "user" | "vertex";
  text: string;
  image?: string;
  document?: { name: string; size: string };
  generatedImage?: string;
  generatedVideo?: string;
  timestamp: Date;
  steps?: Step[];
  products?: any[];
  isStreaming?: boolean;
}

interface Chat {
  id: string;
  title: string;
  isPinned: boolean;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "memory" | "tasks" | "settings">("chat");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<string | null>(null);

  // Custom personality state defined by the user
  const [customPersonality, setCustomPersonality] = useState<string>(
    "A friendly, natural, and helpful chatbot."
  );
  const [personalityInput, setPersonalityInput] = useState<string>(
    "A friendly, natural, and helpful chatbot."
  );

  // --- Comprehensive Settings States ---
  const [username, setUsername] = useState("Agent Alpha");
  const [password, setPassword] = useState("••••••••••••");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("Agent Alpha");

  const [aiModel, setAiModel] = useState("Nuvio GPT-4o Core");
  const [responseLength, setResponseLength] = useState<"short" | "balanced" | "detailed">("balanced");
  const [creativity, setCreativity] = useState(60);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(true);
  const [isSaveHistoryEnabled, setIsSaveHistoryEnabled] = useState(true);
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);

  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const [isDataCollectionEnabled, setIsDataCollectionEnabled] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  const [appLanguage, setAppLanguage] = useState("English (US)");
  const [aiLanguage, setAiLanguage] = useState("Auto-detect");

  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [voiceSelection, setVoiceSelection] = useState("Male Neural (US)");
  const [defaultOpeningPage, setDefaultOpeningPage] = useState<"new-chat" | "recent-chats">("new-chat");

  // --- Chat History State ---
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "default-chat",
      title: "Chat",
      isPinned: false,
      timestamp: new Date(),
      messages: [
        {
          id: "welcome",
          sender: "vertex",
          text: "Hello! How can I help you today?",
          timestamp: new Date(),
        },
      ],
    },
  ]);
  const [activeChatId, setActiveChatId] = useState<string>("default-chat");

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeMessages = activeChat ? activeChat.messages : [];

  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; size: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [currentProducts, setCurrentProducts] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Theme Synchronization Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else if (themeMode === "light") {
      root.classList.remove("dark");
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (systemTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [themeMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId, currentSteps]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        showSuccess("Voice transcribed successfully!");
      };

      rec.onerror = () => {
        setIsListening(false);
        showError("Speech recognition error. Please try again.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const updateActiveChatMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === activeChatId) {
          const newMsgs = typeof updater === "function" ? updater(c.messages) : updater;
          return { ...c, messages: newMsgs };
        }
        return c;
      })
    );
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat: Chat = {
      id: newId,
      title: "New Chat",
      isPinned: false,
      timestamp: new Date(),
      messages: [
        {
          id: "welcome",
          sender: "vertex",
          text: "Hello! How can I help you today?",
          timestamp: new Date(),
        },
      ],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setActiveTab("chat");
    setIsMobileSidebarOpen(false);
    showSuccess("New chat session started.");
  };

  const handleTogglePin = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
    const targetChat = chats.find((c) => c.id === chatId);
    showSuccess(targetChat?.isPinned ? "Chat unpinned." : "Chat pinned to top.");
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chats.length === 1) {
      showError("You must keep at least one chat session.");
      return;
    }
    const remaining = chats.filter((c) => c.id !== chatId);
    setChats(remaining);
    if (activeChatId === chatId) {
      setActiveChatId(remaining[0].id);
    }
    showSuccess("Chat deleted.");
  };

  const handleSavePersonality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthMode("signin");
      setShowAuthModal(true);
      showError("Please sign in to customize personality settings.");
      return;
    }
    if (!personalityInput.trim()) {
      showError("Personality description cannot be empty.");
      return;
    }
    setCustomPersonality(personalityInput);
    showSuccess("Personality settings updated successfully!");
    
    updateActiveChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "vertex",
        text: `Got it! I will adapt my style accordingly.`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedDoc(null);
        showSuccess("Image attached successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDoc({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
      setSelectedImage(null);
      showSuccess("Document attached successfully.");
    }
  };

  const handleExportChat = () => {
    if (!isLoggedIn) {
      setAuthMode("signin");
      setShowAuthModal(true);
      showError("Please sign in to export your chat history.");
      return;
    }
    try {
      const chatData = JSON.stringify(activeMessages, null, 2);
      const blob = new Blob([chatData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("Chat history exported successfully!");
    } catch (err) {
      showError("Failed to export chat history.");
    }
  };

  const getSmartResponse = (category: string, userText: string): string => {
    const lower = userText.toLowerCase().trim();

    // Math evaluation
    const mathResult = evaluateMathExpression(userText);
    if (mathResult) {
      return `Here is the result:\n${mathResult}`;
    }

    // Direct general knowledge, help, and conversation answers
    const generalAnswer = answerGeneralQuestion(userText);
    if (generalAnswer) {
      return generalAnswer;
    }

    // Code and Programming generation queries
    if (
      lower.includes("code") ||
      lower.includes("function") ||
      lower.includes("javascript") ||
      lower.includes("python") ||
      lower.includes("react") ||
      lower.includes("html") ||
      lower.includes("css") ||
      lower.includes("sql") ||
      lower.includes("script") ||
      lower.includes("algorithm")
    ) {
      if (lower.includes("python") || lower.includes("sort") || lower.includes("array")) {
        return (
          `Here is a quicksort implementation in Python:\n\n` +
          `\`\`\`python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\n# Example usage:\nnumbers = [3, 6, 8, 10, 1, 2, 1]\nprint("Sorted:", quick_sort(numbers))\n\`\`\``
        );
      }
      return (
        `Here is a clean TypeScript function implementation:\n\n` +
        `\`\`\`typescript\ninterface TaskConfig {\n  id: string;\n  retries: number;\n  timeoutMs: number;\n}\n\nasync function executeTask(config: TaskConfig): Promise<boolean> {\n  console.log(\`Executing task: \${config.id}\`);\n  for (let attempt = 1; attempt <= config.retries; attempt++) {\n    try {\n      return true;\n    } catch (err) {\n      if (attempt === config.retries) throw err;\n    }\n  }\n  return false;\n}\n\`\`\``
      );
    }

    if (category === "video_generation") {
      return `Here is your generated video based on: "${userText}".`;
    }

    if (category === "image_generation") {
      return `Here is the image created based on: "${userText}".`;
    }

    if (category === "doc_analysis") {
      return `I have analyzed "${selectedDoc?.name || "the file"}". Key points:\n1. Extracted key sections and notes.\n2. Summarized main findings.`;
    }

    if (category === "image_analysis") {
      return "I have analyzed your image and extracted the main visual details.";
    }

    if (category === "pizza") {
      return "Domino's Pepperoni Pizza is available for $12.99 with coupon code '50OFF'. Estimated delivery is 20-30 minutes.";
    }

    return "Could you tell me a bit more about what you would like to know?";
  };

  const simulateStreamingResponse = (
    userText: string,
    stepsList: Step[],
    category: string,
    productsList?: any[],
    generatedImgUrl?: string,
    generatedVidUrl?: string
  ) => {
    setIsStreaming(true);
    setCurrentSteps(stepsList);
    if (productsList) setCurrentProducts(productsList);

    let currentStepIndex = 0;
    const isGeneration = category === "image_generation" || category === "video_generation";
    const stepDelay = isGeneration ? 25 : 150;

    const runNextStep = () => {
      if (currentStepIndex < stepsList.length) {
        setCurrentSteps((prev) =>
          prev.map((s, idx) =>
            idx === currentStepIndex
              ? { ...s, status: "running" }
              : idx < currentStepIndex
              ? { ...s, status: "completed" }
              : s
          )
        );

        setTimeout(() => {
          setCurrentSteps((prev) =>
            prev.map((s, idx) => (idx === currentStepIndex ? { ...s, status: "completed" } : s))
          );
          currentStepIndex++;
          runNextStep();
        }, stepDelay);
      } else {
        setIsStreaming(false);
        const finalText = getSmartResponse(category, userText);

        if (isGeneration) {
          const newMessage: Message = {
            id: Date.now().toString(),
            sender: "vertex",
            text: finalText,
            timestamp: new Date(),
            steps: stepsList,
            products: productsList,
            generatedImage: generatedImgUrl,
            generatedVideo: generatedVidUrl,
            isStreaming: false,
          };

          updateActiveChatMessages((prev) => [...prev, newMessage]);
          setCurrentSteps([]);
          setCurrentProducts([]);
        } else {
          let streamedText = "";
          const words = finalText.split(" ");
          let wordIndex = 0;

          const newMessage: Message = {
            id: Date.now().toString(),
            sender: "vertex",
            text: "",
            timestamp: new Date(),
            steps: stepsList,
            products: productsList,
            generatedImage: generatedImgUrl,
            generatedVideo: generatedVidUrl,
            isStreaming: true,
          };

          updateActiveChatMessages((prev) => [...prev, newMessage]);

          const streamInterval = setInterval(() => {
            if (wordIndex < words.length) {
              streamedText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
              updateActiveChatMessages((prev) =>
                prev.map((m) => (m.id === newMessage.id ? { ...m, text: streamedText } : m))
              );
              wordIndex++;
            } else {
              clearInterval(streamInterval);
              updateActiveChatMessages((prev) =>
                prev.map((m) => (m.id === newMessage.id ? { ...m, isStreaming: false } : m))
              );
              setCurrentSteps([]);
              setCurrentProducts([]);
            }
          }, 15);
        }
      }
    };

    runNextStep();
  };

  const handleSendMessage = (text: string) => {
    if ((!text.trim() && !selectedImage && !selectedDoc) || isStreaming) return;

    const lowerText = text.toLowerCase();

    if ((lowerText.includes("video") || lowerText.includes("animate") || lowerText.includes("movie") || lowerText.includes("film")) && !isLoggedIn) {
      setAuthMode("signin");
      setShowAuthModal(true);
      showError("Video generation is exclusive to signed-in users. Please sign in.");
      return;
    }

    if (activeChat.title === "New Chat" && text.trim()) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, title: text.slice(0, 24) + (text.length > 24 ? "..." : "") }
            : c
        )
      );
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text || (selectedImage ? "Sent an image" : "Uploaded a document"),
      image: selectedImage || undefined,
      document: selectedDoc || undefined,
      timestamp: new Date(),
    };

    updateActiveChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSelectedImage(null);
    setSelectedDoc(null);

    const isMath = evaluateMathExpression(text) !== null;
    const isGeneralQuestion = answerGeneralQuestion(text) !== null;

    if (isMath) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Calculating result", status: "pending", log: "Evaluating expression..." },
        ],
        "math"
      );
    } else if (isGeneralQuestion) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Formulating response", status: "pending", log: "Processing answer..." },
        ],
        "general"
      );
    } else if (lowerText.includes("video") || lowerText.includes("animate") || lowerText.includes("movie") || lowerText.includes("film")) {
      const generatedVidUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32156-large.mp4";
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Rendering video frames", status: "pending", log: "Exporting video..." },
        ],
        "video_generation",
        undefined,
        undefined,
        generatedVidUrl
      );
    } else if (lowerText.includes("generate") || lowerText.includes("draw") || lowerText.includes("create an image") || lowerText.includes("paint") || lowerText.includes("picture")) {
      const randomSeed = Math.floor(Math.random() * 9999);
      const promptEncoded = encodeURIComponent(text.trim() || "beautiful landscape");
      const generatedImgUrl = `https://image.pollinations.ai/prompt/${promptEncoded}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Rendering image", status: "pending", log: "Generating artwork..." },
        ],
        "image_generation",
        undefined,
        generatedImgUrl
      );
    } else if (selectedDoc) {
      simulateStreamingResponse(
        text || "Analyze document",
        [
          { id: "1", title: "Reading document", status: "pending", log: "Parsing text content..." },
        ],
        "doc_analysis"
      );
    } else if (selectedImage) {
      simulateStreamingResponse(
        text || "Analyze image",
        [
          { id: "1", title: "Scanning image", status: "pending", log: "Extracting details..." },
        ],
        "image_analysis"
      );
    } else if (lowerText.includes("pizza")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Finding local options", status: "pending", log: "Comparing prices..." },
        ],
        "pizza",
        [
          {
            name: "Domino's Pepperoni Pizza",
            price: 12.99,
            delivery: "20-30 mins",
            rating: "4.5★",
            source: "Domino's App",
            isBest: true,
            score: 95,
            pros: ["Cheapest option", "Fastest delivery", "Applied coupon '50OFF'"],
            cons: ["Limited crust options"],
            features: { crust_type: "Hand Tossed", size: "Medium 12\"", slices: "8", extra_cheese: false },
          },
          {
            name: "Pizza Hut Pepperoni",
            price: 14.99,
            delivery: "35-45 mins",
            rating: "4.2★",
            source: "Pizza Hut",
            isBest: false,
            score: 82,
            pros: ["Stuffed crust available"],
            cons: ["More expensive", "Longer delivery time"],
            features: { crust_type: "Pan Pizza", size: "Medium 12\"", slices: "8", extra_cheese: true },
          },
        ]
      );
    } else {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Processing message", status: "pending", log: "Preparing answer..." },
        ],
        "default"
      );
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      showSuccess("Voice mode deactivated.");
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setActiveTab("voice");
        showSuccess("Voice mode active. Speak now.");
      } else {
        setIsListening(true);
        setActiveTab("voice");
        showSuccess("Voice mode active. Speak now.");
        setTimeout(() => {
          if (isListening) {
            setIsListening(false);
            handleSendMessage("Order me the cheapest pepperoni pizza.");
          }
        }, 2000);
      }
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showError("Please fill in all fields.");
      return;
    }
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setUsername(authEmail.split("@")[0] || "User");
    showSuccess(authMode === "signin" ? "Welcome back!" : "Account created successfully!");
  };

  const handleSocialLogin = (provider: string) => {
    const urls: Record<string, string> = {
      Google: "https://accounts.google.com/",
      GitHub: "https://github.com/login",
      Apple: "https://appleid.apple.com/",
    };

    const mockUsernames: Record<string, string> = {
      Google: "Google User",
      GitHub: "GitHub User",
      Apple: "Apple User",
    };

    const targetUrl = urls[provider];
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setUsername(mockUsernames[provider] || "User");
      showSuccess(`Authenticated via ${provider}.`);
    }
  };

  const SidebarContent = () => {
    const pinnedChats = chats.filter((c) => c.isPinned);
    const recentChats = chats.filter((c) => !c.isPinned);

    return (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3 shrink-0">
            <NuvioLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Nuvio Test</h1>
              <p className="text-[10px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">Assistant v1.0</p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>

          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center justify-between shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Conversations</p>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-white/30">{chats.length} Active</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {pinnedChats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400/60 px-2 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                  </p>
                  {pinnedChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        setActiveTab("chat");
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                        activeChatId === chat.id
                          ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/10"
                          : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                        <span className="truncate font-medium">{chat.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(chat.id, e)}
                          title="Unpin Chat"
                          className="p-1 hover:bg-zinc-300 dark:hover:bg-white/10 rounded text-amber-500 dark:text-amber-400"
                        >
                          <Pin className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          title="Delete Chat"
                          className="p-1 hover:bg-zinc-300 dark:hover:bg-white/10 rounded text-zinc-400 dark:text-white/40 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                {pinnedChats.length > 0 && (
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/30 px-2">Recent</p>
                )}
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setActiveTab("chat");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      activeChatId === chat.id
                        ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/10"
                        : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-medium">{chat.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(chat.id, e)}
                        title="Pin Chat"
                        className="p-1 hover:bg-zinc-300 dark:hover:bg-white/10 rounded text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Delete Chat"
                        className="p-1 hover:bg-zinc-300 dark:hover:bg-white/10 rounded text-zinc-400 dark:text-white/40 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <nav className="space-y-1 shrink-0 border-t border-zinc-200 dark:border-white/5 pt-4">
            <button
              onClick={() => {
                setActiveTab("chat");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("voice");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "voice"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("memory");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "memory"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Memory</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("tasks");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "tasks"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-white/10 pt-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-800 dark:text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{isLoggedIn ? username : "Guest User"}</p>
              <p className="text-xs text-zinc-400 dark:text-white/40">{isLoggedIn ? "Member" : "Free Tier"}</p>
            </div>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsLoggedIn(false);
                showSuccess("Logged out.");
              }}
              title="Sign Out"
              className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white p-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode("signin");
                setShowAuthModal(true);
              }}
              title="Sign In"
              className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white p-2 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-200">
      
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/10 p-6 flex-col justify-between shrink-0 h-screen">
        <SidebarContent />
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-xs bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/10 p-6 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 min-h-0 mt-4">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-black relative overflow-hidden h-screen transition-colors duration-200">
        
        <div className="h-14 border-b border-zinc-200 dark:border-white/10 px-6 flex items-center justify-between bg-white/80 dark:bg-zinc-950/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="md:hidden flex items-center gap-2">
              <NuvioLogo size="sm" />
              <div>
                <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-900 dark:text-white">Nuvio Test</h1>
                <p className="text-[8px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">v1.0</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-zinc-500 dark:text-white/60 uppercase">Online</span>
              <span className="text-[10px] bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-zinc-600 dark:text-white/80 font-mono ml-2">
                {aiModel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleExportChat}
                title="Export Chat History"
                className="text-xs font-mono text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-white/10 transition-all relative"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                {!isLoggedIn && <Lock className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 absolute -top-1 -right-1" />}
              </button>
              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className="text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-28 bg-zinc-50 dark:bg-black transition-colors duration-200">
          {activeTab === "chat" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between gap-4">
              <div className="space-y-5">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 group ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[90%] md:max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed transition-all flex flex-col gap-2.5 ${
                        msg.sender === "user"
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-medium rounded-tr-none"
                          : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 rounded-tl-none"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Sent attachment"
                          className="max-w-full max-h-48 rounded-xl object-cover border border-zinc-200 dark:border-white/10"
                        />
                      )}
                      {msg.document && (
                        <DocumentPreview
                          name={msg.document.name}
                          size={msg.document.size}
                          interactive={false}
                        />
                      )}
                      
                      {msg.text.includes("```") ? (
                        <div className="space-y-2">
                          {msg.text.split("```").map((part, index) => {
                            if (index % 2 === 1) {
                              const firstLineEnd = part.indexOf("\n");
                              const lang = firstLineEnd !== -1 ? part.slice(0, firstLineEnd) : "";
                              const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1) : part;
                              return (
                                <div key={index} className="my-2 bg-zinc-950 text-emerald-400 p-3 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto relative group/code">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2 text-[10px] text-zinc-400">
                                    <span className="uppercase font-bold flex items-center gap-1">
                                      <Code2 className="w-3 h-3 text-indigo-400" /> {lang || "code"}
                                    </span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(code);
                                        showSuccess("Code snippet copied!");
                                      }}
                                      className="text-zinc-400 hover:text-white text-[10px] px-2 py-0.5 rounded bg-white/5"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                  <pre>{code}</pre>
                                </div>
                              );
                            }
                            return part ? <p key={index} className="whitespace-pre-wrap">{part}</p> : null;
                          })}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>

                    {!msg.isStreaming && (
                      <ChatActions text={msg.text} />
                    )}

                    {msg.generatedImage && (
                      <div className="w-full max-w-[90%] md:max-w-[85%] mt-1">
                        <GeneratedImage prompt={msg.text} imageUrl={msg.generatedImage} />
                      </div>
                    )}

                    {msg.generatedVideo && (
                      <div className="w-full max-w-[90%] md:max-w-[85%] mt-1">
                        <GeneratedVideo prompt={msg.text} videoUrl={msg.generatedVideo} />
                      </div>
                    )}

                    {msg.steps && msg.steps.length > 0 && (
                      <div className="w-full max-w-[90%] md:max-w-[85%] mt-1">
                        <ReasoningSteps steps={msg.steps} />
                      </div>
                    )}

                    {msg.products && msg.products.length > 0 && (
                      <div className="w-full max-w-[90%] md:max-w-[85%] mt-1">
                        <ProductComparer
                          products={msg.products}
                          onSelect={(p) => showSuccess(`Selected ${p.name}.`)}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {isStreaming && currentSteps.length > 0 && (
                  <div className="w-full max-w-[90%] md:max-w-[85%]">
                    <ReasoningSteps steps={currentSteps} />
                  </div>
                )}

                {isStreaming && currentProducts.length > 0 && (
                  <div className="w-full max-w-[90%] md:max-w-[85%]">
                    <ProductComparer
                      products={currentProducts}
                      onSelect={(p) => showSuccess(`Selected ${p.name}.`)}
                    />
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center gap-8 py-8">
              <div className="text-center space-y-2">
                <h2 className="text-lg md:text-xl font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Voice Interface</h2>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  {isListening ? "Listening..." : "Tap the core to speak"}
                </p>
              </div>

              <button
                onClick={handleVoiceToggle}
                className="relative group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-zinc-200 dark:bg-white/5 rounded-full blur-xl group-hover:bg-zinc-300 dark:group-hover:bg-white/10 transition-all duration-500" />
                <NuvioLogo size="md" />
              </button>

              <div className="w-full">
                <VoiceVisualizer isListening={isListening} />
              </div>

              {isListening && (
                <div className="text-[10px] font-mono text-zinc-400 dark:text-white/40 animate-pulse bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10">
                  TRANSCRIPTION: "Listening..."
                </div>
              )}
            </div>
          )}

          {activeTab === "memory" && (
            <div className="max-w-2xl mx-auto relative">
              {!isLoggedIn && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl border border-zinc-200 dark:border-white/10">
                  <Lock className="w-8 h-8 text-amber-500 dark:text-amber-400 mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Memory Core</h3>
                  <p className="text-xs text-zinc-500 dark:text-white/60 max-w-sm mt-1.5 mb-4">
                    Persistent memory core is available to signed-in users. Sign in to remember preferences across sessions.
                  </p>
                  <button
                    onClick={() => { setAuthMode("signin"); setShowAuthModal(true); }}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold px-5 py-2 rounded-xl text-xs transition-all"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              )}
              <MemoryManager />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="max-w-2xl mx-auto">
              <TaskPlanner />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-8 text-zinc-900 dark:text-white pb-12">
              <div className="border-b border-zinc-200 dark:border-white/10 pb-3">
                <h2 className="text-xl font-bold tracking-wider uppercase">System Settings</h2>
                <p className="text-xs text-zinc-500 dark:text-white/40">Configure your application settings</p>
              </div>

              {!isLoggedIn && (
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Sign In Required for Advanced Features
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-white/70">
                      Sign in to unlock Custom Personality, Persistent Memory, Video Generation, and Chat Exporting.
                    </p>
                  </div>
                  <button
                    onClick={() => { setAuthMode("signin"); setShowAuthModal(true); }}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold px-4 py-2 rounded-xl text-xs transition-all shrink-0"
                  >
                    Sign In Now
                  </button>
                </div>
              )}

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <User className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">👤 Account</h3>
                </div>
                
                <div className="space-y-4 pt-2">
                  {isLoggedIn ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold">Profile Username</p>
                          <p className="text-[10px] text-zinc-400 dark:text-white/40">Your display identity</p>
                        </div>
                        {isEditingProfile ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 dark:focus:border-white"
                            />
                            <button
                              onClick={() => {
                                setUsername(newUsername);
                                setIsEditingProfile(false);
                                showSuccess("Username updated successfully.");
                              }}
                              className="p-1.5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-white/90 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-zinc-700 dark:text-white/80">{username}</span>
                            <button
                              onClick={() => {
                                setNewUsername(username);
                                setIsEditingProfile(true);
                              }}
                              className="text-[10px] bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                        <div>
                          <p className="text-xs font-semibold">Change Password</p>
                          <p className="text-[10px] text-zinc-400 dark:text-white/40">Update your security credentials</p>
                        </div>
                        <button
                          onClick={() => {
                            const newPass = prompt("Enter new password:");
                            if (newPass) {
                              setPassword("••••••••••••");
                              showSuccess("Password updated successfully.");
                            }
                          }}
                          className="text-[10px] bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
                        >
                          Update
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                              setIsLoggedIn(false);
                              showSuccess("Account deleted.");
                            }
                          }}
                          className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Account
                        </button>
                        <button
                          onClick={() => { setIsLoggedIn(false); showSuccess("Signed out."); }}
                          className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-3 py-1 rounded-lg transition-all flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-zinc-500 dark:text-white/60">You are currently operating in Guest Mode.</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => { setAuthMode("signin"); setShowAuthModal(true); }}
                          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold px-4 py-1.5 rounded-lg text-xs transition-all"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                          className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-all"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Cpu className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🤖 AI Engine</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2 relative">
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-[1px] flex items-center justify-center p-4 text-center z-10 rounded-xl">
                        <Lock className="w-5 h-5 text-amber-500 dark:text-amber-400 mb-1.5" />
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Custom Personality Settings</p>
                      </div>
                    )}
                    <p className="text-xs font-semibold">Custom Personality Instructions</p>
                    <p className="text-[10px] text-zinc-400 dark:text-white/40">Describe how you want the chatbot to behave, speak, and respond.</p>
                    <form onSubmit={handleSavePersonality} className="space-y-2">
                      <textarea
                        value={personalityInput}
                        onChange={(e) => setPersonalityInput(e.target.value)}
                        placeholder="e.g. A helpful assistant that provides clear, direct, and encouraging responses."
                        className="w-full h-20 bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 dark:focus:border-white resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold py-1.5 rounded-lg text-xs transition-all"
                      >
                        Save Settings
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">AI Model</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select reasoning model</p>
                    </div>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        showSuccess(`Switched to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="Nuvio GPT-4o Core">GPT-4o</option>
                      <option value="Claude 3.5 Sonnet Agent">Claude 3.5 Sonnet</option>
                      <option value="DeepSeek R1 Thinker">DeepSeek R1</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Palette className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🎨 Appearance</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Theme Mode</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select visual mode</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                      {(["dark", "light", "system"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setThemeMode(mode);
                            showSuccess(`Theme set to ${mode}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                            themeMode === mode ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === "chat" && (
          <div className="absolute bottom-16 md:bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent dark:from-black dark:via-black/95 dark:to-transparent z-10 space-y-2">
            <div className="max-w-3xl mx-auto space-y-2">
              {selectedImage && (
                <div className="relative inline-block bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-white/10">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-white/10"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedDoc && (
                <DocumentPreview
                  name={selectedDoc.name}
                  size={selectedDoc.size}
                  onRemove={() => setSelectedDoc(null)}
                />
              )}

              <div className="relative flex items-center gap-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl p-1.5 md:p-2 focus-within:border-zinc-400 dark:focus-within:border-white/30 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={docInputRef}
                  onChange={handleDocSelect}
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Image"
                  className="p-2 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5 md:w-4 h-4" />
                </button>
                <button
                  onClick={() => docInputRef.current?.click()}
                  title="Attach Document"
                  className="p-2 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all"
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Ask a question, ask for help, or send a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                  className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 text-xs md:text-sm px-2 py-1.5 focus:outline-none"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleVoiceToggle}
                  title="Voice Input"
                  className={`p-2 rounded-lg transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 md:w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={isStreaming || (!inputText.trim() && !selectedImage && !selectedDoc)}
                  className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90 disabled:bg-zinc-200 dark:disabled:bg-white/20 disabled:text-zinc-400 dark:disabled:text-white/40 rounded-lg transition-all"
                >
                  <Send className="w-3.5 h-3.5 md:w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex md:hidden absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/10 items-center justify-around px-2 z-20 shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "chat" ? "text-zinc-900 dark:text-white scale-105" : "text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[9px] font-medium">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "voice" ? "text-zinc-900 dark:text-white scale-105" : "text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60"
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="text-[9px] font-medium">Voice</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "memory" ? "text-zinc-900 dark:text-white scale-105" : "text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60"
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-[9px] font-medium">Memory</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "tasks" ? "text-zinc-900 dark:text-white scale-105" : "text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-medium">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "settings" ? "text-zinc-900 dark:text-white scale-105" : "text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/60"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-medium">Settings</span>
          </button>
        </div>

      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <NuvioLogo size="sm" />
              <h3 className="text-base font-bold uppercase tracking-wider mt-2 text-zinc-900 dark:text-white">
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </h3>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90 font-bold py-2 rounded-xl text-xs transition-all"
              >
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
              <span className="flex-shrink mx-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/30">or continue with</span>
              <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSocialLogin("Google")}
                disabled={socialLoadingProvider !== null}
                className="flex items-center justify-center py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl transition-all relative"
                title="Sign in with Google"
              >
                {socialLoadingProvider === "Google" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-900 dark:text-white" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.317 1.814 15.538 1 12.24 1 6.033 1 12.24 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.313-.177-1.879H12.24z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleSocialLogin("GitHub")}
                disabled={socialLoadingProvider !== null}
                className="flex items-center justify-center py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl transition-all relative"
                title="Sign in with GitHub"
              >
                {socialLoadingProvider === "GitHub" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-900 dark:text-white" />
                ) : (
                  <svg className="w-4 h-4 text-zinc-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-.667-3.369-.667-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleSocialLogin("Apple")}
                disabled={socialLoadingProvider !== null}
                className="flex items-center justify-center py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-xl transition-all relative"
                title="Sign in with Apple"
              >
                {socialLoadingProvider === "Apple" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-900 dark:text-white" />
                ) : (
                  <svg className="w-4 h-4 text-zinc-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93 0.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.21.12.32.12.85 0 1.96-.51 2.49-1.45z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="text-[10px] text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white underline transition-colors"
              >
                {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Index;