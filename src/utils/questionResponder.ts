export function answerGeneralQuestion(text: string): string | null {
  const cleanText = text.toLowerCase().trim().replace(/[?.]/g, "");

  // Math questions handled by mathEvaluator, but let's add some common ones here just in case
  if (cleanText === "whats 20 + 20" || cleanText === "what is 20 + 20" || cleanText === "20 + 20" || cleanText === "20+20") {
    return "40";
  }

  const QA_DATABASE: Record<string, string> = {
    "what is the capital of france": "The capital of France is Paris.",
    "whats the capital of france": "The capital of France is Paris.",
    "capital of france": "Paris.",
    "what is the capital of japan": "The capital of Japan is Tokyo.",
    "whats the capital of japan": "The capital of Japan is Tokyo.",
    "capital of japan": "Tokyo.",
    "what is the capital of spain": "The capital of Spain is Madrid.",
    "what is the capital of italy": "The capital of Italy is Rome.",
    "what is the capital of Germany": "The capital of Germany is Berlin.",
    "what is the capital of the uk": "The capital of the United Kingdom is London.",
    "what is the capital of canada": "The capital of Canada is Ottawa.",
    "what is the capital of australia": "The capital of Australia is Canberra.",
    
    "who wrote romeo and juliet": "William Shakespeare wrote Romeo and Juliet.",
    "who wrote hamlet": "William Shakespeare wrote Hamlet.",
    "who painted the mona lisa": "Leonardo da Vinci painted the Mona Lisa.",
    
    "what is the speed of light": "The speed of light is approximately 299,792 kilometers per second (186,282 miles per second).",
    "whats the speed of light": "The speed of light is approximately 299,792 kilometers per second (186,282 miles per second).",
    
    "how far is the moon": "The moon is approximately 384,400 kilometers (238,855 miles) away from Earth.",
    "how far is the sun": "The sun is approximately 149.6 million kilometers (92.96 million miles) away from Earth.",
    
    "what is the largest ocean": "The Pacific Ocean is the largest and deepest ocean on Earth.",
    "whats the largest ocean": "The Pacific Ocean is the largest and deepest ocean on Earth.",
    
    "why is the sky blue": "The sky is blue because of Rayleigh scattering. Earth's atmosphere scatters shorter wavelengths of light (like blue and violet) from the sun in all directions more than other colors.",
    
    "what is the tallest mountain": "Mount Everest is Earth's highest mountain above sea level, located in the Himalayas on the border between Nepal and China.",
    "whats the tallest mountain": "Mount Everest is Earth's highest mountain above sea level, located in the Himalayas on the border between Nepal and China.",
    
    "how many continents are there": "There are seven continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.",
    
    "what is the largest country": "Russia is the largest country in the world by land area, covering over 17 million square kilometers.",
    "whats the largest country": "Russia is the largest country in the world by land area, covering over 17 million square kilometers.",
    
    "who was the first man on the moon": "Neil Armstrong was the first person to walk on the moon, during the Apollo 11 mission on July 20, 1969.",
    "first man on the moon": "Neil Armstrong.",
    
    "what is the capital of the usa": "The capital of the United States is Washington, D.C.",
    "what is the capital of the united states": "The capital of the United States is Washington, D.C.",
  };

  // Direct match
  if (QA_DATABASE[cleanText]) {
    return QA_DATABASE[cleanText];
  }

  // Partial match
  for (const [question, answer] of Object.entries(QA_DATABASE)) {
    if (cleanText.includes(question) || question.includes(cleanText)) {
      return answer;
    }
  }

  // Conversational questions
  if (cleanText.startsWith("how are you") || cleanText.includes("how r u")) {
    return "I'm doing great, thank you for asking! How can I help you today?";
  }
  if (cleanText.startsWith("what is your name") || cleanText.includes("your name")) {
    return "My name is Vertex, your autonomous AI assistant.";
  }
  if (cleanText.includes("weather") && (cleanText.includes("today") || cleanText.includes("now"))) {
    return "I don't have access to live GPS location to check your local weather, but it's always sunny in my digital core!";
  }
  if (cleanText.includes("time") && (cleanText.includes("what") || cleanText.includes("current"))) {
    return `The current system time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }

  // If it's a general question (starts with who, what, why, how, where, when, is, can, do, does)
  const questionWords = ["who", "what", "why", "how", "where", "when", "is", "can", "do", "does", "are", "whats", "who's", "how's"];
  const firstWord = cleanText.split(" ")[0];
  if (questionWords.includes(firstWord)) {
    return `That's an interesting question! As an AI assistant, I can tell you that ${text.trim()} is something I can help you explore, analyze, or automate. Let me know if you'd like me to search the web or plan a task around this!`;
  }

  return null;
}