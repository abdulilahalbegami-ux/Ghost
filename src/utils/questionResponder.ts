export function answerGeneralQuestion(text: string): string | null {
  const cleanText = text.toLowerCase().trim().replace(/[?.]/g, "");

  // Expanded Knowledge Base
  const QA_DATABASE: Record<string, string> = {
    // Science & Physics
    "what is the speed of light": "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 300,000 km/s or 186,282 miles per second).",
    "whats the speed of light": "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 300,000 km/s or 186,282 miles per second).",
    "how far is the moon": "The average distance from Earth to the Moon is about 384,400 kilometers (238,855 miles).",
    "how far is the sun": "The Sun is approximately 149.6 million kilometers (92.96 million miles) from Earth, which equals 1 Astronomical Unit (AU). Light takes roughly 8 minutes and 20 seconds to reach Earth.",
    "why is the sky blue": "The sky is blue due to Rayleigh scattering. Shorter blue light wavelengths scatter much more in Earth's atmosphere than longer red wavelengths.",
    "what is quantum entanglement": "Quantum entanglement is a physical phenomenon where pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently of the state of the others, even when separated by large distances.",
    "what is theory of relativity": "Einstein's Theory of Relativity consists of Special Relativity (laws of physics are identical for all non-accelerating observers and light speed is constant) and General Relativity (gravity is the curvature of spacetime caused by mass).",

    // Science & Chemistry / Biology
    "what is dna": "DNA (Deoxyribonucleic acid) is a molecule that carries the genetic instructions for the development, functioning, growth, and reproduction of all known organisms and many viruses.",
    "what is photosynthesis": "Photosynthesis is the process used by plants, algae, and cyanobacteria to convert light energy (from the sun) into chemical energy (glucose) using carbon dioxide and water, producing oxygen as a byproduct.",

    // Geography & Capitals
    "what is the capital of france": "The capital of France is Paris.",
    "whats the capital of france": "The capital of France is Paris.",
    "capital of france": "Paris.",
    "what is the capital of japan": "The capital of Japan is Tokyo.",
    "whats the capital of japan": "The capital of Japan is Tokyo.",
    "capital of japan": "Tokyo.",
    "what is the capital of spain": "The capital of Spain is Madrid.",
    "what is the capital of italy": "The capital of Italy is Rome.",
    "what is the capital of germany": "The capital of Germany is Berlin.",
    "what is the capital of the uk": "The capital of the United Kingdom is London.",
    "what is the capital of canada": "The capital of Canada is Ottawa.",
    "what is the capital of australia": "The capital of Australia is Canberra.",
    "what is the capital of the usa": "The capital of the United States is Washington, D.C.",
    "what is the capital of saudi arabia": "The capital of Saudi Arabia is Riyadh.",
    "what is the largest country": "Russia is the largest country in the world by land area, spanning over 17.1 million square kilometers across Europe and Asia.",
    "what is the largest ocean": "The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 63 million square miles (165 million sq km).",
    "what is the tallest mountain": "Mount Everest is Earth's highest mountain above sea level, standing at 8,848.86 meters (29,031.7 ft) in the Himalayas.",

    // Tech & Computer Science
    "what is react": "React is an open-source front-end JavaScript library developed by Meta for building user interfaces based on components.",
    "what is typescript": "TypeScript is a strongly typed programming language built on JavaScript that adds static type definitions to enhance code safety and developer productivity.",
    "what is artificial intelligence": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think, reason, learn from data, and perform tasks like problem-solving and decision-making.",
    "what is a neural network": "A neural network is a computing model inspired by the human brain, consisting of interconnected nodes (neurons) organized in layers that process data and learn pattern representations.",
    "what is dark matter": "Dark matter is a hypothetical form of matter that does not interact with electromagnetic force, making it invisible, yet it accounts for roughly 85% of the matter in the universe based on gravitational effects.",

    // History & Culture
    "who wrote romeo and juliet": "William Shakespeare wrote Romeo and Juliet in the late 16th century.",
    "who painted the mona lisa": "Leonardo da Vinci painted the Mona Lisa in the early 16th century.",
    "who was the first man on the moon": "Neil Armstrong became the first human to walk on the Moon on July 20, 1969, during the Apollo 11 mission.",
  };

  // Direct match
  if (QA_DATABASE[cleanText]) {
    return QA_DATABASE[cleanText];
  }

  // Partial match scanning
  for (const [question, answer] of Object.entries(QA_DATABASE)) {
    if (cleanText.includes(question) || question.includes(cleanText)) {
      return answer;
    }
  }

  // Conversational & Identity handling
  if (cleanText.startsWith("how are you") || cleanText.includes("how r u")) {
    return "I am operating at peak efficiency! Neural reasoning cores are fully active. How can I assist you with code, automation, research, or complex workflows today?";
  }

  if (cleanText.startsWith("what is your name") || cleanText.includes("who are you")) {
    return "I am Vertex OS, an autonomous AI reasoning system. I excel at multi-step problem solving, code architecture, task execution, data extraction, price comparison, and visual generation.";
  }

  if (cleanText.includes("time") && (cleanText.includes("what") || cleanText.includes("current"))) {
    return `The current system time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.`;
  }

  if (cleanText.includes("date") && (cleanText.includes("what") || cleanText.includes("today"))) {
    return `Today's date is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;
  }

  return null;
}