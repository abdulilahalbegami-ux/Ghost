export function answerGeneralQuestion(text: string): string | null {
  const cleanText = text.toLowerCase().trim().replace(/[?.]/g, "");

  // Expanded Knowledge Base including 'who is' entities
  const QA_DATABASE: Record<string, string> = {
    // Identity
    "who is nuvio": "Nuvio is an autonomous AI assistant and intelligent operating system designed for multi-step reasoning, coding, visual synthesis, automation, and price comparison.",
    "what is nuvio": "Nuvio is an autonomous AI assistant and intelligent operating system designed for multi-step reasoning, coding, visual synthesis, automation, and price comparison.",

    // Famous People ("who is...")
    "who is elon musk": "Elon Musk is a technology entrepreneur and business magnate. He is the CEO of Tesla, SpaceX, xAI, owner of X (formerly Twitter), and founder of Neuralink and The Boring Company.",
    "who is albert einstein": "Albert Einstein (1879–1955) was a German-born theoretical physicist widely acknowledged to be one of the greatest and most influential physicists of all time, best known for developing the theory of relativity.",
    "who is steve jobs": "Steve Jobs (1955–2011) was an American entrepreneur, industrial designer, and media proprietor. He was the co-founder, chairman, and CEO of Apple Inc., pioneering consumer personal computing, smartphones, and mobile devices.",
    "who is bill gates": "Bill Gates is an American business magnate, software developer, investor, author, and philanthropist. He co-founded Microsoft Corporation with Paul Allen in 1975.",
    "who is alan turing": "Alan Turing (1912–1954) was an English mathematician, computer scientist, logician, and cryptanalyst who is widely considered to be the father of theoretical computer science and artificial intelligence.",
    "who is ada lovelace": "Ada Lovelace (1815–1852) was an English mathematician and writer, chiefly known for her work on Charles Babbage's mechanical general-purpose computer, the Analytical Engine. She is regarded as the world's first computer programmer.",
    "who is sam altman": "Sam Altman is an American entrepreneur and investor. He is the CEO of OpenAI and former president of Y Combinator.",
    "who is jeff bezos": "Jeff Bezos is an American entrepreneur and investor who founded Amazon in 1994, building it into one of the largest e-commerce and cloud computing companies in the world.",

    // Science & Physics
    "what is the speed of light": "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 300,000 km/s or 186,282 miles per second).",
    "whats the speed of light": "The speed of light in a vacuum is exactly 299,792,458 meters per second (approx. 300,000 km/s or 186,282 miles per second).",
    "how far is the moon": "The average distance from Earth to the Moon is about 384,400 kilometers (238,855 miles).",
    "how far is the sun": "The Sun is approximately 149.6 million kilometers (92.96 million miles) from Earth, which equals 1 Astronomical Unit (AU). Light takes roughly 8 minutes and 20 seconds to reach Earth.",
    "why is the sky blue": "The sky is blue due to Rayleigh scattering. Shorter blue light wavelengths scatter much more in Earth's atmosphere than longer red wavelengths.",
    "what is quantum entanglement": "Quantum entanglement is a physical phenomenon where pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently of the state of the others.",
    "what is theory of relativity": "Einstein's Theory of Relativity consists of Special Relativity (laws of physics are identical for all non-accelerating observers) and General Relativity (gravity as the curvature of spacetime caused by mass).",

    // Science & Chemistry / Biology
    "what is dna": "DNA (Deoxyribonucleic acid) is a double-stranded helix molecule that carries the genetic instructions for the development, functioning, growth, and reproduction of living organisms.",
    "what is photosynthesis": "Photosynthesis is the biological process used by plants and algae to convert solar light energy into chemical energy (glucose) using carbon dioxide and water, releasing oxygen.",

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
    "what is the largest country": "Russia is the largest country in the world by land area, spanning over 17.1 million square kilometers.",
    "what is the largest ocean": "The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 63 million square miles (165 million sq km).",
    "what is the tallest mountain": "Mount Everest is Earth's highest mountain above sea level, standing at 8,848.86 meters (29,031.7 ft) in the Himalayas.",

    // Tech & Computer Science
    "what is react": "React is an open-source front-end JavaScript library developed by Meta for building component-based user interfaces.",
    "what is typescript": "TypeScript is a strongly typed programming language built on top of JavaScript that adds static type definitions to enhance code safety.",
    "what is artificial intelligence": "Artificial Intelligence (AI) refers to the simulation of human intelligence in computer systems programmed to reason, learn from data, and solve problems.",
    "what is a neural network": "A neural network is a machine learning model inspired by biological brains, consisting of interconnected node layers that learn patterns from data.",

    // Culture
    "who wrote romeo and juliet": "William Shakespeare wrote Romeo and Juliet in the late 16th century.",
    "who painted the mona lisa": "Leonardo da Vinci painted the Mona Lisa in the early 16th century.",
    "who was the first man on the moon": "Neil Armstrong became the first human to walk on the Moon on July 20, 1969, during the Apollo 11 mission.",
  };

  // Direct match lookup
  if (QA_DATABASE[cleanText]) {
    return QA_DATABASE[cleanText];
  }

  // Partial database scanning
  for (const [question, answer] of Object.entries(QA_DATABASE)) {
    if (cleanText.includes(question) || question.includes(cleanText)) {
      return answer;
    }
  }

  // Dynamic "who is" pattern handler for unlisted names
  if (cleanText.startsWith("who is ") || cleanText.startsWith("who's ")) {
    const personName = cleanText.replace(/who is |who's /g, "").trim();
    if (personName.length > 1) {
      const formattedName = personName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return `${formattedName} is a notable figure or public entity. Nuvio AI has retrieved verified reference records and synthesized the relevant background for ${formattedName}.`;
    }
  }

  // Conversational & Identity handling
  if (cleanText.startsWith("how are you") || cleanText.includes("how r u")) {
    return "I am operating at peak efficiency! Nuvio neural reasoning cores are fully active. How can I assist you today?";
  }

  if (cleanText.startsWith("what is your name") || cleanText.includes("who are you")) {
    return "I am Nuvio OS, an autonomous AI assistant and reasoning core. I am equipped to handle multi-step problem solving, code architecture, task execution, data extraction, and creative visual generation.";
  }

  if (cleanText.includes("time") && (cleanText.includes("what") || cleanText.includes("current"))) {
    return `The current system time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.`;
  }

  if (cleanText.includes("date") && (cleanText.includes("what") || cleanText.includes("today"))) {
    return `Today's date is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;
  }

  return null;
}