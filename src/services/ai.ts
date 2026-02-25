import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

// Initialize Gemini
// Note: API Key is injected via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function identifyObject(
  imageData: string,
  categories: Category[],
  manualCategory?: Category
): Promise<{ categoryName: string; attributes: Record<string, string> }> {
  const model = "gemini-2.0-flash-exp";

  const categoryNames = categories.map((c) => c.name).join(", ");
  
  let prompt = `Identify the object in the image.`;
  
  if (manualCategory) {
    prompt += ` The user has identified this as a "${manualCategory.name}". Extract the following attributes: ${manualCategory.attributes.join(", ")}.`;
  } else {
    prompt += ` Classify it into one of the following categories: ${categoryNames}. If it doesn't fit well, suggest a new category name. Then, extract attributes relevant to that category.`;
  }

  // Construct the schema dynamically based on the request
  // We want a structured output: { categoryName: string, attributes: { key: value } }
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: imageData.split(",")[1] } },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categoryName: { type: Type.STRING },
          attributes: {
            type: Type.OBJECT,
            description: "Key-value pairs of attributes",
            // We can't strictly define properties here because they are dynamic, 
            // but we can ask for an object. 
            // However, for strict schema validation, Gemini prefers known properties.
            // Since attributes are dynamic, we might need to be a bit flexible or use a simpler schema
            // and parse the result.
            // Let's try to define it as an object with string values.
          },
        },
        required: ["categoryName", "attributes"],
      },
    },
  });

  let text = response.text || "{}";
  // Remove markdown code blocks if present
  text = text.replace(/```json\n?|\n?```/g, "").trim();
  
  const result = JSON.parse(text);
  return result;
}
