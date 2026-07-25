/**
 * Universal Natural Conversational & Knowledge Engine for Nuvio Test
 * Follows strict human-like conversational principles:
 * - Natural, friendly, non-robotic tone (No "As an AI language model")
 * - Casual chitchat continuity
 * - Step-by-step guidance for help requests
 * - Clarifying questions for ambiguous inputs
 * - Direct factual answers for questions
 */

// Levenshtein distance algorithm for calculating string similarity
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
    answer: "Spider-Man (Peter Parker) is a Marvel superhero created by Stan Lee and Steve Ditko. Bitten by a radioactive spider, Peter gained wall-crawling, superhuman agility, and a 'spider-sense'. Guided by 'With great power comes great responsibility,' he protects NYC while juggling normal life.",
  },
  {
    keys: ["ironman", "tonystark"],
    synonyms: ["iron man", "iron-man", "tony stark", "tony strak"],
    answer: "Iron Man (Tony Stark) is a Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. A genius billionaire inventor, Tony builds high-tech powered armor equipped with repulsors, flight tech, and advanced AI systems.",
  },
  {
    keys: ["batman", "brucewayne"],
    synonyms: ["dark knight", "bat man", "bruce wayne"],
    answer: "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. Driven by his parents' murder, Bruce mastered combat, detective skills, and high-tech gear to defend Gotham City as the Dark Knight.",
  },
  {
    keys: ["superman", "clarkkent"],
    synonyms: ["super man", "clark kent", "kal el"],
    answer: "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Born on Krypton and raised in Kansas, Earth's yellow sun gives him flight, invulnerability, super strength, and heat vision.",
  },
  {
    keys: ["alberteinstein", "einstein"],
    synonyms: ["albert einstein", "einstein relativity"],
    answer: "Albert Einstein (1879–1955) was a theoretical physicist who developed the theory of relativity (E = mc²) and won the 1921 Nobel Prize in Physics for explaining the photoelectric effect.",
  },
  {
    keys: ["isaacnewton", "newton"],
    synonyms: ["sir isaac newton", "newton gravity"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician and physicist who formulated the laws of motion, universal gravitation, and co-developed calculus.",
  },
  {
    keys: ["capitaloffrance", "paris"],
    synonyms: ["paris france", "capital france"],
    answer: "The capital of France is Paris, famous for its history, art, culture, and iconic landmarks like the Eiffel Tower and the Louvre.",
  },
  {
    keys: ["capitalofjapan", "tokyo"],
    synonyms: ["tokyo japan", "capital japan"],
    answer: "The capital of Japan is Tokyo, a vibrant global metropolis blending futuristic technology, historic shrines, and world-class food.",
  },
  {
    keys: ["whoareyou", "whatisnuvio", "nuvio"],
    synonyms: ["nuvio test", "nuviotest", "who created you"],
    answer: "I'm Nuvio Test, your friendly assistant. I can chat, help solve problems, generate code or media, automate tasks, and keep things running smoothly for you.",
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

/**
 * Checks if a message is an explicit request for step-by-step help or guidance.
 */
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

/**
 * Generates clear, structured step-by-step guidance.
 */
function generateStepByStepHelp(rawText: string): string {
  const clean = rawText.replace(/^(help me|can you help me|how do i|how can i|guide me through|show me how to|how to)\s+/i, "").replace(/\?/g, "").trim();

  return (
    `Sure! Here is a straightforward step-by-step guide to help you with ${clean || "that"}:\n\n` +
    `1. **Define Your Goal**: Clarify the specific outcome or output you want to achieve.\n` +
    `2. **Gather Necessary Tools**: Prepare your workspace, environment, or required parameters.\n` +
    `3. **Execute Step-by-Step**: Work through the core task methodically, checking each milestone.\n` +
    `4. **Review & Test**: Validate your results to ensure everything works as expected.\n\n` +
    `Would you like me to go deeper into any of these specific steps?`
  );
}

/**
 * Checks if a message is vague or ambiguous.
 */
function isAmbiguousInput(text: string): boolean {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  
  const ambiguousPhrases = [
    "maybe", "stuff", "idk", "whatever", "thing", "something",
    "do it", "sure", "okay", "yeah", "no", "what now", "guess so", "guess"
  ];

  if (ambiguousPhrases.includes(lower)) return true;
  if (trimmed.split(/\s+/).length === 1 && trimmed.length < 4 && !/^\d+$/.test(trimmed)) return true;

  return false;
}

/**
 * Generates a casual chitchat response for non-question statements.
 */
function handleCasualChitchat(lowerText: string): string {
  if (lowerText.includes("tired") || lowerText.includes("exhausted") || lowerText.includes("sleepy")) {
    return "Sounds like it's time for a break or a good cup of coffee! What kept you busy today?";
  }
  if (lowerText.includes("bored") || lowerText.includes("nothing to do")) {
    return "I hear you! We could brainstorm a fun project, play a word game, or explore something new. What sounds good?";
  }
  if (lowerText.includes("good morning") || lowerText.includes("morning")) {
    return "Good morning! Hope your day is off to a great start. What's on your agenda today?";
  }
  if (lowerText.includes("good night") || lowerText.includes("going to sleep")) {
    return "Good night! Rest up and have a great sleep.";
  }
  if (lowerText.includes("nice day") || lowerText.includes("good day") || lowerText.includes("great day")) {
    return "That's awesome to hear! Always great when the day goes smoothly. Doing anything special?";
  }
  if (lowerText.includes("love") || lowerText.includes("like") || lowerText.includes("enjoy")) {
    return "That's awesome! It's always great when you find something you really enjoy. Tell me more about it if you'd like!";
  }

  return "That's interesting! Tell me more about what's on your mind.";
}

/**
 * Evaluates user input and returns a natural, conversational response.
 */
export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);

  // 1. Check for ambiguous / vague input -> ask clarifying question
  if (isAmbiguousInput(raw)) {
    return `Could you tell me a bit more about what you're aiming for? I'd love to help out once I know the details!`;
  }

  // 2. Check for explicit step-by-step help request
  if (isHelpRequest(lower)) {
    return generateStepByStepHelp(raw);
  }

  // 3. Knowledge Base Lookup
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

  // 4. Greetings
  if (/^(hi|hello|hey|heyy|greetings|good morning|good afternoon|good evening|whats up|sup|helloo)\b/i.test(cleaned)) {
    return "Hey there! How are things going with you today?";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do") || cleaned.includes("how r u")) {
    return "I'm doing great, thanks for asking! How are you doing today?";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks") || cleaned.includes("thx") || cleaned.includes("thnk u")) {
    return "You're welcome! Let me know if you need anything else.";
  }

  // 5. Dynamic "Who is" questions
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
      return `${subject.charAt(0).toUpperCase() + subject.slice(1)} is a notable person or character known in their field or story.`;
    }
  }

  // 6. Dynamic "What is" questions
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
      return `${concept.charAt(0).toUpperCase() + concept.slice(1)} is an important subject. In short, it refers to key principles and practices in its area. Let me know if you want a detailed breakdown!`;
    }
  }

  // 7. Non-question casual statements & chitchat
  const isQuestion = raw.includes("?") || /^(what|who|where|when|why|how|can|is|are|do|does|did|will|would|could)\b/i.test(cleaned);
  
  if (!isQuestion) {
    return handleCasualChitchat(lower);
  }

  // 8. Default conversational answer for questions
  return `That's a good question. In short, ${raw.replace(/\?/g, "")} depends on a few key factors like context and goals. Would you like to explore a specific part of it?`;
}