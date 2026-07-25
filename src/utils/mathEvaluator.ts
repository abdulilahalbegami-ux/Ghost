export function evaluateMathExpression(text: string): string | null {
  let cleanText = text.toLowerCase().trim();

  // Common typo corrections for math phrases
  cleanText = cleanText
    .replace(/\b(wats|whas|wht is|wat is|whats|what's)\b/g, "what is")
    .replace(/\b(calc|calculat|calclate)\b/g, "calculate")
    .replace(/\b(pluss|plse|pluse)\b/g, "+")
    .replace(/\b(minse|minuse|minos)\b/g, "-")
    .replace(/\b(tyms|tymes|multipliedd|multipled)\b/g, "*")
    .replace(/\b(divded|dived|dividedd)\b/g, "/")
    .replace(/\b(sqar|squar|skware)\b/g, "square")
    .replace(/\b(root of|root)\b/g, "root");

  let expression = cleanText
    .replace(/what's/g, "")
    .replace(/whats/g, "")
    .replace(/what is/g, "")
    .replace(/calculate/g, "")
    .replace(/solve/g, "")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times/g, "*")
    .replace(/multiplied by/g, "*")
    .replace(/divided by/g, "/")
    .replace(/over/g, "/")
    .replace(/squared/g, "^2")
    .replace(/cubed/g, "^3")
    .replace(/=/g, "")
    .replace(/\?/g, "")
    .trim();

  // Check percentage expressions e.g., "15% of 200" or "20 percent of 150"
  const percentMatch = expression.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent|percnt)\s*of\s*(\d+(?:\.\d+)?)$/);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const ans = (rate / 100) * total;
    return `${rate}% of ${total} = ${ans}`;
  }

  // Square root matching e.g., "sqrt(16)" or "square root of 144"
  const sqrtMatch = expression.match(/^(?:sqrt|square root of|square root|sqr root of|root of)\s*(\d+(?:\.\d+)?)$/);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    return `√${val} = ${Math.sqrt(val)}`;
  }

  // Convert ^ to exponentiation operator ** for safe evaluation
  let mathExpr = expression.replace(/\^/g, "**");

  // Validate math string to only contain safe math symbols
  if (/^[0-9\+\-\*\/\.\(\)\s\*\*\%\,\=\ba-z]+$/.test(mathExpr)) {
    // Handle trigonometric functions if present
    mathExpr = mathExpr
      .replace(/sin\((\d+(?:\.\d+)?)\)/g, (_, n) => `${Math.sin(parseFloat(n))}`)
      .replace(/cos\((\d+(?:\.\d+)?)\)/g, (_, n) => `${Math.cos(parseFloat(n))}`)
      .replace(/tan\((\d+(?:\.\d+)?)\)/g, (_, n) => `${Math.tan(parseFloat(n))}`);

    // Match clean binary expression e.g. "20 + 20", "15 * 8", "100 / 4", "2^10"
    const binaryMatch = mathExpr.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/]|\*\*)\s*(\d+(?:\.\d+)?)$/);
    if (binaryMatch) {
      const num1 = parseFloat(binaryMatch[1]);
      const op = binaryMatch[2];
      const num2 = parseFloat(binaryMatch[3]);

      let res: number;
      switch (op) {
        case "+":
          res = num1 + num2;
          break;
        case "-":
          res = num1 - num2;
          break;
        case "*":
          res = num1 * num2;
          break;
        case "/":
          if (num2 === 0) return "Error: Division by zero is undefined.";
          res = num1 / num2;
          break;
        case "**":
          res = Math.pow(num1, num2);
          break;
        default:
          return null;
      }
      return `${expression} = ${res}`;
    }
  }

  return null;
}