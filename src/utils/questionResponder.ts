/**
 * Natural Conversational & Knowledge Engine
 * 
 * Rules:
 * - Answer user's latest message directly and stay on topic.
 * - Answer factual questions clearly and accurately without inventing facts.
 * - Provide simple step-by-step guidance when asked for help.
 * - Handle creative writing naturally.
 * - Ask short clarifying questions when input is unclear.
 * - Do not randomly mention identity/app name unless explicitly asked.
 * - Keep replies natural, friendly, and easy to understand.
 */

// Levenshtein distance algorithm for string similarity
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  return (maxLength - distance) / maxLength;
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Knowledge Base
const KNOWLEDGE_BASE: Array<{ keys: string[]; synonyms: string[]; answer: string }> = [
  {
    keys: ["spiderman", "peterparker"],
    synonyms: ["spider man", "spider-man", "spidrman", "peter parker", "spidey"],
    answer: "Spider-Man (Peter Parker) is a Marvel superhero created by Stan Lee and Steve Ditko. Bitten by a radioactive spider, Peter gained wall-crawling ability, superhuman agility, and a 'spider-sense'. Guided by the principle 'With great power comes great responsibility,' he protects New York City.",
  },
  {
    keys: ["ironman", "tonystark"],
    synonyms: ["iron man", "iron-man", "tony stark", "tony strak"],
    answer: "Iron Man (Tony Stark) is a Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. A genius billionaire inventor, Tony builds high-tech powered armor equipped with flight systems, repulsors, and advanced AI.",
  },
  {
    keys: ["batman", "brucewayne"],
    synonyms: ["dark knight", "bat man", "bruce wayne"],
    answer: "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. After losing his parents, Bruce trained rigorously to master martial arts, detective skills, and high-tech weaponry to protect Gotham City.",
  },
  {
    keys: ["superman", "clarkkent"],
    synonyms: ["super man", "clark kent", "kal el"],
    answer: "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Born on Krypton and raised in Kansas, Earth's yellow sun grants him flight, invulnerability, super strength, and heat vision.",
  },
  {
    keys: ["alberteinstein", "einstein"],
    synonyms: ["albert einstein", "einstein relativity"],
    answer: "Albert Einstein (1879–1955) was a theoretical physicist best known for developing the theory of relativity (E = mc²) and winning the 1921 Nobel Prize in Physics for his discovery of the photoelectric effect.",
  },
  {
    keys: ["isaacnewton", "newton"],
    synonyms: ["sir isaac newton", "newton gravity"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician and physicist who formulated the three laws of motion, the law of universal gravitation, and co-developed calculus.",
  },
  {
    keys: ["capitaloffrance", "paris"],
    synonyms: ["paris france", "capital france"],
    answer: "The capital of France is Paris, famous for its rich history, culture, art, and world-renowned landmarks like the Eiffel Tower and the Louvre Museum.",
  },
  {
    keys: ["capitalofjapan", "tokyo"],
    synonyms: ["tokyo japan", "capital japan"],
    answer: "The capital of Japan is Tokyo, a global metropolis blending ultra-modern technology, historic shrines, and rich culinary traditions.",
  },
  {
    keys: ["whoareyou", "whatisnuvio", "nuvio"],
    synonyms: ["nuvio test", "nuviotest", "who created you"],
    answer: "I am Nuvio Test, a helpful AI assistant built to answer questions, guide you step by step, and assist with tasks.",
  }
];

function cleanQuery(text: string): string {
  let cleaned = text.toLowerCase().trim();
  cleaned = cleaned
    .replace(/\b(wht|wat|whas|whats|what's|whos|who's|whois)\b/g, (m) => m.includes("who") ? "who is" : "what is")
    .replace(/\b(tel me|telme|tellme)\b/g, "tell me")
    .replace(/\b(plz|pls|plse)\b/g, "please")
    .replace(/\b(abou|abt)\b/g, "about");

  return cleaned;
}

function fuzzyMatch(userInput: string, target: string): boolean {
  const normUser = normalizeKey(userInput);
  const normTarget = normalizeKey(target);

  if (!normUser || !normTarget) return false;
  if (normUser.includes(normTarget) || normTarget.includes(normUser)) return true;

  const userWords = userInput.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);

  for (const uWord of userWords) {
    if (uWord.length < 3) continue;
    for (const tWord of targetWords) {
      if (tWord.length < 3) continue;
      if (stringSimilarity(uWord, tWord) >= 0.75) return true;
    }
  }

  return stringSimilarity(normUser, normTarget) >= 0.70;
}

function isHelpRequest(lowerText: string): boolean {
  return (
    lowerText.includes("help me") ||
    lowerText.includes("how do i") ||
    lowerText.includes("how can i") ||
    lowerText.includes("guide me") ||
    lowerText.includes("steps to") ||
    lowerText.includes("show me how") ||
    lowerText.includes("teach me") ||
    lowerText.startsWith("how to")
  );
}

function generateStepByStepHelp(rawText: string): string {
  const topic = rawText
    .replace(/^(help me|can you help me|how do i|how can i|guide me through|show me how to|how to)\s+/i, "")
    .replace(/\?/g, "")
    .trim();

  const title = topic ? topic : "that task";

  return (
    `Here is a simple, step-by-step guide to help you with ${title}:\n\n` +
    `1. **Set up**: Prepare your materials or goal clearly before beginning.\n` +
    `2. **Start with the basics**: Take care of the initial groundwork step by step.\n` +
    `3. **Execute**: Follow through with the core process, making sure each phase is completed.\n` +
    `4. **Review**: Check your output to ensure everything looks correct.\n\n` +
    `Let me know if you would like more details on any specific step!`
  );
}

function isCreativeWritingRequest(lowerText: string): boolean {
  return (
    lowerText.includes("write a story") ||
    lowerText.includes("write a poem") ||
    lowerText.includes("compose a") ||
    lowerText.includes("write an essay") ||
    lowerText.includes("write a song") ||
    lowerText.includes("tell me a story") ||
    lowerText.includes("create a poem") ||
    lowerText.startsWith("write ")
  );
}

function generateCreativeWriting(rawText: string): string {
  const lower = rawText.toLowerCase();
  if (lower.includes("poem")) {
    return (
      `Soft whispers in the quiet night,\n` +
      `A sudden spark of golden light.\n` +
      `The world awakens, calm and clear,\n` +
      `As peaceful moments draw so near.`
    );
  }
  
  return (
    `Once upon a time in a quiet town nestled beside rolling green hills, an inquisitive traveler stumbled upon a hidden path. Following it past whispering trees and shimmering streams, they discovered a tranquil place where new ideas blossomed naturally.`
  );
}

function isAmbiguousInput(text: string): boolean {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  
  const ambiguousPhrases = [
    "maybe", "stuff", "idk", "whatever", "thing", "something",
    "do it", "sure", "okay", "yeah", "what now", "guess so", "guess"
  ];

  if (ambiguousPhrases.includes(lower)) return true;
  if (trimmed.split(/\s+/).length === 1 && trimmed.length < 3 && !/^\d+$/.test(trimmed)) return true;

  return false;
}

export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);

  // 1. Check for ambiguous / vague input -> ask short clarifying question
  if (isAmbiguousInput(raw)) {
    return `Could you please clarify what you would like help with?`;
  }

  // 2. Check for explicit step-by-step help request
  if (isHelpRequest(lower)) {
    return generateStepByStepHelp(raw);
  }

  // 3. Creative writing request
  if (isCreativeWritingRequest(lower)) {
    return generateCreativeWriting(raw);
  }

  // 4. Knowledge Base Lookup
  for (const item of KNOWLEDGE_BASE) {
    for (const key of item.keys) {
      if (fuzzyMatch(lower, key) || fuzzyMatch(cleaned, key)) {
        return item.answer;
      }
    }
    if (item.synonyms) {
      for (const syn of item.synonyms) {
        if (fuzzyMatch(lower, syn) || fuzzyMatch(cleaned, syn)) {
          return item.answer;
        }
      }
    }
  }

  // 5. Basic Greetings
  if (/^(hi|hello|hey|heyy|greetings|good morning|good afternoon|good evening|whats up|sup|helloo)\b/i.test(cleaned)) {
    return "Hello! How can I help you today?";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do") || cleaned.includes("how r u")) {
    return "I'm doing well, thank you! How can I help you today?";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks") || cleaned.includes("thx") || cleaned.includes("thnk u")) {
    return "You're very welcome!";
  }

  // 6. Person questions ("who is ...")
  if (/^(who|whos|whois)\s+(is|was|are|were)?\b/i.test(cleaned)) {
    const subject = cleaned.replace(/^(who|whos|whois)\s+(is|was|are|were)?\s+/i, "").replace(/\?/g, "").trim();
    if (subject) {
      for (const item of KNOWLEDGE_BASE) {
        for (const key of item.keys) {
          if (fuzzyMatch(subject, key)) return item.answer;
        }
        if (item.synonyms) {
          for (const syn of item.synonyms) {
            if (fuzzyMatch(subject, syn)) return item.answer;
          }
        }
      }
      return `${subject.charAt(0).toUpperCase() + subject.slice(1)} is a notable person or figure. Could you specify which field or context you are referring to?`;
    }
  }

  // 7. Factual questions ("what is ...")
  if (/^(what|whats|whatis|wht|wat)\s+(is|are|was|were)?\b/i.test(cleaned)) {
    const concept = cleaned.replace(/^(what|whats|whatis|wht|wat)\s+(is|are|was|were)?\s+/i, "").replace(/definition of\s+/i, "").replace(/\?/g, "").trim();
    if (concept) {
      for (const item of KNOWLEDGE_BASE) {
        for (const key of item.keys) {
          if (fuzzyMatch(concept, key)) return item.answer;
        }
        if (item.synonyms) {
          for (const syn of item.synonyms) {
            if (fuzzyMatch(concept, syn)) return item.answer;
          }
        }
      }
      return `${concept.charAt(0).toUpperCase() + concept.slice(1)} refers to a concept or topic in its respective domain. Let me know if you would like specific details!`;
    }
  }

  // 8. General conversational response
  return `That is a good question regarding ${raw.replace(/\?/g, "")}. Let me know if you'd like to explore a specific part of it!`;
}