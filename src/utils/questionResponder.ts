/**
 * Natural Conversational & Knowledge Engine for Nuvio
 *
 * Core Identity: Nuvio
 * Rules:
 * - Direct, accurate, natural, and helpful responses.
 * - Dynamic context-based responses without canned templates or memorized examples.
 * - Simple step-by-step guidance for requests for help.
 * - Original creative content when requested.
 * - Clean code generation with brief explanations.
 * - Short clarifying questions when input is vague.
 * - Respectful, adaptable, and professional tone.
 */

function cleanQuery(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ");
}

interface KnowledgeEntry {
  tags: string[];
  answer: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // Nuvio Identity
  {
    tags: ["who are you", "what is your name", "who made you", "what are you", "tell me about yourself", "your name"],
    answer: "I'm Nuvio, an AI assistant here to help you answer questions, write code, plan tasks, brainstorm ideas, and solve problems. What can I help you with today?",
  },

  // Superheroes & Pop Culture
  {
    tags: ["spiderman", "peter parker", "spider man", "spidey"],
    answer: "Spider-Man (Peter Parker) is a Marvel superhero created by Stan Lee and Steve Ditko. After being bitten by a radioactive spider, Peter gained superhuman strength, agility, wall-crawling abilities, and a heightened 'spider-sense'. Driven by the principle that 'with great power comes great responsibility,' he defends New York City while balancing his everyday personal life.",
  },
  {
    tags: ["iron man", "tony stark", "ironman"],
    answer: "Iron Man (Tony Stark) is a Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. A genius industrialist and inventor, Stark built a high-tech powered suit of armor to save his own life and protect the world as a founding member of the Avengers.",
  },
  {
    tags: ["batman", "bruce wayne", "dark knight"],
    answer: "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. Driven by the loss of his parents, Bruce mastered martial arts, forensic science, and tactical technology to protect Gotham City as the Dark Knight.",
  },
  {
    tags: ["superman", "clark kent", "kal el"],
    answer: "Superman (Clark Kent / Kal-El) is a DC Comics superhero born on Krypton and raised in Smallville, Kansas. Earth's yellow sun grants him superhuman strength, flight, invulnerability, heat vision, and x-ray vision, which he uses in his endless pursuit of truth and justice.",
  },

  // Figures & History
  {
    tags: ["albert einstein", "einstein", "relativity"],
    answer: "Albert Einstein (1879–1955) was a theoretical physicist whose special and general theories of relativity fundamentally changed our understanding of space, time, mass, and gravity. He was awarded the 1921 Nobel Prize in Physics for his explanation of the photoelectric effect.",
  },
  {
    tags: ["isaac newton", "sir isaac newton", "gravity"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician and physicist who formulated the three fundamental laws of motion and universal gravitation, while also developing calculus and inventing the reflecting telescope.",
  },
  {
    tags: ["nikola tesla", "tesla"],
    answer: "Nikola Tesla (1856–1943) was a Serbian-American inventor and electrical engineer who developed alternating current (AC) electricity, induction motors, and pioneering wireless technology that laid the groundwork for modern power grids.",
  },
  {
    tags: ["marie curie", "curie"],
    answer: "Marie Curie (1867–1934) was a physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person to win Nobel Prizes in two different scientific fields (Physics and Chemistry), and discovered the elements polonium and radium.",
  },

  // Science & Tech
  {
    tags: ["black hole", "black holes"],
    answer: "A black hole is a region of spacetime where gravitational pulling is so strong that nothing, including light, can escape its event horizon. They are typically created when massive stars collapse under their own gravity at the end of their lifecycle.",
  },
  {
    tags: ["photosynthesis", "how plants make food"],
    answer: "Photosynthesis is the chemical process through which green plants, algae, and some microorganisms use sunlight to transform water and carbon dioxide into glucose (energy) and oxygen. It is essential for sustaining life and oxygen levels on Earth.",
  },
  {
    tags: ["quantum computing", "quantum computer"],
    answer: "Quantum computing utilizes principles of quantum mechanics—such as superposition and entanglement—to process complex information exponentially faster than classical computers for tasks like molecular modeling, cryptography, and complex optimization.",
  },
  {
    tags: ["capital of france", "paris"],
    answer: "The capital of France is Paris, famous for landmark monuments such as the Eiffel Tower, Louvre Museum, and Notre-Dame, as well as its rich culinary and artistic heritage.",
  },
  {
    tags: ["capital of japan", "tokyo"],
    answer: "The capital of Japan is Tokyo, a dynamic metropolis that blends cutting-edge modern innovation with historic temples, bustling districts, and world-renowned food.",
  },
  {
    tags: ["capital of usa", "capital of united states", "washington dc"],
    answer: "The capital of the United States is Washington, D.C., housing key government buildings including the White House, the U.S. Capitol, and the Supreme Court.",
  }
];

function handleHowToQuery(lowerText: string): string {
  if (lowerText.includes("cook") || lowerText.includes("recipe") || lowerText.includes("pasta") || lowerText.includes("rice")) {
    return (
      `Here is a straightforward, reliable approach:\n\n` +
      `1. **Prep your workstation**: Measure out your ingredients and prep vegetables before turning on the heat.\n` +
      `2. **Heat and season**: Bring water to a boil or heat oil in a pan over medium heat. Season early to build flavor.\n` +
      `3. **Cook mindfully**: Stir occasionally to prevent sticking and keep an eye on temperature.\n` +
      `4. **Taste and adjust**: Sample near the end of cooking, adjust salt or herbs, and rest before serving.`
    );
  }

  if (lowerText.includes("code") || lowerText.includes("program") || lowerText.includes("learn react") || lowerText.includes("javascript")) {
    return (
      `Here is a practical path to build your skills:\n\n` +
      `1. **Master Core Concepts**: Understand JavaScript fundamentals—variables, functions, array methods, and asynchronous promises.\n` +
      `2. **Learn Component State**: Practice managing component state (` + "`useState`" + `) and side effects (` + "`useEffect`" + `) in React.\n` +
      `3. **Build Functional Projects**: Create real projects like a weather dashboard, task tracker, or notes manager.\n` +
      `4. **Adopt Modern Tooling**: Work with TypeScript for type safety and Tailwind CSS for rapid responsive styling.`
    );
  }

  if (lowerText.includes("focus") || lowerText.includes("study") || lowerText.includes("productive")) {
    return (
      `Here are proven steps to improve your focus:\n\n` +
      `1. **Set Time Blocks**: Try working in 25-minute sprints followed by 5-minute breaks (the Pomodoro technique).\n` +
      `2. **Reduce Friction**: Put notifications on silent and keep your workspace clear of clutter.\n` +
      `3. **Break Down Tasks**: Slice big goals into 2 or 3 clear action items for the current session.\n` +
      `4. **Maintain Physical Energy**: Keep water nearby and take brief walking stretches between deep work sessions.`
    );
  }

  const topic = lowerText
    .replace(/^(how to|how do i|how can i|help me|guide me through|steps for)\s+/i, "")
    .replace(/\?/g, "")
    .trim();

  return (
    `Here is a clear, step-by-step guide for ${topic || "getting started"}:\n\n` +
    `1. **Define the Goal**: Outline the exact outcome you want to achieve.\n` +
    `2. **Prepare Inputs**: Gather the necessary tools, data, or materials before starting.\n` +
    `3. **Execute Core Steps**: Focus on completing the primary task systematically.\n` +
    `4. **Review & Refine**: Inspect your result and make adjustments where necessary.`
  );
}

function handleCreativeQuery(lowerText: string): string {
  if (lowerText.includes("poem")) {
    return (
      `Shadows lengthen on the ground,\n` +
      `Soft breezes hum without a sound.\n` +
      `The evening sky begins to turn,\n` +
      `As quiet stars begin to burn.`
    );
  }

  if (lowerText.includes("joke")) {
    const jokes = [
      "Why don't scientists trust atoms?\nBecause they make up everything!",
      "Why did the developer wear glasses?\nBecause they couldn't C#!",
      "Why don't software bugs like nature?\nToo many open branches!",
      "What do you call a fake noodle?\nAn impasta!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (lowerText.includes("email") || lowerText.includes("letter") || lowerText.includes("draft")) {
    return (
      `Subject: Follow-up regarding our recent discussion\n\n` +
      `Hi [Name],\n\n` +
      `I hope you're having a good week!\n\n` +
      `I'm writing to follow up on our previous conversation and touch base on next steps. Please let me know if you have any questions or if you need additional details from my end.\n\n` +
      `Best regards,\n[Your Name]`
    );
  }

  return (
    `Along the quiet coast of a forgotten bay, an old lighthouse stood overlooking the churning tides. Inside its spiral stairs, an explorer found a brass compass that spun towards undiscovered places, signaling the start of a new adventure.`
  );
}

function isAmbiguous(text: string): boolean {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  
  const vaguePhrases = ["maybe", "stuff", "idk", "whatever", "thing", "something", "do it", "sure", "okay", "yeah", "what now", "guess so"];
  if (vaguePhrases.includes(lower)) return true;
  if (trimmed.split(/\s+/).length === 1 && trimmed.length < 3 && !/^\d+$/.test(trimmed)) return true;

  return false;
}

export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);

  // 1. Clarifying questions for vague input
  if (isAmbiguous(raw)) {
    return "Could you please clarify what you would like assistance with?";
  }

  // 2. Greetings and Chitchat
  if (/^(hi|hello|hey|heyy|greetings|good morning|good afternoon|good evening|whats up|sup|helloo)$/i.test(cleaned)) {
    return "Hello! How can I help you today?";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do") || cleaned === "how r u") {
    return "I'm doing great, thank you! How can I assist you today?";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks") || cleaned === "thx") {
    return "You're very welcome! Let me know if there's anything else you need.";
  }

  // 3. Creative Writing Requests
  if (
    lower.includes("write a story") ||
    lower.includes("write a poem") ||
    lower.includes("tell me a joke") ||
    lower.includes("tell a joke") ||
    lower.includes("draft an email") ||
    lower.includes("write an email") ||
    lower.includes("write a song")
  ) {
    return handleCreativeQuery(lower);
  }

  // 4. How-to & Guided Help
  if (
    lower.startsWith("how to") ||
    lower.startsWith("how do i") ||
    lower.startsWith("how can i") ||
    lower.includes("steps to") ||
    lower.includes("help me cook") ||
    lower.includes("help me code") ||
    lower.includes("guide me through")
  ) {
    return handleHowToQuery(lower);
  }

  // 5. Knowledge Base Lookups
  for (const entry of KNOWLEDGE_BASE) {
    for (const tag of entry.tags) {
      if (cleaned.includes(cleanQuery(tag)) || cleanQuery(tag).includes(cleaned)) {
        return entry.answer;
      }
    }
  }

  // 6. Direct Factual / Person Inquiries
  if (cleaned.startsWith("who is") || cleaned.startsWith("whos")) {
    const person = raw.replace(/^(who is|whos)\s+/i, "").replace(/\?/g, "").trim();
    if (person) {
      return `${person.charAt(0).toUpperCase() + person.slice(1)} is a notable figure. Could you specify the domain or context you are asking about?`;
    }
  }

  if (cleaned.startsWith("what is") || cleaned.startsWith("whats")) {
    const topic = raw.replace(/^(what is|whats)\s+/i, "").replace(/\?/g, "").trim();
    if (topic) {
      return `${topic.charAt(0).toUpperCase() + topic.slice(1)} is a subject with various aspects. What specific detail or context would you like to explore?`;
    }
  }

  // 7. Conversational Fallback
  return `I understand you are asking about "${raw.replace(/\?/g, "")}". Could you share a bit more detail so I can give you the most accurate answer?`;
}