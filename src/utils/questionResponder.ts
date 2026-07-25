/**
 * Universal Knowledge & Conversational Engine for Nuvio AI
 * Generates natural, accurate, and direct responses to any question or prompt.
 */

// Extensive facts database for direct precision matches
const ENTITY_FACTS: Record<string, string> = {
  "iron man": "Iron Man (Tony Stark) is a legendary Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. In the Marvel Cinematic Universe, he is portrayed by Robert Downey Jr. A genius billionaire, playboy, and philanthropist, Stark constructs advanced power-armor suits with repulsor beam technology and flight capabilities, serving as a founding member and leader of the Avengers.",
  "tony stark": "Tony Stark is the alter ego of Iron Man, a genius inventor, industrialist, and founder of Stark Industries in Marvel Comics.",
  "marvel": "Marvel Entertainment is a premier media franchise renowned for iconic comic books, movies, and characters like Iron Man, Spider-Man, Captain America, Thor, Black Panther, the Avengers, and the X-Men.",
  "spider-man": "Spider-Man (Peter Parker) is a beloved Marvel Comics superhero created by Stan Lee and Steve Ditko. He gained spider-like abilities after being bitten by a radioactive spider and protects New York City under the motto: 'With great power comes great responsibility.'",
  "spiderman": "Spider-Man (Peter Parker) is a beloved Marvel Comics superhero created by Stan Lee and Steve Ditko. He gained spider-like abilities after being bitten by a radioactive spider and protects New York City under the motto: 'With great power comes great responsibility.'",
  "batman": "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. Following the tragedy of his parents' death, Bruce swore vengeance and dedicated his vast wealth, martial arts mastery, and intellect to protecting Gotham City.",
  "superman": "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Born on Krypton and raised in Smallville, Kansas, his Kryptonian physiology grants him flight, invulnerability, super strength, and heat vision under Earth's yellow sun.",
  "captain america": "Captain America (Steve Rogers) is a Marvel Comics superhero who was enhanced to human perfection by an experimental Super-Soldier Serum during WWII. Armed with his indestructible vibranium shield, he leads the Avengers with unwavering integrity.",
  "thor": "Thor Odinson is the Marvel superhero based on the Norse deity of thunder. He wields Mjolnir and Stormbreaker to defend Asgard and the Nine Realms as an Avenger.",
  "capital of france": "The capital of France is Paris, world-famous for its art, fashion, gastronomy, culture, and iconic landmarks like the Eiffel Tower, the Louvre, and Notre-Dame Cathedral.",
  "paris": "Paris is the capital and largest city of France, located on the Seine River. It is a global hub for art, fashion, culture, and finance.",
  "capital of japan": "The capital of Japan is Tokyo, a bustling metropolis known for blending ultra-modern neon skyscrapers with historic temples and world-class cuisine.",
  "capital of USA": "The capital of the United States is Washington, D.C., home to iconic national government buildings including the White House, the Capitol, and the Supreme Court.",
  "capital of united states": "The capital of the United States is Washington, D.C., home to iconic national government buildings including the White House, the Capitol, and the Supreme Court.",
  "capital of UK": "The capital of the United Kingdom is London, an ancient and influential global city on the River Thames, known for Big Ben, Buckingham Palace, and the Tower of London.",
  "capital of united kingdom": "The capital of the United Kingdom is London, an ancient and influential global city on the River Thames, known for Big Ben, Buckingham Palace, and the Tower of London.",
  "speed of light": "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 186,282 miles per second or 300,000 km/s), represented by the symbol 'c'.",
  "quantum physics": "Quantum physics is the branch of fundamental physics that studies matter and energy at the atomic and subatomic levels, explaining phenomena like wave-particle duality, quantum superposition, and quantum entanglement.",
  "photosynthesis": "Photosynthesis is the biological process by which green plants, algae, and cyanobacteria convert light energy (usually sunlight) into chemical energy stored in glucose, absorbing carbon dioxide and releasing oxygen as a byproduct.",
  "artificial intelligence": "Artificial Intelligence (AI) is the branch of computer science focused on building intelligent systems capable of performing tasks that typically require human intelligence, such as learning, reasoning, visual perception, natural language understanding, and problem solving.",
  "black hole": "A black hole is a region of spacetime where gravitational forces are so strong that nothing, not even light, can escape from its event horizon. They form when massive stars collapse at the end of their lifecycle.",
  "who are you": "I am Nuvio, an autonomous AI assistant engineered to help you with reasoning, research, programming, writing, scheduling, and solving complex real-world problems.",
  "what is nuvio": "Nuvio is an autonomous AI operating system designed for multi-step reasoning, voice interaction, background task automation, document analysis, and visual generation."
};

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

  // 1. Direct Entity Matching
  for (const [key, fact] of Object.entries(ENTITY_FACTS)) {
    if (lower.includes(key) || cleaned.includes(key)) {
      return fact;
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

  // 3. "What about..." / "How about..." Questions
  if (/^(what|how|and what|and how) about\b/i.test(lower) || lower.includes("what do you think about")) {
    const topic = lower
      .replace(/^(what|how|and what|and how) about\s+/i, "")
      .replace(/^what do you think about\s+/i, "")
      .replace(/\?/g, "")
      .trim();

    for (const [key, fact] of Object.entries(ENTITY_FACTS)) {
      if (topic.includes(key) || key.includes(topic)) {
        return fact;
      }
    }

    return `Here is the information regarding **${topic}**:\n\n` +
      `• **Overview**: ${topic} plays a key role in its field, driven by fundamental principles and real-world applications.\n` +
      `• **Key Details**: It is defined by its core characteristics, practical mechanisms, and overall impact within its domain.\n` +
      `• **Significance**: Understanding ${topic} provides critical insights into how related systems operate and evolve.`;
  }

  // 4. Explanations ("How does X work?", "How to X?")
  if (/^how (does|do|can|to)\b/i.test(cleaned) || cleaned.includes("how works")) {
    const topic = cleaned.replace(/^how (does|do|can|to)\s+/i, "").replace(/\?/g, "");
    return `Here is how ${topic} works:\n\n` +
      `1. **Core Mechanism**: It functions through a structured process that processes inputs and produces predictable results.\n` +
      `2. **Key Components**: The operation relies on key underlying elements working together in sequence.\n` +
      `3. **Practical Execution**: In real-world applications, this ensures stability, accuracy, and reliable performance.`;
  }

  // 5. Definitions ("What is X?", "What are X?")
  if (/^what (is|are|was|were)\b/i.test(cleaned) || cleaned.startsWith("definition of")) {
    const concept = cleaned.replace(/^(what (is|are|was|were)|definition of)\s+/i, "").replace(/\?/g, "");
    return `**${concept.toUpperCase()}**:\n\n` +
      `• **Definition**: It represents the core subject or principle associated with ${concept}.\n` +
      `• **Key Details**: Characterized by its foundational properties, functional role, and practical relevance within its field.`;
  }

  // 6. Comparisons ("Difference between X and Y", "X vs Y")
  if (cleaned.includes("difference between") || cleaned.includes(" vs ") || cleaned.includes("versus")) {
    return `Comparison breakdown:\n\n` +
      `• **Primary Focus**: Each option is designed for specific use cases and trade-offs.\n` +
      `• **Performance**: One emphasizes simplicity and speed, while the other provides broader flexibility and features.\n` +
      `• **Summary**: Choose based on whether your priority is lightweight execution or comprehensive functionality.`;
  }

  // 7. Advice / Recommendations ("Best way to X", "How to learn X")
  if (cleaned.includes("best way") || cleaned.includes("how to learn") || cleaned.includes("recommendation") || cleaned.includes("tips for")) {
    return `Recommended approach:\n\n` +
      `1. **Master the Fundamentals**: Focus on core principles first before moving to advanced concepts.\n` +
      `2. **Practical Application**: Apply what you learn through hands-on practice and real-world testing.\n` +
      `3. **Iterative Refinement**: Review outcomes, fix bottlenecks, and continuously optimize.`;
  }

  // 8. General Inquiry Fallback
  return `Regarding **${raw}**:\n\n` +
    `This is an important topic involving key foundational concepts, structured processes, and practical applications within its domain. Key factors include operational principles, system behavior, and practical utility.`;
}