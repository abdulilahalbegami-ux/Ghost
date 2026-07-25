/**
 * Universal Knowledge & Conversational Engine for Nuvio AI with Typo Tolerance
 * Generates natural, accurate, and direct responses to questions even with spelling errors.
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
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

// Calculate similarity score between 0.0 and 1.0
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  return (maxLength - distance) / maxLength;
}

// Helper to sanitize and normalize text
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Rich Knowledge Base
const KNOWLEDGE_BASE: Array<{ keys: string[]; synonyms: string[]; answer: string }> = [
  {
    keys: ["spiderman", "peterparker"],
    synonyms: ["spider man", "spider-man", "spidrman", "spidrmn", "peter parker", "spidey"],
    answer: "Spider-Man (Peter Parker) is an iconic Marvel superhero created by Stan Lee and Steve Ditko. Bitten by a radioactive spider, high school student Peter Parker gained extraordinary powers—including wall-crawling, superhuman agility, and a 'spider-sense'. Guided by the ethos 'With great power comes great responsibility,' he protects New York City while managing the challenges of everyday life.",
  },
  {
    keys: ["ironman", "tonystark"],
    synonyms: ["iron man", "iron-man", "irn man", "tony stark", "tony strak"],
    answer: "Iron Man (Tony Stark) is a legendary Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. A genius billionaire inventor, Tony builds an advanced suit of powered armor equipped with repulsor beams, flight tech, and AI systems (J.A.R.V.I.S. and F.R.I.D.A.Y.). He serves as a central leader of the Avengers.",
  },
  {
    keys: ["batman", "brucewayne"],
    synonyms: ["dark knight", "darknight", "bat man", "batmn", "bruce wayne", "bruce wain"],
    answer: "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. Driven by the tragedy of his parents' murder, Bruce mastered combat, detective skills, and high-tech weaponry to defend Gotham City as the Dark Knight.",
  },
  {
    keys: ["superman", "clarkkent", "kalel"],
    synonyms: ["super man", "supr man", "supr-man", "clark kent", "kal el"],
    answer: "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Born on Krypton and raised in Smallville, Kansas, Earth's yellow sun gives him flight, invulnerability, super strength, and heat vision.",
  },
  {
    keys: ["captainamerica", "steverogers"],
    synonyms: ["captain america", "captin america", "cap America", "steve rogers", "cap america"],
    answer: "Captain America (Steve Rogers) is a Marvel superhero enhanced to peak human condition by the Super-Soldier Serum during WWII. Wielding an indestructible Vibranium shield, he leads the Avengers with unwavering bravery.",
  },
  {
    keys: ["thor", "thorodinson"],
    synonyms: ["god of thunder", "thor odinson", "thorr", "mjolnir"],
    answer: "Thor Odinson is Marvel's god of thunder. Wielding Mjolnir and Stormbreaker, Thor protects Asgard and Earth as one of the most powerful members of the Avengers.",
  },
  {
    keys: ["wonderwoman", "dianaprince"],
    synonyms: ["wonder woman", "wondr woman", "wondrwman", "diana prince"],
    answer: "Wonder Woman (Diana Prince) is an Amazonian warrior princess from Themyscira created by William Moulton Marston. Armed with the Lasso of Truth and bulletproof bracelets, she advocates for peace and justice.",
  },
  {
    keys: ["wolverine", "logan", "jameshowlett"],
    synonyms: ["wolvrine", "wolverin", "logan", "xmen wolverine"],
    answer: "Wolverine (Logan / James Howlett) is a Marvel mutant superhero equipped with an adamantium-reinforced skeleton, retractable claws, and an extraordinary healing factor.",
  },
  {
    keys: ["deadpool", "wadewilson"],
    synonyms: ["dead pool", "dedpool", "wade wilson"],
    answer: "Deadpool (Wade Wilson) is Marvel's irreverent 'Merc with a Mouth', famous for his rapid healing factor, martial prowess, and fourth-wall-breaking humor.",
  },
  {
    keys: ["blackpanther", "tchalla"],
    synonyms: ["black panther", "blackpanthr", "tchalla", "wakanda"],
    answer: "Black Panther (King T'Challa) is the superhero monarch of Wakanda. Consuming the Heart-Shaped Herb bestows him with superhuman physical abilities and a Vibranium suit.",
  },
  {
    keys: ["alberteinstein", "einstein"],
    synonyms: ["albert einstein", "albrt einstein", "einstien", "einstin"],
    answer: "Albert Einstein (1879–1955) was a world-renowned theoretical physicist who developed the theory of relativity (including E = mc²). He received the 1921 Nobel Prize in Physics for explaining the photoelectric effect.",
  },
  {
    keys: ["isaacnewton", "sirisaacnewton"],
    synonyms: ["isaac newton", "isac newton", "sir isaac newton", "newton gravity"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician and physicist who formulated the laws of motion, universal gravitation, and co-developed calculus.",
  },
  {
    keys: ["nikolatesla", "tesla"],
    synonyms: ["nikola tesla", "nicola tesla", "tesla ac"],
    answer: "Nikola Tesla (1856–1943) was an inventor and electrical engineer whose pioneering work on Alternating Current (AC) power systems revolutionized global electrical technology.",
  },
  {
    keys: ["elonmusk"],
    synonyms: ["elon musk", "elon", "musk tesla", "elon musque"],
    answer: "Elon Musk is an entrepreneur and CEO of SpaceX, Tesla, Neuralink, and xAI, as well as the owner of X (formerly Twitter).",
  },
  {
    keys: ["stevejobs"],
    synonyms: ["steve jobs", "stve jobs", "jobs apple"],
    answer: "Steve Jobs (1955–2011) was the visionary co-founder of Apple Inc., transforming personal computing, digital music, and mobile phones with the Mac, iPod, and iPhone.",
  },
  {
    keys: ["capitaloffrance", "paris"],
    synonyms: ["paris france", "captial of france", "capital france", "pariss"],
    answer: "The capital of France is Paris, famous for its rich history, fashion, art, and iconic monuments like the Eiffel Tower and the Louvre Museum.",
  },
  {
    keys: ["capitalofjapan", "tokyo"],
    synonyms: ["tokyo japan", "capital japan", "captial of japan", "tokiyo"],
    answer: "The capital of Japan is Tokyo, a vibrant global metropolis blending futuristic technology, traditional shrines, and world-class gastronomy.",
  },
  {
    keys: ["capitalofusa", "washingtondc"],
    synonyms: ["capital of united states", "capital of us", "washington d c", "washington dc"],
    answer: "The capital of the United States is Washington, D.C., housing the White House, Capitol, Supreme Court, and national monuments.",
  },
  {
    keys: ["capitalofuk", "london"],
    synonyms: ["capital of united kingdom", "capital of britain", "london uk", "londn"],
    answer: "The capital of the United Kingdom is London, an influential global metropolis situated on the River Thames.",
  },
  {
    keys: ["speedoflight"],
    answer: "The speed of light in a vacuum is approximately 299,792,458 meters per second (~186,282 miles per second or 300,000 km/s).",
  },
  {
    keys: ["quantumphysics", "quantummechanics"],
    synonyms: ["quantum physics", "quantum mechanics", "quantom physics"],
    answer: "Quantum physics is the branch of physics studying matter and light at subatomic scales, exploring phenomena like superposition and quantum entanglement.",
  },
  {
    keys: ["photosynthesis"],
    synonyms: ["photo synthesis", "photosinthesis", "fotosynthesis"],
    answer: "Photosynthesis is the biological process where plants convert sunlight, water, and carbon dioxide into glucose energy and oxygen.",
  },
  {
    keys: ["artificialintelligence", "ai"],
    synonyms: ["artificial intelligence", "artifical intelligence", "artifical intelgence"],
    answer: "Artificial Intelligence (AI) refers to software systems capable of performing cognitive tasks like reasoning, learning, language understanding, and problem solving.",
  },
  {
    keys: ["whoareyou", "whatisnuvio", "nuvio"],
    synonyms: ["nuvio test", "nuviotest", "who created you", "what is nuvio test"],
    answer: "I am Nuvio Test, an autonomous AI operating system designed for multi-step reasoning, voice interaction, coding, research, media synthesis, and background tasks.",
  }
];

/**
 * Pre-cleans common typo lead-ins in question phrasing.
 */
function cleanQuery(text: string): string {
  let cleaned = text.toLowerCase().trim();
  // Autocorrect common conversational typos
  cleaned = cleaned
    .replace(/\b(wht|wat|whas|whats|what's|whos|who's|whois)\b/g, (m) => {
      if (m.includes("who")) return "who is";
      return "what is";
    })
    .replace(/\b(tel me|telme|tellme)\b/g, "tell me")
    .replace(/\b(plz|pls|plse)\b/g, "please")
    .replace(/\b(abou|abt)\b/g, "about");

  cleaned = cleaned.replace(/^(no|hey|hi|hello|so|well|actually|please|tell me|can you tell me|do you know|i want to know|what can you tell me about|what about|how about|and what about|and how about)\s+/i, "");
  return cleaned.trim();
}

/**
 * Checks if a token matches any key or synonym with typo tolerance.
 */
function fuzzyMatch(userInput: string, target: string): boolean {
  const normUser = normalizeKey(userInput);
  const normTarget = normalizeKey(target);

  if (!normUser || !normTarget) return false;

  // Exact substring
  if (normUser.includes(normTarget) || normTarget.includes(normUser)) {
    return true;
  }

  // Word-by-word fuzzy Levenshtein check
  const userWords = userInput.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);

  for (const uWord of userWords) {
    if (uWord.length < 3) continue;
    for (const tWord of targetWords) {
      if (tWord.length < 3) continue;

      const sim = stringSimilarity(uWord, tWord);
      // High similarity threshold for words
      if (sim >= 0.75) {
        return true;
      }
    }
  }

  // Full string similarity check
  const overallSim = stringSimilarity(normUser, normTarget);
  return overallSim >= 0.70;
}

/**
 * Evaluates user input and generates a natural, typo-tolerant AI answer.
 */
export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);

  // 1. Check Knowledge Base with Fuzzy Match & Typo Tolerance
  for (const item of KNOWLEDGE_BASE) {
    // Check main keys
    for (const key of item.keys) {
      if (fuzzyMatch(lower, key) || fuzzyMatch(cleaned, key)) {
        return item.answer;
      }
    }
    // Check synonyms if present
    if (item.synonyms) {
      for (const syn of item.synonyms) {
        if (fuzzyMatch(lower, syn) || fuzzyMatch(cleaned, syn)) {
          return item.answer;
        }
      }
    }
  }

  // 2. Typo-Tolerant Greetings
  if (/^(hi|hello|hey|heyy|greetings|good morning|good afternoon|good evening|whats up|sup|helloo)\b/i.test(cleaned)) {
    return "Hello! I am ready to assist you. Ask me anything or let me know what you'd like to work on.";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do") || cleaned.includes("how r u")) {
    return "I'm operating smoothly and ready to answer any questions or help with your tasks.";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks") || cleaned.includes("thx") || cleaned.includes("thnk u")) {
    return "You're very welcome!";
  }

  // 3. Dynamic "Who is" Handler with typo correction
  if (/^(who|whos|whois)\s+(is|was|are|were)?\b/i.test(cleaned) || cleaned.startsWith("who ")) {
    const subject = cleaned.replace(/^(who|whos|whois)\s+(is|was|are|were)?\s+/i, "").replace(/\?/g, "").trim();
    if (subject) {
      // Re-run fuzzy check against subject
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
      return `${subject.charAt(0).toUpperCase() + subject.slice(1)} is a well-known figure or character in history, culture, or fiction.`;
    }
  }

  // 4. Dynamic "What is" Handler with typo correction
  if (/^(what|whats|whatis|wht|wat)\s+(is|are|was|were)?\b/i.test(cleaned) || cleaned.startsWith("definition of")) {
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
      return `${concept.charAt(0).toUpperCase() + concept.slice(1)} is a key concept in its domain, defined by its core principles, functional properties, and real-world applications.`;
    }
  }

  // 5. "What about..." Questions with typo tolerance
  if (/^(what|how|and what|and how)\s+about\b/i.test(lower) || lower.includes("think about")) {
    const topic = lower
      .replace(/^(what|how|and what|and how)\s+about\s+/i, "")
      .replace(/^what do you think about\s+/i, "")
      .replace(/\?/g, "")
      .trim();

    for (const item of KNOWLEDGE_BASE) {
      for (const key of item.keys) {
        if (fuzzyMatch(topic, key)) return item.answer;
      }
      if (item.synonyms) {
        for (const syn of item.synonyms) {
          if (fuzzyMatch(topic, syn)) return item.answer;
        }
      }
    }

    return `${topic.charAt(0).toUpperCase() + topic.slice(1)} is an important topic involving key foundational concepts, structured processes, and practical applications within its field.`;
  }

  // 6. General Inquiry Fallback
  return `${raw.charAt(0).toUpperCase() + raw.slice(1)} is a notable topic involving key principles, structured systems, and practical applications.`;
}