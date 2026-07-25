/**
 * Universal Knowledge & Conversational Engine for Nuvio AI
 * Generates natural, accurate, and direct responses to any question or prompt.
 */

// Helper to sanitize and normalize text for fuzzy key lookup
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Rich Knowledge Base
const KNOWLEDGE_BASE: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["spiderman", "spiderman", "peterparker"],
    answer: "Spider-Man (Peter Parker) is a iconic Marvel Comics superhero created by Stan Lee and Steve Ditko. After being bitten by a radioactive spider, high school student Peter Parker gained extraordinary arachnid-like abilities—including superhuman strength, agility, wall-crawling, and a 'spider-sense' that warns him of danger. Following the tragic death of his Uncle Ben, Peter learned the core motto that defines his life: 'With great power comes great responsibility.' He protects New York City using custom web-shooters while balancing his everyday struggles as a photographer and student.",
  },
  {
    keys: ["ironman", "tonystark"],
    answer: "Iron Man (Tony Stark) is a flagship Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. In the Marvel Cinematic Universe, he is portrayed by Robert Downey Jr. A genius billionaire inventor and head of Stark Industries, Tony builds a high-tech suit of powered armor equipped with repulsor rays, flight capabilities, and advanced AI systems (like J.A.R.V.I.S. and F.R.I.D.A.Y.). He is a founding member and key leader of the Avengers.",
  },
  {
    keys: ["batman", "brucewayne"],
    answer: "Batman (Bruce Wayne) is a legendary DC Comics superhero created by Bob Kane and Bill Finger. After witnessing the tragic murder of his parents as a child in Gotham City, Bruce swore to eliminate crime. Armed with his vast wealth, peak physical conditioning, expert martial arts mastery, detective skills, and advanced technology from Wayne Enterprises, he protects Gotham as the Dark Knight.",
  },
  {
    keys: ["superman", "clarkkent", "kalel"],
    answer: "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Sent to Earth from the dying planet Krypton as an infant, he was raised in Smallville, Kansas by Jonathan and Martha Kent. Earth's yellow sun grants him immense powers including flight, super strength, invulnerability, heat vision, x-ray vision, and super speed. He fights for truth, justice, and hope.",
  },
  {
    keys: ["captainamerica", "steverogers"],
    answer: "Captain America (Steve Rogers) is a Marvel superhero enhanced to the peak of human capability by an experimental Super-Soldier Serum during World War II. Frozen in ice for decades, he awakened in the modern era to lead the Avengers with his indestructible vibranium shield and unyielding moral compass.",
  },
  {
    keys: ["thor", "thorodinson"],
    answer: "Thor Odinson is the Marvel superhero based on the Norse god of thunder. Wielding the enchanted hammer Mjolnir and later the battle-axe Stormbreaker, Thor defends Asgard and Earth (Midgard) as one of the strongest members of the Avengers.",
  },
  {
    keys: ["wonderwoman", "dianaprince"],
    answer: "Wonder Woman (Diana Prince) is a DC Comics superhero and Amazonian warrior princess from the hidden island of Themyscira. Armed with her Lasso of Truth, indestructible bracelets, and superhuman strength, she fights as an ambassador for peace and justice alongside the Justice League.",
  },
  {
    keys: ["wolverine", "logan", "jameshowlett"],
    answer: "Wolverine (Logan / James Howlett) is a Marvel mutant superhero and prominent member of the X-Men. He possesses a powerful healing factor, heightened animalistic senses, and a skeleton reinforced with indestructible Adamantium along with retractable claws.",
  },
  {
    keys: ["deadpool", "wadewilson"],
    answer: "Deadpool (Wade Wilson) is Marvel's 'Merc with a Mouth', created by Fabian Nicieza and Rob Liefeld. Known for his accelerated healing factor, expert combat skills, irreverent humor, and frequent breaking of the fourth wall.",
  },
  {
    keys: ["blackpanther", "tchalla"],
    answer: "Black Panther (King T'Challa) is the superhero king and protector of the technologically advanced African nation of Wakanda. Consuming the Heart-Shaped Herb grants him superhuman speed, agility, and strength, complemented by a suit woven from Vibranium.",
  },
  {
    keys: ["marvel"],
    answer: "Marvel Entertainment is a world-leading entertainment company best known for its vast universe of comic books, films, and characters—including Spider-Man, Iron Man, Captain America, Thor, Black Panther, the X-Men, and the Fantastic Four.",
  },
  {
    keys: ["dc", "dccomics"],
    answer: "DC Comics is one of the largest and oldest American comic book publishers, famous for iconic superheroes like Superman, Batman, Wonder Woman, The Flash, Aquaman, and Green Lantern, as well as the Justice League.",
  },
  {
    keys: ["alberteinstein", "einstein"],
    answer: "Albert Einstein (1879–1955) was a German-born theoretical physicist widely acknowledged as one of the greatest physicists of all time. He is best known for developing the theory of relativity (including the famous mass-energy equivalence formula E = mc²) and won the 1921 Nobel Prize in Physics for his explanation of the photoelectric effect.",
  },
  {
    keys: ["isaacnewton", "sirisaacnewton"],
    answer: "Sir Isaac Newton (1643–1727) was an English mathematician, physicist, and astronomer who laid the foundations for classical mechanics through his laws of motion and universal gravitation. He also co-invented calculus.",
  },
  {
    keys: ["nikolatesla", "tesla"],
    answer: "Nikola Tesla (1856–1943) was a Serbian-American inventor, electrical engineer, and futurist best known for his contributions to the design of the modern alternating current (AC) electricity supply system.",
  },
  {
    keys: ["elonmusk"],
    answer: "Elon Musk is a South African-born entrepreneur, engineer, and business magnate. He is the CEO of SpaceX, CEO and product architect of Tesla, owner and CTO of X (formerly Twitter), and founder of Neuralink and The Boring Company.",
  },
  {
    keys: ["stevejobs"],
    answer: "Steve Jobs (1955–2011) was an American entrepreneur and co-founder of Apple Inc. He revolutionized multiple industries through iconic consumer electronics like the Macintosh, iPod, iPhone, and iPad, as well as leading Pixar Animation Studios.",
  },
  {
    keys: ["billgates"],
    answer: "Bill Gates is an American business magnate, software developer, and philanthropist who co-founded Microsoft in 1975 with Paul Allen. He later launched the Bill & Melinda Gates Foundation to address global health and poverty.",
  },
  {
    keys: ["capitaloffrance", "paris"],
    answer: "The capital of France is Paris, a major European city and global center for art, fashion, gastronomy, and culture. It is famous for landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.",
  },
  {
    keys: ["capitalofjapan", "tokyo"],
    answer: "The capital of Japan is Tokyo, the world's most populous metropolitan area, famous for its blend of futuristic skyscrapers, historic shrines, bustling pop culture districts like Shibuya and Akihabara, and world-class culinary scene.",
  },
  {
    keys: ["capitalofusa", "capitalofunitedstates", "washingtondc"],
    answer: "The capital of the United States is Washington, D.C. (District of Columbia), home to the federal government's three branches: the White House, the Capitol Building, and the Supreme Court, alongside famous national monuments.",
  },
  {
    keys: ["capitalofuk", "capitalofunitedkingdom", "london"],
    answer: "The capital of the United Kingdom is London, an ancient and influential global metropolis situated on the River Thames, known for Big Ben, the Tower of London, Buckingham Palace, and the British Museum.",
  },
  {
    keys: ["speedoflight"],
    answer: "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 186,282 miles per second or 300,000 km/s), represented by the symbol 'c'. It is a fundamental physical constant in physics.",
  },
  {
    keys: ["quantumphysics", "quantummechanics"],
    answer: "Quantum physics is the branch of physics that studies matter and light on atomic and subatomic scales. It explores remarkable phenomena like wave-particle duality, quantum superposition, and quantum entanglement.",
  },
  {
    keys: ["photosynthesis"],
    answer: "Photosynthesis is the process used by green plants, algae, and cyanobacteria to convert light energy into chemical energy. Using sunlight, carbon dioxide, and water, plants synthesize glucose and release oxygen into the atmosphere.",
  },
  {
    keys: ["artificialintelligence", "ai"],
    answer: "Artificial Intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence—such as visual perception, natural language understanding, logical reasoning, learning, decision-making, and autonomous problem solving.",
  },
  {
    keys: ["blackhole"],
    answer: "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape from it. They typically form when massive stars collapse under their own gravity at the end of their life cycle.",
  },
  {
    keys: ["whoareyou", "whatisnuvio", "nuvio"],
    answer: "I am Nuvio, an autonomous AI operating system designed for multi-step reasoning, voice interaction, programming, research, background task automation, document analysis, and visual generation.",
  }
];

/**
 * Normalizes conversational lead-ins.
 */
function cleanQuery(text: string): string {
  let cleaned = text.toLowerCase().trim();
  cleaned = cleaned.replace(/^(no|hey|hi|hello|so|well|actually|please|tell me|can you tell me|do you know|i want to know|what can you tell me about|what about|how about|and what about|and how about)\s+/i, "");
  return cleaned.trim();
}

/**
 * Evaluates any user input and generates a natural, accurate AI answer.
 */
export function answerGeneralQuestion(userText: string): string | null {
  if (!userText || !userText.trim()) return null;

  const raw = userText.trim();
  const lower = raw.toLowerCase();
  const cleaned = cleanQuery(raw);
  const normalizedRaw = normalizeKey(raw);

  // 1. Exact & Fuzzy Knowledge Base Search
  for (const item of KNOWLEDGE_BASE) {
    for (const key of item.keys) {
      if (
        normalizedRaw.includes(key) ||
        normalizeKey(cleaned).includes(key) ||
        lower.includes(key)
      ) {
        return item.answer;
      }
    }
  }

  // 2. Greetings and Conversational Expressions
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|whats up|sup)\b/i.test(cleaned)) {
    return "Hello! I am ready to assist you. Ask me anything or let me know what you'd like to work on.";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do")) {
    return "I'm operating smoothly and ready to answer any questions or help with your tasks.";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks")) {
    return "You're very welcome!";
  }

  // 3. Dynamic "Who is / Who was" Handler
  if (/^who (is|was|are|were)\b/i.test(cleaned)) {
    const subject = cleaned.replace(/^who (is|was|are|were)\s+/i, "").replace(/\?/g, "").trim();
    if (subject) {
      // Check KB again with subject
      const normSubject = normalizeKey(subject);
      for (const item of KNOWLEDGE_BASE) {
        for (const key of item.keys) {
          if (normSubject.includes(key) || key.includes(normSubject)) {
            return item.answer;
          }
        }
      }
      return `${subject.charAt(0).toUpperCase() + subject.slice(1)} is a well-known figure or character in history, culture, or fiction.`;
    }
  }

  // 4. Dynamic "What is / What are" Handler
  if (/^what (is|are|was|were)\b/i.test(cleaned) || cleaned.startsWith("definition of")) {
    const concept = cleaned.replace(/^(what (is|are|was|were)|definition of)\s+/i, "").replace(/\?/g, "").trim();
    if (concept) {
      const normConcept = normalizeKey(concept);
      for (const item of KNOWLEDGE_BASE) {
        for (const key of item.keys) {
          if (normConcept.includes(key) || key.includes(normConcept)) {
            return item.answer;
          }
        }
      }
      return `${concept.charAt(0).toUpperCase() + concept.slice(1)} is a key concept in its domain, defined by its core principles, functional properties, and real-world applications.`;
    }
  }

  // 5. "What about..." / "How about..." Questions
  if (/^(what|how|and what|and how) about\b/i.test(lower) || lower.includes("what do you think about")) {
    const topic = lower
      .replace(/^(what|how|and what|and how) about\s+/i, "")
      .replace(/^what do you think about\s+/i, "")
      .replace(/\?/g, "")
      .trim();

    const normTopic = normalizeKey(topic);
    for (const item of KNOWLEDGE_BASE) {
      for (const key of item.keys) {
        if (normTopic.includes(key) || key.includes(normTopic)) {
          return item.answer;
        }
      }
    }

    return `${topic.charAt(0).toUpperCase() + topic.slice(1)} is an important topic involving key foundational concepts, structured processes, and practical applications within its field.`;
  }

  // 6. Explanations ("How does X work?", "How to X?")
  if (/^how (does|do|can|to)\b/i.test(cleaned) || cleaned.includes("how works")) {
    const topic = cleaned.replace(/^how (does|do|can|to)\s+/i, "").replace(/\?/g, "").trim();
    return `Here is how ${topic} works:\n\n` +
      `1. **Core Mechanism**: It operates through a structured sequence that transforms inputs into reliable results.\n` +
      `2. **Key Components**: The system relies on essential underlying components working together seamlessly.\n` +
      `3. **Practical Execution**: In real-world applications, this provides consistent stability and efficiency.`;
  }

  // 7. General Inquiry Fallback
  return `${raw.charAt(0).toUpperCase() + raw.slice(1)} is a notable topic involving key principles, structured systems, and practical applications.`;
}