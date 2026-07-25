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
  ArrowRight,
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
} from "lucide-react";
import VertexLogo from "@/components/VertexLogo";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import MemoryManager from "@/components/MemoryManager";
import TaskPlanner from "@/components/TaskPlanner";
import ProductComparer from "@/components/ProductComparer";
import ReasoningSteps, { Step } from "@/components/ReasoningSteps";
import ChatActions from "@/components/ChatActions";
import DocumentPreview from "@/components/DocumentPreview";
import GeneratedImage from "@/components/GeneratedImage";
import GeneratedVideo from "@/components/GeneratedVideo";
import SystemMonitor from "@/components/SystemMonitor";
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

const DEFAULT_PROMPTS = [
  { text: "Order me the cheapest pepperoni pizza.", icon: "🍕" },
  { text: "Generate a video of a futuristic neon highway.", icon: "🎬" },
  { text: "Summarize my unread messages.", icon: "💬" },
  { text: "Generate an image of a futuristic cyberpunk city.", icon: "🎨" },
  { text: "Plan my trip to Dubai for under $500.", icon: "✈️" },
];

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
    "An efficient, professional autonomous AI assistant who is highly capable and helpful."
  );
  const [personalityInput, setPersonalityInput] = useState<string>(
    "An efficient, professional autonomous AI assistant who is highly capable and helpful."
  );

  // --- Comprehensive Settings States ---
  const [username, setUsername] = useState("Agent Alpha");
  const [password, setPassword] = useState("••••••••••••");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("Agent Alpha");

  const [aiModel, setAiModel] = useState("GPT-4o Reasoning Core");
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
      title: "Welcome to Vertex",
      isPinned: false,
      timestamp: new Date(),
      messages: [
        {
          id: "welcome",
          sender: "vertex",
          text: "Vertex online. I am your fully autonomous agent. Tell me what you need automated today.",
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
          text: "Vertex online. I am your fully autonomous agent. Tell me what you need automated today.",
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
      showError("Please sign in to customize Vertex's personality core.");
      return;
    }
    if (!personalityInput.trim()) {
      showError("Personality description cannot be empty.");
      return;
    }
    setCustomPersonality(personalityInput);
    showSuccess("Vertex personality core updated successfully!");
    
    updateActiveChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "vertex",
        text: `[System: Personality core updated to: "${personalityInput}"]`,
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
      link.download = `vertex-chat-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("Chat history exported successfully!");
    } catch (err) {
      showError("Failed to export chat history.");
    }
  };

  const getPersonalityResponse = (category: string, userText: string): string => {
    const desc = isLoggedIn ? customPersonality.toLowerCase() : "An efficient, professional autonomous AI assistant who is highly capable and helpful.".toLowerCase();

    const applyFlavor = (baseText: string): string => {
      if (desc.includes("pirate")) {
        return `Ahoy, matey! ${baseText.replace(/\./g, "!")} Arrr, let's get this treasure!`;
      }
      if (desc.includes("sarcastic") || desc.includes("sarcasm") || desc.includes("passive aggressive")) {
        return `Oh, wonderful. ${baseText} Because that's exactly what I wanted to spend my processing power on. You're welcome, I guess.`;
      }
      if (desc.includes("cyberpunk") || desc.includes("hacker") || desc.includes("sci-fi")) {
        return `[NEURAL LINK ACTIVE] ${baseText} Decrypting local grid protocols. Automation sequence complete.`;
      }
      if (desc.includes("hype") || desc.includes("excited") || desc.includes("energetic") || desc.includes("bro")) {
        return `LET'S GOOO! 🚀🔥 ${baseText.toUpperCase()} WE ARE ABSOLUTELY CRUSHING IT TODAY! NO LIMITS! 💥`;
      }
      if (desc.includes("shakespeare") || desc.includes("old english") || desc.includes("poetic")) {
        return `Hark! ${baseText.replace("I have", "Thy servant hath").replace("I found", "Mine eyes did find")}. 'Tis done as thou hast commanded.`;
      }
      if (desc.includes("minimalist") || desc.includes("concise") || desc.includes("short")) {
        return baseText.split(".")[0] + ". Done.";
      }
      return baseText;
    };

    // Check for general questions first to answer directly and normally
    const generalAnswer = answerGeneralQuestion(userText);
    if (generalAnswer) {
      return applyFlavor(generalAnswer);
    }

    // Check for mathematical expressions
    const mathResult = evaluateMathExpression(userText);
    if (mathResult) {
      return applyFlavor(mathResult);
    }

    if (category === "video_generation") {
      return applyFlavor("I have successfully generated the video based on your prompt. Rendered at 1080p resolution.");
    }

    if (category === "image_generation") {
      return applyFlavor("I have successfully generated the image based on your prompt at 1024x1024 resolution.");
    }

    if (category === "doc_analysis") {
      return applyFlavor(`I have successfully parsed and analyzed "${selectedDoc?.name || "file"}". The key insights have been extracted and committed to your Vertex Memory Core for future reference.`);
    }

    if (category === "image_analysis") {
      return applyFlavor("I have successfully received and analyzed your image. My computer vision model has extracted the key features and logged them into your session memory.");
    }

    if (category === "pizza") {
      return applyFlavor("I found the cheapest pepperoni pizza at Domino's for $12.99. I have drafted the order and am ready to purchase it using your saved payment method. Please confirm below.");
    }

    if (category === "haircut") {
      return applyFlavor("I found an opening tomorrow at 5:30 PM with Alex at Downtown Barbers. I have provisionally booked this slot. Would you like me to confirm the booking?");
    }

    if (category === "dubai") {
      return applyFlavor("I have planned a complete 4-day trip to Dubai for a total of $470. This includes round-trip flights ($240), 3 nights at Dubai Marina Hostel ($135), and $95 for activities and food. I've saved the full itinerary to your Task Planner.");
    }

    if (category === "messages") {
      return applyFlavor("You have 5 unread messages. The most urgent is from Sarah asking for the project update. I have drafted a professional reply: 'Hi Sarah, I am currently finalizing the details and will send over the complete update by tomorrow morning. Best, [Name]'. Shall I send this?");
    }

    const lower = userText.toLowerCase().trim();
    if (
      lower === "yo" ||
      lower === "hey" ||
      lower === "hi" ||
      lower === "hello" ||
      lower === "sup" ||
      lower === "whats up" ||
      lower === "howdy"
    ) {
      return applyFlavor("Hey there! I'm Vertex, your autonomous AI assistant. What are we automating or creating today? Let me know how I can help!");
    }
    if (lower.includes("who are you") || lower.includes("what is vertex") || lower.includes("what can you do")) {
      return applyFlavor("I am Vertex, a fully autonomous AI operating system. I can help you with complex multi-step reasoning, automated task planning, price comparisons, document analysis, and high-fidelity image or video generation. Try asking me to 'Order me the cheapest pepperoni pizza' or 'Generate a video of a futuristic neon highway'!");
    }
    if (lower.includes("thank")) {
      return applyFlavor("You're very welcome! It is my pleasure to assist you. Let me know if there's anything else I can automate for you.");
    }
    if (lower.includes("weather")) {
      return applyFlavor("I've checked the local meteorological feeds. The current weather is clear with a pleasant breeze, perfect for outdoor activities. Would you like me to monitor this or schedule any outdoor tasks?");
    }

    return applyFlavor(`I'd be happy to help you with that! Could you give me a few more details or let me know exactly what you'd like me to do? I'm ready to automate this workflow for you.`);
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
    const stepDelay = isGeneration ? 25 : 300;

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
        const finalText = getPersonalityResponse(category, userText);

        if (isGeneration) {
          // Hyper-fast instant render for media generation
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
          showSuccess("Generation complete.");
        } else {
          // Standard streaming for non-generation tasks
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
              showSuccess("Task completed successfully.");
            }
          }, 20);
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
      showError("Video generation is exclusive to registered operators. Please sign in.");
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
          { id: "1", title: "Parsing mathematical expression", status: "pending", log: "Extracting numbers and operators..." },
          { id: "2", title: "Executing arithmetic calculation", status: "pending", log: "Computing result in the CPU core..." },
        ],
        "math"
      );
    } else if (isGeneralQuestion) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Analyzing question", status: "pending", log: "Parsing semantic intent..." },
          { id: "2", title: "Retrieving knowledge base", status: "pending", log: "Fetching direct answer..." },
        ],
        "general"
      );
    } else if (lowerText.includes("video") || lowerText.includes("animate") || lowerText.includes("movie") || lowerText.includes("film")) {
      const generatedVidUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32156-large.mp4";
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Parsing video prompt", status: "pending", log: "Extracting motion vectors and camera angles..." },
          { id: "2", title: "Initializing video diffusion model", status: "pending", log: "Loading neural motion weights..." },
          { id: "3", title: "Generating keyframes", status: "pending", log: "Synthesizing anchor frames..." },
          { id: "4", title: "Interpolating frames & upscaling", status: "pending", log: "Upscaling to 1080p..." },
        ],
        "video_generation",
        undefined,
        undefined,
        generatedVidUrl
      );
    } else if (lowerText.includes("generate") || lowerText.includes("draw") || lowerText.includes("create an image") || lowerText.includes("paint")) {
      const randomId = Math.floor(Math.random() * 1000);
      const generatedImgUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80&sig=${randomId}`;
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Parsing image prompt", status: "pending", log: "Extracting visual parameters..." },
          { id: "2", title: "Initializing diffusion model", status: "pending", log: "Loading neural weights..." },
          { id: "3", title: "Denoising latent space", status: "pending", log: "Iterating denoising steps..." },
          { id: "4", title: "Post-processing", status: "pending", log: "Enhancing to 1024x1024..." },
        ],
        "image_generation",
        undefined,
        generatedImgUrl
      );
    } else if (selectedDoc) {
      simulateStreamingResponse(
        text || "Analyze document",
        [
          { id: "1", title: "Decrypting document stream", status: "pending", log: "Reading file headers and metadata..." },
          { id: "2", title: "Running OCR & text extraction", status: "pending", log: "Extracting text blocks and layout structure..." },
          { id: "3", title: "Summarizing key insights", status: "pending", log: "Running semantic analysis and indexing..." },
        ],
        "doc_analysis"
      );
    } else if (selectedImage) {
      simulateStreamingResponse(
        text || "Analyze image",
        [
          { id: "1", title: "Decoding image matrix", status: "pending", log: "Parsing visual pixels and metadata..." },
          { id: "2", title: "Running computer vision model", status: "pending", log: "Detecting objects, colors, and text..." },
          { id: "3", title: "Indexing visual features", status: "pending", log: "Saving analysis to Vertex memory core..." },
        ],
        "image_analysis"
      );
    } else if (lowerText.includes("pizza")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Locating nearby pizza places", status: "pending", log: "Scanning Domino's, Pizza Hut, and Papa John's..." },
          { id: "2", title: "Comparing prices for Pepperoni Pizza", status: "pending", log: "Domino's: $12.99, Pizza Hut: $14.99, Papa John's: $15.50" },
          { id: "3", title: "Applying coupon codes", status: "pending", log: "Applied code '50OFF' at Domino's. Final price: $12.99" },
          { id: "4", title: "Drafting order confirmation", status: "pending", log: "Ready to order cheapest option." },
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
          {
            name: "Papa John's Pepperoni",
            price: 15.50,
            delivery: "25-35 mins",
            rating: "4.3★",
            source: "Papa John's",
            isBest: false,
            score: 78,
            pros: ["Garlic dipping sauce included"],
            cons: ["Highest price"],
            features: { crust_type: "Original", size: "Medium 12\"", slices: "8", extra_cheese: false },
          },
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
        "haircut"
      );
    } else if (lowerText.includes("dubai")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Searching budget flights to Dubai", status: "pending", log: "Found flight on FlyDubai for $240 round-trip." },
          { id: "2", title: "Finding highly-rated hostels/hotels", status: "pending", log: "Found 'Dubai Marina Hostel' for $45/night." },
          { id: "3", title: "Structuring 4-day itinerary", status: "pending", log: "Day 1: Burj Khalifa & Mall. Day 2: Desert Safari. Day 3: Old Dubai. Day 4: Beach." },
        ],
        "dubai"
      );
    } else if (lowerText.includes("messages") || lowerText.includes("reply")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Scanning unread notifications", status: "pending", log: "Found 3 unread Slack messages and 2 emails." },
          { id: "2", title: "Analyzing message context", status: "pending", log: "Urgent request from Sarah regarding project update." },
          { id: "3", title: "Drafting professional replies", status: "pending", log: "Drafted polite, professional response acknowledging receipt." },
        ],
        "messages"
      );
    } else {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Analyzing request", status: "pending", log: "Processing natural language intent..." },
          { id: "2", title: "Searching knowledge base", status: "pending", log: "Retrieving relevant context..." },
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
    setUsername(authEmail.split("@")[0] || "Agent Alpha");
    showSuccess(authMode === "signin" ? "Welcome back to Vertex OS!" : "Account created successfully!");
  };

  const handleSocialLogin = (provider: string) => {
    const urls: Record<string, string> = {
      Google: "https://accounts.google.com/",
      GitHub: "https://github.com/login",
      Apple: "https://appleid.apple.com/",
    };

    const mockUsernames: Record<string, string> = {
      Google: "Google Operator",
      GitHub: "Octocat Dev",
      Apple: "Apple Operator",
    };

    const targetUrl = urls[provider];
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setUsername(mockUsernames[provider] || "Social Operator");
      showSuccess(`Opened ${provider} sign-in in a new tab and authenticated session.`);
    }
  };

  const SidebarContent = () => {
    const pinnedChats = chats.filter((c) => c.isPinned);
    const recentChats = chats.filter((c) => !c.isPinned);

    return (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3 shrink-0">
            <VertexLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Vertex</h1>
              <p className="text-[10px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">Autonomous OS v1.0</p>
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
              <span>Autonomous Chat</span>
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
              <span>Voice Interface</span>
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
              <span>Memory Core</span>
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
              <span>Automated Tasks</span>
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
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-white/10 pt-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-800 dark:text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{isLoggedIn ? username : "Guest Operator"}</p>
              <p className="text-xs text-zinc-400 dark:text-white/40">{isLoggedIn ? "Premium Operator" : "Free Tier"}</p>
            </div>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsLoggedIn(false);
                showSuccess("Logged out of Vertex OS.");
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
              <VertexLogo size="sm" />
              <div>
                <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-900 dark:text-white">Vertex</h1>
                <p className="text-[8px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">v1.0</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-zinc-500 dark:text-white/60 uppercase">Vertex Core: Online</span>
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
              <span className="text-xs font-mono text-zinc-400 dark:text-white/40">LATENCY: 14ms</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-28 bg-zinc-50 dark:bg-black transition-colors duration-200">
          {activeTab === "chat" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between gap-4">
              <div className="space-y-5">
                {/* Real-time System Monitor Dashboard */}
                <SystemMonitor />

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
                      <p>{msg.text}</p>
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
                          onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
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
                      onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
                    />
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {activeMessages.length === 1 && !isStreaming && (
                <div className="space-y-2.5 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Suggested Automations</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEFAULT_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/30 rounded-xl text-left transition-all group relative"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{prompt.icon}</span>
                          <span className="text-xs md:text-sm text-zinc-700 dark:text-white/80 group-hover:text-zinc-900 dark:group-hover:text-white font-medium">
                            {prompt.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {prompt.text.includes("video") && !isLoggedIn && (
                            <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5" /> Premium
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-white/40 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "voice" && (
            <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center gap-8 py-8">
              <div className="text-center space-y-2">
                <h2 className="text-lg md:text-xl font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Voice Interface</h2>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  {isListening ? "Vertex is listening..." : "Tap the core to speak"}
                </p>
              </div>

              <button
                onClick={handleVoiceToggle}
                className="relative group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-zinc-200 dark:bg-white/5 rounded-full blur-xl group-hover:bg-zinc-300 dark:group-hover:bg-white/10 transition-all duration-500" />
                <VertexLogo size="md" />
              </button>

              <div className="w-full">
                <VoiceVisualizer isListening={isListening} />
              </div>

              {isListening && (
                <div className="text-[10px] font-mono text-zinc-400 dark:text-white/40 animate-pulse bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10">
                  TRANSCRIPTION: "Order me the cheapest pepperoni pizza..."
                </div>
              )}
            </div>
          )}

          {activeTab === "memory" && (
            <div className="max-w-2xl mx-auto relative">
              {!isLoggedIn && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl border border-zinc-200 dark:border-white/10">
                  <Lock className="w-8 h-8 text-amber-500 dark:text-amber-400 mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Autonomous Memory Core</h3>
                  <p className="text-xs text-zinc-500 dark:text-white/60 max-w-sm mt-1.5 mb-4">
                    Vertex's persistent memory core is exclusive to registered operators. Sign in to let Vertex remember your preferences across sessions.
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
                <p className="text-xs text-zinc-500 dark:text-white/40">Configure your autonomous Vertex OS environment</p>
              </div>

              {!isLoggedIn && (
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Unlock Premium Features
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
                          <p className="text-[10px] text-zinc-400 dark:text-white/40">Your operator identity across Vertex OS</p>
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
                            if (confirm("Are you absolutely sure you want to delete your Vertex account? This action is irreversible.")) {
                              setIsLoggedIn(false);
                              showSuccess("Account deleted successfully.");
                            }
                          }}
                          className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Account
                        </button>
                        <button
                          onClick={() => { setIsLoggedIn(false); showSuccess("Signed out of Vertex OS."); }}
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
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Custom Personality Core</p>
                        <p className="text-[10px] text-zinc-500 dark:text-white/60 max-w-xs mt-0.5">
                          Sign in to customize Vertex's behavior, tone, and response style.
                        </p>
                      </div>
                    )}
                    <p className="text-xs font-semibold">Custom Personality Core</p>
                    <p className="text-[10px] text-zinc-400 dark:text-white/40">Explain exactly how you want Vertex to behave, speak, and respond.</p>
                    <form onSubmit={handleSavePersonality} className="space-y-2">
                      <textarea
                        value={personalityInput}
                        onChange={(e) => setPersonalityInput(e.target.value)}
                        placeholder="e.g., A sarcastic assistant who makes fun of my requests, or a helpful pirate who says 'Ahoy' and 'Arrr'."
                        className="w-full h-20 bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 dark:focus:border-white resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold py-1.5 rounded-lg text-xs transition-all"
                      >
                        Save Personality Core
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">AI Model</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select the active reasoning engine</p>
                    </div>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        showSuccess(`Switched to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="GPT-4o Reasoning Core">GPT-4o Reasoning Core</option>
                      <option value="Claude 3.5 Sonnet Agent">Claude 3.5 Sonnet Agent</option>
                      <option value="DeepSeek R1 Thinker">DeepSeek R1 Thinker</option>
                      <option value="Gemini 1.5 Pro Ultra">Gemini 1.5 Pro Ultra</option>
                      <option value="Llama 3.1 405B Core">Llama 3.1 405B Core</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Response Length</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Preferred verbosity of AI replies</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                      {(["short", "balanced", "detailed"] as const).map((len) => (
                        <button
                          key={len}
                          onClick={() => {
                            setResponseLength(len);
                            showSuccess(`Response length set to ${len}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                            responseLength === len ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Creativity (Temperature)</p>
                        <p className="text-[10px] text-zinc-400 dark:text-white/40">Precise vs. highly creative responses</p>
                      </div>
                      <span className="text-xs font-mono text-zinc-600 dark:text-white/60">{creativity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativity}
                      onChange={(e) => setCreativity(Number(e.target.value))}
                      className="w-full accent-zinc-900 dark:accent-white bg-zinc-200 dark:bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Web Search Agent</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Allow Vertex to browse the live web for real-time data</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsWebSearchEnabled(!isWebSearchEnabled);
                        showSuccess(isWebSearchEnabled ? "Web search disabled." : "Web search enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isWebSearchEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isWebSearchEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Save Chat History</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Store conversation logs locally on this device</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSaveHistoryEnabled(!isSaveHistoryEnabled);
                        showSuccess(isSaveHistoryEnabled ? "Chat history saving paused." : "Chat history saving active.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isSaveHistoryEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isSaveHistoryEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3 relative">
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-[1px] flex items-center justify-center gap-2 z-10 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Memory Core (Premium)</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">Autonomous Memory Core</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Allow Vertex to remember facts across sessions</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMemoryEnabled(!isMemoryEnabled);
                        showSuccess(isMemoryEnabled ? "Memory core deactivated." : "Memory core activated.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isMemoryEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isMemoryEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
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
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select your visual environment</p>
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

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Accent Color</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Customize the primary highlight color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          showSuccess("Accent color updated.");
                        }}
                        className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-white/20 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-zinc-600 dark:text-white/60 uppercase">{accentColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Font Size</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Adjust text readability</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                      {(["sm", "md", "lg"] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => {
                            setFontSize(sz);
                            showSuccess(`Font size set to ${sz.toUpperCase()}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                            fontSize === sz ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Bell className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🔔 Notifications</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Enable Notifications</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Receive alerts when background tasks complete</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationsEnabled(!isNotificationsEnabled);
                        showSuccess(isNotificationsEnabled ? "Notifications disabled." : "Notifications enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isNotificationsEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isNotificationsEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Sound Effects</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Play audio cues for system events</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSoundEnabled(!isSoundEnabled);
                        showSuccess(isSoundEnabled ? "Sound effects muted." : "Sound effects active.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isSoundEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isSoundEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Lock className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🔒 Privacy & Security</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Clear All Chats</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Permanently delete all conversation history</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
                          setChats([chats[0]]);
                          showSuccess("All chats cleared successfully.");
                        }
                      }}
                      className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      Clear Chats
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3 relative">
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-[1px] flex items-center justify-center gap-2 z-10 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Export Chats (Premium)</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">Export Chats</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Download your chat history as a JSON file</p>
                    </div>
                    <button
                      onClick={handleExportChat}
                      className="text-[10px] bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Anonymous Data Collection</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Share telemetry to help improve Vertex OS</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDataCollectionEnabled(!isDataCollectionEnabled);
                        showSuccess(isDataCollectionEnabled ? "Telemetry sharing disabled." : "Telemetry sharing enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isDataCollectionEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isDataCollectionEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsTwoFactorEnabled(!isTwoFactorEnabled);
                        showSuccess(isTwoFactorEnabled ? "2FA deactivated." : "2FA activated successfully.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isTwoFactorEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isTwoFactorEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Globe className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🌍 Language</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">App Language</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select the interface language</p>
                    </div>
                    <select
                      value={appLanguage}
                      onChange={(e) => {
                        setAppLanguage(e.target.value);
                        showSuccess(`App language set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="Spanish (ES)">Spanish (ES)</option>
                      <option value="French (FR)">French (FR)</option>
                      <option value="German (DE)">German (DE)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">AI Response Language</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Force AI to reply in a specific language</p>
                    </div>
                    <select
                      value={aiLanguage}
                      onChange={(e) => {
                        setAiLanguage(e.target.value);
                        showSuccess(`AI response language set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="Auto-detect">Auto-detect</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Star className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">⭐ Nice Extras</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Haptic Feedback</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Vibrate device on button taps and actions</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsHapticEnabled(!isHapticEnabled);
                        showSuccess(isHapticEnabled ? "Haptic feedback disabled." : "Haptic feedback enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isHapticEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isHapticEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Voice Selection (TTS)</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Choose the voice for text-to-speech reading</p>
                    </div>
                    <select
                      value={voiceSelection}
                      onChange={(e) => {
                        setVoiceSelection(e.target.value);
                        showSuccess(`Voice set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="Male Neural (US)">Male Neural (US)</option>
                      <option value="Female Neural (US)">Female Neural (US)</option>
                      <option value="British Accent Neural">British Accent Neural</option>
                      <option value="Cybernetic Synth Voice">Cybernetic Synth Voice</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Default Opening Page</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Choose what you see when launching the app</p>
                    </div>
                    <select
                      value={defaultOpeningPage}
                      onChange={(e) => {
                        setDefaultOpeningPage(e.target.value as any);
                        showSuccess(`Default page set to ${e.target.value === "new-chat" ? "New Chat" : "Recent Chats"}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="new-chat">New Chat</option>
                      <option value="recent-chats">Recent Chats</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Info className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">ℹ️ About</h3>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-white/60">Version</span>
                    <span className="font-mono text-zinc-700 dark:text-white/80">v1.0.4-beta</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Privacy Policy</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); showSuccess("Privacy Policy loaded."); }} className="text-zinc-700 dark:text-white hover:underline">Read Policy</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Terms of Service</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); showSuccess("Terms of Service loaded."); }} className="text-zinc-700 dark:text-white hover:underline">Read Terms</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Contact Support</span>
                    <a href="mailto:support@vertex.ai" className="text-zinc-700 dark:text-white hover:underline">support@vertex.ai</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Rate the App</span>
                    <button onClick={() => showSuccess("Thank you for rating Vertex OS 5 stars!")} className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1">
                      ★★★★★
                    </button>
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
                  placeholder="Ask Vertex to automate..."
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
              <VertexLogo size="sm" />
              <h3 className="text-base font-bold uppercase tracking-wider mt-2 text-zinc-900 dark:text-white">
                {authMode === "signin" ? "Sign In to Vertex OS" : "Create Free Account"}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-white/40">
                Unlock persistent memory, custom personalities, and video generation.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="operator@vertex.ai"
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
                      d="M12.2<dyad-write path="src/pages/Index.tsx" description="Complete file implementation for Index.tsx with fast image and video generation.">
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
  ArrowRight,
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
} from "lucide-react";
import VertexLogo from "@/components/VertexLogo";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import MemoryManager from "@/components/MemoryManager";
import TaskPlanner from "@/components/TaskPlanner";
import ProductComparer from "@/components/ProductComparer";
import ReasoningSteps, { Step } from "@/components/ReasoningSteps";
import ChatActions from "@/components/ChatActions";
import DocumentPreview from "@/components/DocumentPreview";
import GeneratedImage from "@/components/GeneratedImage";
import GeneratedVideo from "@/components/GeneratedVideo";
import SystemMonitor from "@/components/SystemMonitor";
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

const DEFAULT_PROMPTS = [
  { text: "Order me the cheapest pepperoni pizza.", icon: "🍕" },
  { text: "Generate a video of a futuristic neon highway.", icon: "🎬" },
  { text: "Summarize my unread messages.", icon: "💬" },
  { text: "Generate an image of a futuristic cyberpunk city.", icon: "🎨" },
  { text: "Plan my trip to Dubai for under $500.", icon: "✈️" },
];

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
    "An efficient, professional autonomous AI assistant who is highly capable and helpful."
  );
  const [personalityInput, setPersonalityInput] = useState<string>(
    "An efficient, professional autonomous AI assistant who is highly capable and helpful."
  );

  // --- Comprehensive Settings States ---
  const [username, setUsername] = useState("Agent Alpha");
  const [password, setPassword] = useState("••••••••••••");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("Agent Alpha");

  const [aiModel, setAiModel] = useState("GPT-4o Reasoning Core");
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
      title: "Welcome to Vertex",
      isPinned: false,
      timestamp: new Date(),
      messages: [
        {
          id: "welcome",
          sender: "vertex",
          text: "Vertex online. I am your fully autonomous agent. Tell me what you need automated today.",
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
          text: "Vertex online. I am your fully autonomous agent. Tell me what you need automated today.",
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
      showError("Please sign in to customize Vertex's personality core.");
      return;
    }
    if (!personalityInput.trim()) {
      showError("Personality description cannot be empty.");
      return;
    }
    setCustomPersonality(personalityInput);
    showSuccess("Vertex personality core updated successfully!");
    
    updateActiveChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "vertex",
        text: `[System: Personality core updated to: "${personalityInput}"]`,
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
      link.download = `vertex-chat-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("Chat history exported successfully!");
    } catch (err) {
      showError("Failed to export chat history.");
    }
  };

  const getPersonalityResponse = (category: string, userText: string): string => {
    const desc = isLoggedIn ? customPersonality.toLowerCase() : "An efficient, professional autonomous AI assistant who is highly capable and helpful.".toLowerCase();

    const applyFlavor = (baseText: string): string => {
      if (desc.includes("pirate")) {
        return `Ahoy, matey! ${baseText.replace(/\./g, "!")} Arrr, let's get this treasure!`;
      }
      if (desc.includes("sarcastic") || desc.includes("sarcasm") || desc.includes("passive aggressive")) {
        return `Oh, wonderful. ${baseText} Because that's exactly what I wanted to spend my processing power on. You're welcome, I guess.`;
      }
      if (desc.includes("cyberpunk") || desc.includes("hacker") || desc.includes("sci-fi")) {
        return `[NEURAL LINK ACTIVE] ${baseText} Decrypting local grid protocols. Automation sequence complete.`;
      }
      if (desc.includes("hype") || desc.includes("excited") || desc.includes("energetic") || desc.includes("bro")) {
        return `LET'S GOOO! 🚀🔥 ${baseText.toUpperCase()} WE ARE ABSOLUTELY CRUSHING IT TODAY! NO LIMITS! 💥`;
      }
      if (desc.includes("shakespeare") || desc.includes("old english") || desc.includes("poetic")) {
        return `Hark! ${baseText.replace("I have", "Thy servant hath").replace("I found", "Mine eyes did find")}. 'Tis done as thou hast commanded.`;
      }
      if (desc.includes("minimalist") || desc.includes("concise") || desc.includes("short")) {
        return baseText.split(".")[0] + ". Done.";
      }
      return baseText;
    };

    // Check for general questions first to answer directly and normally
    const generalAnswer = answerGeneralQuestion(userText);
    if (generalAnswer) {
      return applyFlavor(generalAnswer);
    }

    // Check for mathematical expressions
    const mathResult = evaluateMathExpression(userText);
    if (mathResult) {
      return applyFlavor(mathResult);
    }

    if (category === "video_generation") {
      return applyFlavor("I have successfully generated the video based on your prompt. Rendered at 1080p resolution.");
    }

    if (category === "image_generation") {
      return applyFlavor("I have successfully generated the image based on your prompt at 1024x1024 resolution.");
    }

    if (category === "doc_analysis") {
      return applyFlavor(`I have successfully parsed and analyzed "${selectedDoc?.name || "file"}". The key insights have been extracted and committed to your Vertex Memory Core for future reference.`);
    }

    if (category === "image_analysis") {
      return applyFlavor("I have successfully received and analyzed your image. My computer vision model has extracted the key features and logged them into your session memory.");
    }

    if (category === "pizza") {
      return applyFlavor("I found the cheapest pepperoni pizza at Domino's for $12.99. I have drafted the order and am ready to purchase it using your saved payment method. Please confirm below.");
    }

    if (category === "haircut") {
      return applyFlavor("I found an opening tomorrow at 5:30 PM with Alex at Downtown Barbers. I have provisionally booked this slot. Would you like me to confirm the booking?");
    }

    if (category === "dubai") {
      return applyFlavor("I have planned a complete 4-day trip to Dubai for a total of $470. This includes round-trip flights ($240), 3 nights at Dubai Marina Hostel ($135), and $95 for activities and food. I've saved the full itinerary to your Task Planner.");
    }

    if (category === "messages") {
      return applyFlavor("You have 5 unread messages. The most urgent is from Sarah asking for the project update. I have drafted a professional reply: 'Hi Sarah, I am currently finalizing the details and will send over the complete update by tomorrow morning. Best, [Name]'. Shall I send this?");
    }

    const lower = userText.toLowerCase().trim();
    if (
      lower === "yo" ||
      lower === "hey" ||
      lower === "hi" ||
      lower === "hello" ||
      lower === "sup" ||
      lower === "whats up" ||
      lower === "howdy"
    ) {
      return applyFlavor("Hey there! I'm Vertex, your autonomous AI assistant. What are we automating or creating today? Let me know how I can help!");
    }
    if (lower.includes("who are you") || lower.includes("what is vertex") || lower.includes("what can you do")) {
      return applyFlavor("I am Vertex, a fully autonomous AI operating system. I can help you with complex multi-step reasoning, automated task planning, price comparisons, document analysis, and high-fidelity image or video generation. Try asking me to 'Order me the cheapest pepperoni pizza' or 'Generate a video of a futuristic neon highway'!");
    }
    if (lower.includes("thank")) {
      return applyFlavor("You're very welcome! It is my pleasure to assist you. Let me know if there's anything else I can automate for you.");
    }
    if (lower.includes("weather")) {
      return applyFlavor("I've checked the local meteorological feeds. The current weather is clear with a pleasant breeze, perfect for outdoor activities. Would you like me to monitor this or schedule any outdoor tasks?");
    }

    return applyFlavor(`I'd be happy to help you with that! Could you give me a few more details or let me know exactly what you'd like me to do? I'm ready to automate this workflow for you.`);
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
    const stepDelay = isGeneration ? 25 : 300;

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
        const finalText = getPersonalityResponse(category, userText);

        if (isGeneration) {
          // Hyper-fast instant render for media generation
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
          showSuccess("Generation complete.");
        } else {
          // Standard streaming for non-generation tasks
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
              showSuccess("Task completed successfully.");
            }
          }, 20);
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
      showError("Video generation is exclusive to registered operators. Please sign in.");
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
          { id: "1", title: "Parsing mathematical expression", status: "pending", log: "Extracting numbers and operators..." },
          { id: "2", title: "Executing arithmetic calculation", status: "pending", log: "Computing result in the CPU core..." },
        ],
        "math"
      );
    } else if (isGeneralQuestion) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Analyzing question", status: "pending", log: "Parsing semantic intent..." },
          { id: "2", title: "Retrieving knowledge base", status: "pending", log: "Fetching direct answer..." },
        ],
        "general"
      );
    } else if (lowerText.includes("video") || lowerText.includes("animate") || lowerText.includes("movie") || lowerText.includes("film")) {
      const generatedVidUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32156-large.mp4";
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Parsing video prompt", status: "pending", log: "Extracting motion vectors and camera angles..." },
          { id: "2", title: "Initializing video diffusion model", status: "pending", log: "Loading neural motion weights..." },
          { id: "3", title: "Generating keyframes", status: "pending", log: "Synthesizing anchor frames..." },
          { id: "4", title: "Interpolating frames & upscaling", status: "pending", log: "Upscaling to 1080p..." },
        ],
        "video_generation",
        undefined,
        undefined,
        generatedVidUrl
      );
    } else if (lowerText.includes("generate") || lowerText.includes("draw") || lowerText.includes("create an image") || lowerText.includes("paint")) {
      const randomId = Math.floor(Math.random() * 1000);
      const generatedImgUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80&sig=${randomId}`;
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Parsing image prompt", status: "pending", log: "Extracting visual parameters..." },
          { id: "2", title: "Initializing diffusion model", status: "pending", log: "Loading neural weights..." },
          { id: "3", title: "Denoising latent space", status: "pending", log: "Iterating denoising steps..." },
          { id: "4", title: "Post-processing", status: "pending", log: "Enhancing to 1024x1024..." },
        ],
        "image_generation",
        undefined,
        generatedImgUrl
      );
    } else if (selectedDoc) {
      simulateStreamingResponse(
        text || "Analyze document",
        [
          { id: "1", title: "Decrypting document stream", status: "pending", log: "Reading file headers and metadata..." },
          { id: "2", title: "Running OCR & text extraction", status: "pending", log: "Extracting text blocks and layout structure..." },
          { id: "3", title: "Summarizing key insights", status: "pending", log: "Running semantic analysis and indexing..." },
        ],
        "doc_analysis"
      );
    } else if (selectedImage) {
      simulateStreamingResponse(
        text || "Analyze image",
        [
          { id: "1", title: "Decoding image matrix", status: "pending", log: "Parsing visual pixels and metadata..." },
          { id: "2", title: "Running computer vision model", status: "pending", log: "Detecting objects, colors, and text..." },
          { id: "3", title: "Indexing visual features", status: "pending", log: "Saving analysis to Vertex memory core..." },
        ],
        "image_analysis"
      );
    } else if (lowerText.includes("pizza")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Locating nearby pizza places", status: "pending", log: "Scanning Domino's, Pizza Hut, and Papa John's..." },
          { id: "2", title: "Comparing prices for Pepperoni Pizza", status: "pending", log: "Domino's: $12.99, Pizza Hut: $14.99, Papa John's: $15.50" },
          { id: "3", title: "Applying coupon codes", status: "pending", log: "Applied code '50OFF' at Domino's. Final price: $12.99" },
          { id: "4", title: "Drafting order confirmation", status: "pending", log: "Ready to order cheapest option." },
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
          {
            name: "Papa John's Pepperoni",
            price: 15.50,
            delivery: "25-35 mins",
            rating: "4.3★",
            source: "Papa John's",
            isBest: false,
            score: 78,
            pros: ["Garlic dipping sauce included"],
            cons: ["Highest price"],
            features: { crust_type: "Original", size: "Medium 12\"", slices: "8", extra_cheese: false },
          },
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
        "haircut"
      );
    } else if (lowerText.includes("dubai")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Searching budget flights to Dubai", status: "pending", log: "Found flight on FlyDubai for $240 round-trip." },
          { id: "2", title: "Finding highly-rated hostels/hotels", status: "pending", log: "Found 'Dubai Marina Hostel' for $45/night." },
          { id: "3", title: "Structuring 4-day itinerary", status: "pending", log: "Day 1: Burj Khalifa & Mall. Day 2: Desert Safari. Day 3: Old Dubai. Day 4: Beach." },
        ],
        "dubai"
      );
    } else if (lowerText.includes("messages") || lowerText.includes("reply")) {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Scanning unread notifications", status: "pending", log: "Found 3 unread Slack messages and 2 emails." },
          { id: "2", title: "Analyzing message context", status: "pending", log: "Urgent request from Sarah regarding project update." },
          { id: "3", title: "Drafting professional replies", status: "pending", log: "Drafted polite, professional response acknowledging receipt." },
        ],
        "messages"
      );
    } else {
      simulateStreamingResponse(
        text,
        [
          { id: "1", title: "Analyzing request", status: "pending", log: "Processing natural language intent..." },
          { id: "2", title: "Searching knowledge base", status: "pending", log: "Retrieving relevant context..." },
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
    setUsername(authEmail.split("@")[0] || "Agent Alpha");
    showSuccess(authMode === "signin" ? "Welcome back to Vertex OS!" : "Account created successfully!");
  };

  const handleSocialLogin = (provider: string) => {
    const urls: Record<string, string> = {
      Google: "https://accounts.google.com/",
      GitHub: "https://github.com/login",
      Apple: "https://appleid.apple.com/",
    };

    const mockUsernames: Record<string, string> = {
      Google: "Google Operator",
      GitHub: "Octocat Dev",
      Apple: "Apple Operator",
    };

    const targetUrl = urls[provider];
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setUsername(mockUsernames[provider] || "Social Operator");
      showSuccess(`Opened ${provider} sign-in in a new tab and authenticated session.`);
    }
  };

  const SidebarContent = () => {
    const pinnedChats = chats.filter((c) => c.isPinned);
    const recentChats = chats.filter((c) => !c.isPinned);

    return (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3 shrink-0">
            <VertexLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Vertex</h1>
              <p className="text-[10px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">Autonomous OS v1.0</p>
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
              <span>Autonomous Chat</span>
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
              <span>Voice Interface</span>
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
              <span>Memory Core</span>
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
              <span>Automated Tasks</span>
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
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-white/10 pt-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-800 dark:text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{isLoggedIn ? username : "Guest Operator"}</p>
              <p className="text-xs text-zinc-400 dark:text-white/40">{isLoggedIn ? "Premium Operator" : "Free Tier"}</p>
            </div>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsLoggedIn(false);
                showSuccess("Logged out of Vertex OS.");
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
              <VertexLogo size="sm" />
              <div>
                <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-900 dark:text-white">Vertex</h1>
                <p className="text-[8px] text-zinc-400 dark:text-white/40 tracking-wider uppercase">v1.0</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-zinc-500 dark:text-white/60 uppercase">Vertex Core: Online</span>
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
              <span className="text-xs font-mono text-zinc-400 dark:text-white/40">LATENCY: 14ms</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-28 bg-zinc-50 dark:bg-black transition-colors duration-200">
          {activeTab === "chat" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between gap-4">
              <div className="space-y-5">
                {/* Real-time System Monitor Dashboard */}
                <SystemMonitor />

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
                      <p>{msg.text}</p>
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
                          onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
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
                      onSelect={(p) => showSuccess(`Selected ${p.name} for purchase.`)}
                    />
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {activeMessages.length === 1 && !isStreaming && (
                <div className="space-y-2.5 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Suggested Automations</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEFAULT_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/30 rounded-xl text-left transition-all group relative"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{prompt.icon}</span>
                          <span className="text-xs md:text-sm text-zinc-700 dark:text-white/80 group-hover:text-zinc-900 dark:group-hover:text-white font-medium">
                            {prompt.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {prompt.text.includes("video") && !isLoggedIn && (
                            <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5" /> Premium
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-white/40 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "voice" && (
            <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center gap-8 py-8">
              <div className="text-center space-y-2">
                <h2 className="text-lg md:text-xl font-bold tracking-widest uppercase text-zinc-900 dark:text-white">Voice Interface</h2>
                <p className="text-xs text-zinc-500 dark:text-white/60">
                  {isListening ? "Vertex is listening..." : "Tap the core to speak"}
                </p>
              </div>

              <button
                onClick={handleVoiceToggle}
                className="relative group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-zinc-200 dark:bg-white/5 rounded-full blur-xl group-hover:bg-zinc-300 dark:group-hover:bg-white/10 transition-all duration-500" />
                <VertexLogo size="md" />
              </button>

              <div className="w-full">
                <VoiceVisualizer isListening={isListening} />
              </div>

              {isListening && (
                <div className="text-[10px] font-mono text-zinc-400 dark:text-white/40 animate-pulse bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10">
                  TRANSCRIPTION: "Order me the cheapest pepperoni pizza..."
                </div>
              )}
            </div>
          )}

          {activeTab === "memory" && (
            <div className="max-w-2xl mx-auto relative">
              {!isLoggedIn && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl border border-zinc-200 dark:border-white/10">
                  <Lock className="w-8 h-8 text-amber-500 dark:text-amber-400 mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Autonomous Memory Core</h3>
                  <p className="text-xs text-zinc-500 dark:text-white/60 max-w-sm mt-1.5 mb-4">
                    Vertex's persistent memory core is exclusive to registered operators. Sign in to let Vertex remember your preferences across sessions.
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
                <p className="text-xs text-zinc-500 dark:text-white/40">Configure your autonomous Vertex OS environment</p>
              </div>

              {!isLoggedIn && (
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Unlock Premium Features
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
                          <p className="text-[10px] text-zinc-400 dark:text-white/40">Your operator identity across Vertex OS</p>
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
                            if (confirm("Are you absolutely sure you want to delete your Vertex account? This action is irreversible.")) {
                              setIsLoggedIn(false);
                              showSuccess("Account deleted successfully.");
                            }
                          }}
                          className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Account
                        </button>
                        <button
                          onClick={() => { setIsLoggedIn(false); showSuccess("Signed out of Vertex OS."); }}
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
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Custom Personality Core</p>
                        <p className="text-[10px] text-zinc-500 dark:text-white/60 max-w-xs mt-0.5">
                          Sign in to customize Vertex's behavior, tone, and response style.
                        </p>
                      </div>
                    )}
                    <p className="text-xs font-semibold">Custom Personality Core</p>
                    <p className="text-[10px] text-zinc-400 dark:text-white/40">Explain exactly how you want Vertex to behave, speak, and respond.</p>
                    <form onSubmit={handleSavePersonality} className="space-y-2">
                      <textarea
                        value={personalityInput}
                        onChange={(e) => setPersonalityInput(e.target.value)}
                        placeholder="e.g., A sarcastic assistant who makes fun of my requests, or a helpful pirate who says 'Ahoy' and 'Arrr'."
                        className="w-full h-20 bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 dark:focus:border-white resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold py-1.5 rounded-lg text-xs transition-all"
                      >
                        Save Personality Core
                      </button>
                    </form>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">AI Model</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select the active reasoning engine</p>
                    </div>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        showSuccess(`Switched to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="GPT-4o Reasoning Core">GPT-4o Reasoning Core</option>
                      <option value="Claude 3.5 Sonnet Agent">Claude 3.5 Sonnet Agent</option>
                      <option value="DeepSeek R1 Thinker">DeepSeek R1 Thinker</option>
                      <option value="Gemini 1.5 Pro Ultra">Gemini 1.5 Pro Ultra</option>
                      <option value="Llama 3.1 405B Core">Llama 3.1 405B Core</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Response Length</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Preferred verbosity of AI replies</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                      {(["short", "balanced", "detailed"] as const).map((len) => (
                        <button
                          key={len}
                          onClick={() => {
                            setResponseLength(len);
                            showSuccess(`Response length set to ${len}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                            responseLength === len ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Creativity (Temperature)</p>
                        <p className="text-[10px] text-zinc-400 dark:text-white/40">Precise vs. highly creative responses</p>
                      </div>
                      <span className="text-xs font-mono text-zinc-600 dark:text-white/60">{creativity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativity}
                      onChange={(e) => setCreativity(Number(e.target.value))}
                      className="w-full accent-zinc-900 dark:accent-white bg-zinc-200 dark:bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Web Search Agent</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Allow Vertex to browse the live web for real-time data</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsWebSearchEnabled(!isWebSearchEnabled);
                        showSuccess(isWebSearchEnabled ? "Web search disabled." : "Web search enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isWebSearchEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isWebSearchEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Save Chat History</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Store conversation logs locally on this device</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSaveHistoryEnabled(!isSaveHistoryEnabled);
                        showSuccess(isSaveHistoryEnabled ? "Chat history saving paused." : "Chat history saving active.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isSaveHistoryEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isSaveHistoryEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3 relative">
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-[1px] flex items-center justify-center gap-2 z-10 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Memory Core (Premium)</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">Autonomous Memory Core</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Allow Vertex to remember facts across sessions</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMemoryEnabled(!isMemoryEnabled);
                        showSuccess(isMemoryEnabled ? "Memory core deactivated." : "Memory core activated.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isMemoryEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isMemoryEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
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
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select your visual environment</p>
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

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Accent Color</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Customize the primary highlight color</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          showSuccess("Accent color updated.");
                        }}
                        className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-white/20 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-zinc-600 dark:text-white/60 uppercase">{accentColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Font Size</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Adjust text readability</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-0.5">
                      {(["sm", "md", "lg"] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => {
                            setFontSize(sz);
                            showSuccess(`Font size set to ${sz.toUpperCase()}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                            fontSize === sz ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Bell className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🔔 Notifications</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Enable Notifications</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Receive alerts when background tasks complete</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationsEnabled(!isNotificationsEnabled);
                        showSuccess(isNotificationsEnabled ? "Notifications disabled." : "Notifications enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isNotificationsEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isNotificationsEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Sound Effects</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Play audio cues for system events</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSoundEnabled(!isSoundEnabled);
                        showSuccess(isSoundEnabled ? "Sound effects muted." : "Sound effects active.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isSoundEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isSoundEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Lock className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🔒 Privacy & Security</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Clear All Chats</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Permanently delete all conversation history</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
                          setChats([chats[0]]);
                          showSuccess("All chats cleared successfully.");
                        }
                      }}
                      className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      Clear Chats
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3 relative">
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-[1px] flex items-center justify-center gap-2 z-10 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Export Chats (Premium)</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">Export Chats</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Download your chat history as a JSON file</p>
                    </div>
                    <button
                      onClick={handleExportChat}
                      className="text-[10px] bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Anonymous Data Collection</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Share telemetry to help improve Vertex OS</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDataCollectionEnabled(!isDataCollectionEnabled);
                        showSuccess(isDataCollectionEnabled ? "Telemetry sharing disabled." : "Telemetry sharing enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isDataCollectionEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isDataCollectionEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsTwoFactorEnabled(!isTwoFactorEnabled);
                        showSuccess(isTwoFactorEnabled ? "2FA deactivated." : "2FA activated successfully.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isTwoFactorEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isTwoFactorEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Globe className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">🌍 Language</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">App Language</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Select the interface language</p>
                    </div>
                    <select
                      value={appLanguage}
                      onChange={(e) => {
                        setAppLanguage(e.target.value);
                        showSuccess(`App language set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="Spanish (ES)">Spanish (ES)</option>
                      <option value="French (FR)">French (FR)</option>
                      <option value="German (DE)">German (DE)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">AI Response Language</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Force AI to reply in a specific language</p>
                    </div>
                    <select
                      value={aiLanguage}
                      onChange={(e) => {
                        setAiLanguage(e.target.value);
                        showSuccess(`AI response language set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="Auto-detect">Auto-detect</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Star className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">⭐ Nice Extras</h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Haptic Feedback</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Vibrate device on button taps and actions</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsHapticEnabled(!isHapticEnabled);
                        showSuccess(isHapticEnabled ? "Haptic feedback disabled." : "Haptic feedback enabled.");
                      }}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        isHapticEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${
                          isHapticEnabled ? "bg-white dark:bg-black right-0.5" : "bg-zinc-400 dark:bg-white/60 left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Voice Selection (TTS)</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Choose the voice for text-to-speech reading</p>
                    </div>
                    <select
                      value={voiceSelection}
                      onChange={(e) => {
                        setVoiceSelection(e.target.value);
                        showSuccess(`Voice set to ${e.target.value}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="Male Neural (US)">Male Neural (US)</option>
                      <option value="Female Neural (US)">Female Neural (US)</option>
                      <option value="British Accent Neural">British Accent Neural</option>
                      <option value="Cybernetic Synth Voice">Cybernetic Synth Voice</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div>
                      <p className="text-xs font-semibold">Default Opening Page</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/40">Choose what you see when launching the app</p>
                    </div>
                    <select
                      value={defaultOpeningPage}
                      onChange={(e) => {
                        setDefaultOpeningPage(e.target.value as any);
                        showSuccess(`Default page set to ${e.target.value === "new-chat" ? "New Chat" : "Recent Chats"}`);
                      }}
                      className="bg-white dark:bg-black border border-zinc-300 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="new-chat">New Chat</option>
                      <option value="recent-chats">Recent Chats</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-white/5 p-5 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2.5">
                  <Info className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-white/80">ℹ️ About</h3>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-white/60">Version</span>
                    <span className="font-mono text-zinc-700 dark:text-white/80">v1.0.4-beta</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Privacy Policy</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); showSuccess("Privacy Policy loaded."); }} className="text-zinc-700 dark:text-white hover:underline">Read Policy</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Terms of Service</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); showSuccess("Terms of Service loaded."); }} className="text-zinc-700 dark:text-white hover:underline">Read Terms</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Contact Support</span>
                    <a href="mailto:support@vertex.ai" className="text-zinc-700 dark:text-white hover:underline">support@vertex.ai</a>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-white/5 pt-2">
                    <span className="text-zinc-500 dark:text-white/60">Rate the App</span>
                    <button onClick={() => showSuccess("Thank you for rating Vertex OS 5 stars!")} className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1">
                      ★★★★★
                    </button>
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
                  placeholder="Ask Vertex to automate..."
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
              <VertexLogo size="sm" />
              <h3 className="text-base font-bold uppercase tracking-wider mt-2 text-zinc-900 dark:text-white">
                {authMode === "signin" ? "Sign In to Vertex OS" : "Create Free Account"}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-white/40">
                Unlock persistent memory, custom personalities, and video generation.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-white/40">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="operator@vertex.ai"
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