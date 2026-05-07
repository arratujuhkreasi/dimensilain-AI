import { ChatOpenAI } from "@langchain/openai";

let llm: ChatOpenAI | null = null;
let llmStructured: ChatOpenAI | null = null;

export function getLlm() {
  if (!llm) {
    llm = new ChatOpenAI({
      modelName: process.env.CEREBRAS_MODEL || "llama-3.1-70b",
      openAIApiKey: process.env.CEREBRAS_API_KEY,
      configuration: {
        baseURL: process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1",
      },
      temperature: 0.8,
      maxTokens: 4096,
      streaming: true,
    });
  }

  return llm;
}

export function getLlmStructured() {
  if (!llmStructured) {
    llmStructured = new ChatOpenAI({
      modelName: process.env.CEREBRAS_MODEL || "llama-3.1-70b",
      openAIApiKey: process.env.CEREBRAS_API_KEY,
      configuration: {
        baseURL: process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1",
      },
      temperature: 0.6,
      maxTokens: 8192,
    });
  }

  return llmStructured;
}
