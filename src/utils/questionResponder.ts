/**
 * Natural Conversational & Knowledge Engine for Nuvio
 *
 * Provides direct, natural, human-like AI responses across general knowledge,
 * step-by-step guidance, creative writing, programming, and everyday conversation.
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
  // Superheroes & Pop Culture
  {
    tags: ["spiderman", "peter parker", "spider man", "spidey"],
    answer: "Spider-Man (Peter Parker) is a beloved Marvel superhero created by Stan Lee and Steve Ditko. After being bitten by a radioactive spider, Peter gained wall-crawling abilities, super strength, agility, and a 'spider-sense'. Guided by his uncle's lesson that 'with great power comes great responsibility,' he protects New York City while balancing normal life.",
  },
  {
    tags: ["iron man", "tony stark", "ironman"],
    answer: "Iron Man (Tony Stark) is a Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. A genius billionaire inventor, Tony built a powered suit of armor to escape captivity, which he later refined to protect the world as an Avenger.",
  },
  {
    tags: ["batman", "bruce wayne", "dark knight"],
    answer: "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. Lacking superhuman powers, Bruce relies on martial arts mastery, detective skills, advanced technology, and immense wealth to fight crime in Gotham City.",
  },
  {
    tags: ["superman", "clark kent", "kal el"],
    answer: "Superman (Clark Kent) is a DC Comics superhero from the destroyed planet Krypton. Raised in Kansas, Earth's yellow sun grants him flight, invulnerability, super strength, heat vision, and x-ray vision, which he uses to defend humanity.",
  },

  // Historical Figures & Scientists
  {
    tags: ["albert einstein", "einstein", "relativity"],
    answer: "Albert Einstein (1879–1955) was a theoretical physicist widely regarded as one of the greatest scientists in history. He developed the theory of relativity (including E = mc²), which revolutionized our understanding of space, time, gravity, and energy. He won the Nobel Prize in Physics in 1921 for his discovery of the photoelectric effect.",
  },
  {
    tags: ["isaac newton", "sir isaac newton", "gravity"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician and physicist who formulated the three laws of motion, established the law of universal gravitation, and co-developed calculus. His work laid the foundation for classical mechanics.",
  },
  {
    tags: ["nikola tesla", "tesla"],
    answer: "Nikola Tesla (1856–1943) was a Serbian-American inventor and electrical engineer best known for designing the alternating current (AC) electricity system, which powers modern electrical grids worldwide.",
  },
  {
    tags: ["marie curie", "curie"],
    answer: "Marie Curie (1867–1934) was a pioneering physicist and chemist who conducted groundbreaking research on radioactivity. She was the first woman to win a Nobel Prize, the first person to win Nobel Prizes in two different scientific fields (Physics and Chemistry), and discovered the elements polonium and radium.",
  },

  // Science & Astronomy
  {
    tags: ["black hole", "black holes"],
    answer: "A black hole is a region of spacetime where gravity is so intense that nothing—not even light—can escape its event horizon. They are formed when massive stars collapse at the end of their life cycle or during cosmic mergers.",
  },
  {
    tags: ["photosynthesis", "how plants make food"],
    answer: "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (usually from the sun) along with carbon dioxide and water into glucose (sugar) and oxygen. It is vital for oxygen production on Earth.",
  },
  {
    tags: ["quantum computing", "quantum computer"],
    answer: "Quantum computing is an advanced technology that uses quantum mechanical phenomena—like superposition and entanglement—to perform calculations exponentially faster than classical supercomputers for complex problems in chemistry, cryptography, and optimization.",
  },
  {
    tags: ["solar system", "planets"],
    answer: "Our solar system consists of the Sun and everything bound to it by gravity: eight official planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), dwarf planets like Pluto, dozens of moons, and millions of asteroids and comets.",
  },

  // Geography & Countries
  {
    tags: ["capital of france", "paris"],
    answer: "The capital of France is Paris, famous for its world-renowned landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, as well as its rich culture, fashion, and cuisine.",
  },
  {
    tags: ["capital of japan", "tokyo"],
    answer: "The capital of Japan is Tokyo, a vibrant metropolis blending futuristic technology, traditional shrines, bustling commerce, and a world-class culinary scene.",
  },
  {
    tags: ["capital of USA", "capital of united states", "washington dc"],
    answer: "The capital of the United States is Washington, D.C., home to key federal government landmarks including the White House, the U.S. Capitol, and the Supreme Court.",
  },
  {
    tags: ["capital of UK", "capital of england", "london"],
    answer: "The capital of the United Kingdom is London, a historic global city famous for Big Ben, the Tower of London, Buckingham Palace, and its rich arts and financial sectors.",
  },

  // Tech & AI
  {
    tags: ["artificial intelligence", "what is ai"],
    answer: "Artificial Intelligence (AI) refers to the simulation of human intelligence by computer systems. It encompasses subfields like machine learning, deep learning, computer vision, and natural language processing, enabling machines to learn, reason, solve problems, and understand human language.",
  },
  {
    tags: ["blockchain", "what is blockchain"],
    answer: "A blockchain is a decentralized, distributed digital ledger that records transactions across many computers securely. Once recorded, the data cannot be altered retroactively without altering subsequent blocks, making it fundamental to cryptocurrencies and smart contracts.",
  },
  {
    tags: ["cloud computing", "what is cloud computing"],
    answer: "Cloud computing is the on-demand delivery of computing services—including servers, storage, databases, networking, software, and analytics—over the internet ('the cloud') rather than relying on local hard drives or physical servers.",
  }
];

function handleHowToQuery(lowerText: string): string {
  if (lowerText.includes("cook") || lowerText.includes("pasta") || lowerText.includes("recipe") || lowerText.includes("rice")) {
    return (
      `Here is a simple, foolproof guide:\n\n` +
      `1. **Gather ingredients**: Prep your fresh ingredients, seasoning, and oil/butter before heating your pan.\n` +
      `2. **Boil or Sear**: Heat your pan or bring salted water to a rolling boil.\n` +
      `3. **Cook evenly**: Stir periodically and maintain a steady medium heat so food cooks thoroughly without burning.\n` +
      `4. **Season & Rest**: Taste toward the end, add salt/pepper as needed, and let hot dishes rest 2-3 minutes before serving.`
    );
  }

  if (lowerText.includes("code") || lowerText.includes("program") || lowerText.includes("learn react") || lowerText.includes("web development")) {
    return (
      `Here is a structured path to get started:\n\n` +
      `1. **Master the Basics**: Learn fundamental JavaScript (variables, functions, arrays, and async/await).\n` +
      `2. **Understand Components**: Learn how React manages state (` + "`useState`" + `) and side-effects (` + "`useEffect`" + `).\n` +
      `3. **Build Small Projects**: Create practical projects like a To-Do list, Weather App, or Quiz app.\n` +
      `4. **Learn Modern Tools**: Explore Tailwind CSS for styling and Vite or Next.js for building scalable applications.`
    );
  }

  if (lowerText.includes("focus") || lowerText.includes("study") || lowerText.includes("productive")) {
    return (
      `Here are effective techniques to boost focus:\n\n` +
      `1. **Use the Pomodoro Technique**: Work uninterrupted for 25 minutes, then take a 5-minute break.\n` +
      `2. **Eliminate Distractions**: Put your phone on silent and keep only necessary browser tabs open.\n` +
      `3. **Define Clear Tasks**: Break large assignments into 2-3 small actionable items for the session.\n` +
      `4. **Stay Hydrated**: Keep water nearby and take quick physical stretches between focus sprints.`
    );
  }

  const topic = lowerText
    .replace(/^(how to|how do i|how can i|help me|guide me through|steps for)\s+/i, "")
    .replace(/\?/g, "")
    .trim();

  return (
    `Here is a straightforward step-by-step approach for ${topic || "your request"}:\n\n` +
    `1. **Planning**: Clearly define your end goal and assemble the necessary tools or information.\n` +
    `2. **Core Execution**: Focus on completing the primary action first without getting bogged down in minor details.\n` +
    `3. **Testing & Refinement**: Review your progress, tweak anything that needs adjustment, and verify the final result.`
  );
}

function handleCreativeQuery(lowerText: string): string {
  if (lowerText.includes("poem")) {
    return (
      `Gentle breeze across the night,\n` +
      `Stars that shine with steady light.\n` +
      `Through the quiet, calm and deep,\n` +
      `Peaceful dreams the shadows keep.`
    );
  }

  if (lowerText.includes("joke")) {
    const jokes = [
      "Why don't scientists trust atoms?\nBecause they make up everything!",
      "Why did the JavaScript developer wear glasses?\nBecause they didn't C#!",
      "Why don't programmers like nature?\nIt has too many bugs!",
      "What do you call a fake noodle?\nAn impasta!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (lowerText.includes("email") || lowerText.includes("letter") || lowerText.includes("draft")) {
    return (
      `Subject: Quick Follow-up regarding our conversation\n\n` +
      `Hi [Name],\n\n` +
      `I hope you're having a great week!\n\n` +
      `I am writing to follow up on our recent discussion and confirm the next steps. Please let me know if you have any questions or if you need any additional information from my side.\n\n` +
      `Best regards,\n[Your Name]`
    );
  }

  return (
    `Once upon a time in a quiet seaside town, a curious traveler discovered an old leather journal hidden inside a forgotten lighthouse. As they flipped through its worn pages, they unlocked a series of forgotten maps leading to extraordinary new adventures.`
  );
}

export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);

  // 1. Simple Greetings & Chitchat
  if (/^(hi|hello|hey|heyy|greetings|good morning|good afternoon|good evening|whats up|sup|helloo)$/i.test(cleaned)) {
    return "Hello! How can I help you today?";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do") || cleaned === "how r u") {
    return "I'm doing great, thank you! How can I assist you today?";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks") || cleaned === "thx") {
    return "You're very welcome! Let me know if you need anything else.";
  }

  if (cleaned === "who are you" || cleaned === "what is your name" || cleaned === "what are you") {
    return "I'm Nuvio, your AI assistant here to help you answer questions, write code, plan tasks, and solve problems.";
  }

  // 2. Creative Writing
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

  // 3. How-to / Help Requests
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

  // 4. Knowledge Base Match
  for (const entry of KNOWLEDGE_BASE) {
    for (const tag of entry.tags) {
      if (cleaned.includes(cleanQuery(tag)) || cleanQuery(tag).includes(cleaned)) {
        return entry.answer;
      }
    }
  }

  // 5. Short/ambiguous word queries (e.g. "maybe", "idk", "stuff")
  if (cleaned.length < 3 && !/^\d+$/.test(cleaned)) {
    return "Could you please clarify what you'd like to know?";
  }

  // 6. Natural conversational fallback
  if (cleaned.startsWith("what is") || cleaned.startsWith("who is") || cleaned.startsWith("tell me about")) {
    const topic = raw.replace(/^(what is|who is|tell me about|explain)\s+/i, "").replace(/\?/g, "").trim();
    return `${topic.charAt(0).toUpperCase() + topic.slice(1)} is a fascinating topic! Could you specify what details or context you are most interested in?`;
  }

  return null;
}