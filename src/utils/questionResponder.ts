/**
 * Utility for direct question answering with knowledge retrieval
 */

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ["iron man", "tony stark", "ironman"],
    answer:
      "Iron Man (Tony Stark) is a fictional superhero appearing in Marvel Comics and the Marvel Cinematic Universe (MCU), created by Stan Lee, Larry Lieber, Don Heck, and Jack Kirby. Played by Robert Downey Jr. in the MCU, Tony Stark is a genius billionaire inventor and philanthropist who constructs a high-tech suit of armor to fight crime and protect the universe as an Avenger.",
  },
  {
    keywords: ["marvel", "mcu"],
    answer:
      "Marvel Comics (and the Marvel Cinematic Universe) is a premier entertainment franchise featuring iconic superheroes such as Iron Man, Spider-Man, Captain America, Thor, Black Panther, and the Avengers, created by legendary authors including Stan Lee and Jack Kirby.",
  },
  {
    keywords: ["spider-man", "spiderman", "peter parker"],
    answer:
      "Spider-Man (Peter Parker) is a Marvel Comics superhero created by Stan Lee and Steve Ditko. Gaining spider-like abilities after a radioactive spider bite, Peter protects New York City guided by the principle: 'With great power comes great responsibility.'",
  },
  {
    keywords: ["captain america", "steve rogers"],
    answer:
      "Captain America (Steve Rogers) is a Marvel Comics superhero created by Joe Simon and Jack Kirby. Enhanced to the peak of human perfection by an experimental Super-Soldier Serum, he wields an indestructible vibranium shield and leads the Avengers.",
  },
  {
    keywords: ["thor", "god of thunder"],
    answer:
      "Thor Odinson is the Marvel superhero based on the Norse mythological deity. Wielding the enchanted hammer Mjolnir (and later Stormbreaker), Thor protects Asgard and Earth as a core member of the Avengers.",
  },
  {
    keywords: ["batman", "bruce wayne"],
    answer:
      "Batman (Bruce Wayne) is a DC Comics superhero created by Bob Kane and Bill Finger. A billionaire industrialist and martial artist, he uses high-tech gadgetry and intellect to fight crime in Gotham City.",
  },
  {
    keywords: ["superman", "clark kent"],
    answer:
      "Superman (Clark Kent / Kal-El) is a DC Comics superhero created by Jerry Siegel and Joe Shuster. Born on Krypton and raised in Kansas, he possesses superhuman strength, flight, heat vision, and invulnerability under Earth's yellow sun.",
  },
  {
    keywords: ["capital of france", "paris"],
    answer: "The capital of France is Paris, famous for its culture, art, architecture, and the iconic Eiffel Tower.",
  },
  {
    keywords: ["speed of light"],
    answer: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 186,282 miles per second).",
  },
  {
    keywords: ["who made you", "who created you", "who built you"],
    answer: "I am Nuvio, an autonomous AI system designed to assist with reasoning, automation, coding, and problem solving.",
  }
];

/**
 * Strips common conversational filler prefixes from the user input.
 */
function cleanQuery(text: string): string {
  let cleaned = text.toLowerCase().trim();

  // Remove common conversational lead-ins
  cleaned = cleaned.replace(/^(no|hey|hi|hello|so|well|actually|please|tell me|can you tell me|do you know|i want to know)\s+/i, "");
  cleaned = cleaned.replace(/^(who is|what is|where is|when was|why is|how is)\s+/i, "");
  
  return cleaned.trim();
}

/**
 * Evaluates general question inputs against knowledge base entries.
 */
export function answerGeneralQuestion(userText: string): string | null {
  const originalLower = userText.toLowerCase().trim();
  const cleaned = cleanQuery(userText);

  for (const entry of KNOWLEDGE_BASE) {
    const matched = entry.keywords.some(
      (keyword) =>
        originalLower.includes(keyword) ||
        cleaned.includes(keyword)
    );

    if (matched) {
      return entry.answer;
    }
  }

  return null;
}