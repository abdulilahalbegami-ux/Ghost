export interface MemoryItem {
  id: string;
  category: string;
  content: string;
  importance: "high" | "medium" | "low";
  dateAdded: string;
  tags: string[];
}

const MEMORY_STORAGE_KEY = "nuvio_long_term_memories";
const LEARNING_STATUS_KEY = "nuvio_learning_enabled";

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    category: "Preferences",
    content: "Favorite pizza: pepperoni pizza from local pizzerias",
    importance: "medium",
    dateAdded: new Date().toISOString().split("T")[0],
    tags: ["pizza", "dinner", "food", "preferences"],
  },
  {
    id: "mem-2",
    category: "Schedule",
    content: "Prefers appointments after 5:00 PM on weekdays",
    importance: "high",
    dateAdded: new Date().toISOString().split("T")[0],
    tags: ["calendar", "work", "availability"],
  },
  {
    id: "mem-3",
    category: "Travel",
    content: "Prefers budget flights and highly-rated hostels",
    importance: "high",
    dateAdded: new Date().toISOString().split("T")[0],
    tags: ["travel", "finance", "budget"],
  },
];

export function getStoredMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(DEFAULT_MEMORIES));
      return DEFAULT_MEMORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading long term memory:", err);
    return DEFAULT_MEMORIES;
  }
}

export function saveStoredMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    window.dispatchEvent(new Event("nuvio_memory_updated"));
  } catch (err) {
    console.error("Error saving long term memory:", err);
  }
}

export function isAutonomousLearningEnabled(): boolean {
  const val = localStorage.getItem(LEARNING_STATUS_KEY);
  return val === null ? true : val === "true";
}

export function setAutonomousLearningEnabled(enabled: boolean): void {
  localStorage.setItem(LEARNING_STATUS_KEY, enabled ? "true" : "false");
}

export function addLongTermMemory(
  category: string,
  content: string,
  importance: "high" | "medium" | "low" = "medium",
  tags: string[] = []
): MemoryItem {
  const current = getStoredMemories();
  const newMemory: MemoryItem = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: category.trim() || "General",
    content: content.trim(),
    importance,
    dateAdded: new Date().toISOString().split("T")[0],
    tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
  };

  const updated = [newMemory, ...current];
  saveStoredMemories(updated);
  return newMemory;
}

export function deleteLongTermMemory(id: string): void {
  const current = getStoredMemories();
  const updated = current.filter((m) => m.id !== id);
  saveStoredMemories(updated);
}

/**
 * Automatically extracts memories from user sentences like:
 * "Remember that my dog's name is Max"
 * "My favorite color is green"
 * "I live in Chicago"
 */
export function extractMemoryFromUserText(userText: string): MemoryItem | null {
  if (!isAutonomousLearningEnabled()) return null;

  const text = userText.trim();

  // Explicit instruction: "Remember that..." or "Remember..."
  const rememberMatch = text.match(/remember\s+(that\s+)?(.+)/i);
  if (rememberMatch && rememberMatch[2]) {
    const memoryText = rememberMatch[2].trim();
    if (memoryText.length > 3) {
      const tags = extractTagsFromText(memoryText);
      return addLongTermMemory("Personal", memoryText, "high", tags);
    }
  }

  // Personal facts: "My favorite [thing] is [value]"
  const favMatch = text.match(/my\s+favorite\s+([a-z0-9\s]+)\s+is\s+(.+)/i);
  if (favMatch) {
    const topic = favMatch[1].trim();
    const value = favMatch[2].trim();
    const content = `Favorite ${topic}: ${value}`;
    return addLongTermMemory("Preferences", content, "high", [topic, "favorite", "preferences"]);
  }

  // Personal facts: "My [thing] is [value]" e.g. "My job is developer", "My dog is Max"
  const myMatch = text.match(/my\s+([a-z0-9\s]{2,15})\s+is\s+(.+)/i);
  if (myMatch) {
    const key = myMatch[1].trim();
    const val = myMatch[2].trim();
    if (!["name", "question", "issue", "problem", "favorite"].includes(key.toLowerCase())) {
      const content = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`;
      return addLongTermMemory("User Profile", content, "medium", [key, "profile"]);
    }
  }

  // Location/Living: "I live in [Location]"
  const liveMatch = text.match(/i\s+live\s+in\s+(.+)/i);
  if (liveMatch) {
    const location = liveMatch[1].trim();
    return addLongTermMemory("Location", `Lives in ${location}`, "high", ["location", "home", "city"]);
  }

  return null;
}

function extractTagsFromText(text: string): string[] {
  const words = text.toLowerCase().replace(/[^\w\s]/gi, "").split(/\s+/);
  const stopWords = new Set(["that", "this", "with", "have", "from", "they", "there", "what", "about", "your", "like"]);
  return Array.from(new Set(words.filter((w) => w.length > 3 && !stopWords.has(w)))).slice(0, 4);
}

/**
 * Converts stored raw facts into clean, natural English.
 * e.g. "Favorite color: green" -> "Your favorite color is green."
 */
function formatMemoryContentNaturally(content: string): string {
  const clean = content.trim();

  // Handle "Favorite [thing]: [value]"
  const favMatch = clean.match(/^favorite\s+([a-z0-9\s]+):\s*(.+)$/i);
  if (favMatch) {
    const topic = favMatch[1].trim();
    const val = favMatch[2].trim().replace(/\.$/, "");
    return `Your favorite ${topic} is ${val}.`;
  }

  // Handle "Lives in [location]"
  const liveMatch = clean.match(/^lives\s+in\s+(.+)$/i);
  if (liveMatch) {
    return `You live in ${liveMatch[1].trim().replace(/\.$/, "")}.`;
  }

  // Handle "Key: Value" e.g. "Dog: Max" or "Job: Software Engineer"
  const keyValMatch = clean.match(/^([a-z0-9\s]{2,20}):\s*(.+)$/i);
  if (keyValMatch) {
    const key = keyValMatch[1].trim();
    const val = keyValMatch[2].trim().replace(/\.$/, "");
    return `Your ${key.toLowerCase()} is ${val}.`;
  }

  // Handle "Prefers [something]"
  if (clean.toLowerCase().startsWith("prefers ")) {
    return `You prefer ${clean.slice(8).trim().replace(/\.$/, "")}.`;
  }

  // Fallback to conversational statement
  return clean.endsWith(".") ? clean : `${clean}.`;
}

/**
 * Searches stored memories for relevant context to answer queries naturally.
 */
export function queryLongTermMemory(userText: string): string | null {
  const memories = getStoredMemories();
  if (memories.length === 0) return null;

  const lower = userText.toLowerCase();

  const isAskingAboutSelf =
    lower.includes("my favorite") ||
    lower.includes("do you remember") ||
    lower.includes("what is my") ||
    lower.includes("what do i") ||
    lower.includes("where do i") ||
    lower.includes("what's my") ||
    lower.includes("my preference");

  if (!isAskingAboutSelf) return null;

  const searchWords = lower.replace(/[^\w\s]/gi, "").split(/\s+/).filter((w) => w.length > 2);

  let bestMatch: MemoryItem | null = null;
  let maxScore = 0;

  for (const memory of memories) {
    let score = 0;
    const memLower = memory.content.toLowerCase();
    const catLower = memory.category.toLowerCase();

    for (const word of searchWords) {
      if (["what", "is", "my", "do", "you", "remember", "where", "about", "color", "favorite"].includes(word)) {
        if (memLower.includes(word)) score += 2;
        continue;
      }
      if (memLower.includes(word)) score += 3;
      if (catLower.includes(word)) score += 2;
      if (memory.tags.some((t) => t.includes(word))) score += 4;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = memory;
    }
  }

  if (bestMatch && maxScore >= 2) {
    return formatMemoryContentNaturally(bestMatch.content);
  }

  return null;
}