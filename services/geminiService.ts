import { GoogleGenAI } from "@google/genai";
import { Format } from '../types';
import { BINARY_FORMATS } from "../constants";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Please set it to use the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const convertText = async (
  inputText: string,
  inputFormat: Format,
  outputFormat: Format
): Promise<string> => {
  if (!process.env.API_KEY) {
      throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }

  const isBinary = BINARY_FORMATS.includes(outputFormat);

  const prompt = `
You are an expert document format converter, designed to emulate the functionality of the command-line tool 'pandoc'. 
Your task is to convert the provided text from ${inputFormat} to ${outputFormat}.

${isBinary 
  ? `The output format, ${outputFormat}, is a binary format. You must respond with ONLY the base64 encoded string of the final file. Do not include any other text, explanations, or markdown fences.`
  : `It is crucial that you only return the converted text. Do not include any additional explanations, introductions, conversational filler, or markdown code block fences (e.g. \`\`\`) in your response unless it is part of the original content's syntax for the target format.`
}

Your output must be pure, converted content.

---

INPUT TEXT (${inputFormat}):
${inputText}

---

CONVERTED TEXT (${outputFormat}):
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to convert the document. Please check your API key and network connection.");
  }
};
