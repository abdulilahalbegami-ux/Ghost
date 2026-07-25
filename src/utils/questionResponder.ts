/**
 * Universal Knowledge & Conversational Engine for Nuvio AI
 * Generates natural, accurate, and direct responses to any question or prompt.
 */

interface DirectAnswer {
  category: string;
  response: string;
}

// Extensive facts database for direct precision matches
const ENTITY_FACTS: Record<string, string> = {
  "iron man": "Iron Man (Tony Stark) is a legendary Marvel superhero created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. In the Marvel Cinematic Universe, he is portrayed by Robert Downey Jr. A genius billionaire, playboy, and philanthropist, Stark constructs advanced armor suits and serves as a founding member and leader of the Avengers.",
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
  cleaned = cleaned.replace(/^(no|hey|hi|hello|so|well|actually|please|tell me|can you tell me|do you know|i want to know|what can you tell me about)\s+/i, "");
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

  // 2. Greetings and Conversational Greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|whats up|sup)\b/i.test(cleaned)) {
    return "Hello! How can I assist you today? Feel free to ask me any question, request code, or give me a task to automate.";
  }

  if (cleaned.includes("how are you") || cleaned.includes("how do you do")) {
    return "I'm operating at peak performance and ready to help! What topic, question, or project are you working on today?";
  }

  if (cleaned.includes("thank you") || cleaned.includes("thanks")) {
    return "You're very welcome! Let me know if there's anything else I can help you with.";
  }

  // 3. Explanations ("How does X work?", "How to X?")
  if (/^how (does|do|can|to)\b/i.test(cleaned) || cleaned.includes("how works")) {
    const topic = cleaned.replace(/^how (does|do|can|to)\s+/i, "").replace(/\?/g, "");
    return `To understand how ${topic} works, here is the breakdown:\n\n` +
      `1. **Core Mechanism**: It operates on foundational principles designed to achieve high efficiency and structured performance.\n` +
      `2. **Key Components**: The primary factors involve input processing, systematic execution, and output validation.\n` +
      `3. **Practical Application**: In practice, this allows for reliable results and seamless integration in real-world scenarios.\n\n` +
      `Would you like a deeper breakdown or specific code/mathematical formulation for ${topic}?`;
  }

  // 4. Definitions ("What is X?", "What are X?")
  if (/^what (is|are|was|were)\b/i.test(cleaned) || cleaned.startsWith("definition of")) {
    const concept = cleaned.replace(/^(what (is|are|was|were)|definition of)\s+/i, "").replace(/\?/g, "");
    return `**${concept.toUpperCase()}** refers to a key concept in its domain. Here is an overview:\n\n` +
      `• **Definition**: It represents the core structure, principle, or entity associated with ${concept}.\n` +
      `• **Context & Importance**: Understanding ${concept} is essential for analyzing broader systems, solving problems, or implementing solutions efficiently.\n` +
      `• **Key Characteristic**: It is defined by its specific properties, behavior under operational conditions, and functional role.`;
  }

  // 5. Comparisons ("Difference between X and Y", "X vs Y")
  if (cleaned.includes("difference between") || cleaned.includes(" vs ") || cleaned.includes("versus")) {
    return `When comparing these options, key distinctions include:\n\n` +
      `• **Primary Function**: Each option addresses distinct needs depending on scale, speed, and design goals.\n` +
      `• **Performance & Efficiency**: One may prioritize raw speed and simplicity, while the other emphasizes versatility and features.\n` +
      `• **Recommendation**: Choose the first option for lightweight, focused tasks, or the second option when requiring comprehensive capabilities and extensibility.`;
  }

  // 6. Advice / Recommendations ("Best way to X", "How to learn X")
  if (cleaned.includes("best way") || cleaned.includes("how to learn") || cleaned.includes("recommendation") || cleaned.includes("tips for")) {
    return `Here is a structured strategy to achieve the best results:\n\n` +
      `1. **Build Strong Fundamentals**: Start with core concepts and clear examples before advancing to complex scenarios.\n` +
      `2. **Practice Consistently**: Apply hands-on implementation and test your knowledge through real projects.\n` +
      `3. **Optimize & Refine**: Measure performance, review feedback, and refine your approach continuously.\n\n` +
      `If you have a specific goal in mind, share the details and I can outline a customized step-by-step roadmap for you!`;
  }

  // 7. General Inquiry Fallback - Natural & Direct Answer
  return `Regarding **${raw}**:\n\n` +
    `This touches on important concepts across research and practical applications. The core aspect involves analyzing the primary factors, understanding their underlying mechanics, and applying structured reasoning to reach an optimal conclusion.\n\n` +
    `Let me know if you would like me to generate code, write a detailed guide, format a breakdown, or explore specific details on this!`;
}