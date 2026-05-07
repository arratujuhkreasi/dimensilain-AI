import { ChatOpenAICompletions } from "@langchain/openai";

let llm: ChatOpenAICompletions | null = null;
let llmStructured: ChatOpenAICompletions | null = null;

export function getLlm() {
  if (!llm) {
    const config = getCerebrasConfig();

    llm = new ChatOpenAICompletions({
      model: config.model,
      modelName: config.model,
      apiKey: config.apiKey,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL,
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
    const config = getCerebrasConfig();

    llmStructured = new ChatOpenAICompletions({
      model: config.model,
      modelName: config.model,
      apiKey: config.apiKey,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL,
      },
      temperature: 0.6,
      maxTokens: 4096,
    });
  }

  return llmStructured;
}

function getCerebrasConfig() {
  const apiKey = process.env.CEREBRAS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "CEREBRAS_API_KEY belum terpasang. Isi environment variable Cerebras di Vercel dan restart deployment."
    );
  }

  return {
    apiKey,
    baseURL: process.env.CEREBRAS_BASE_URL?.trim() || "https://api.cerebras.ai/v1",
    model: process.env.CEREBRAS_MODEL?.trim() || "llama3.1-8b",
  };
}
