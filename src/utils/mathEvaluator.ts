export function evaluateMathExpression(text: string): string | null {
  const cleanText = text.toLowerCase().trim();
  
  let expression = cleanText
    .replace(/what's/g, "")
    .replace(/whats/g, "")
    .replace(/what is/g, "")
    .replace(/calculate/g, "")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times/g, "*")
    .replace(/multiplied by/g, "*")
    .replace(/divided by/g, "/")
    .replace(/=/g, "")
    .replace(/\?/g, "")
    .trim();

  // Match simple binary operations: number operator number (e.g., "20 + 20" or "15 * 3")
  const match = expression.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)$/);
  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);
    
    let result: number;
    switch (op) {
      case "+":
        result = num1 + num2;
        break;
      case "-":
        result = num1 - num2;
        break;
      case "*":
        result = num1 * num2;
        break;
      case "/":
        if (num2 === 0) return "Division by zero is undefined.";
        result = num1 / num2;
        break;
      default:
        return null;
    }
    return `${result}`;
  }
  return null;
}