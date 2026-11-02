export type ModelProvider = "muse" | "agnes" | "gemini" | "deepseek" | "kimi" | "openrouter";

export interface ModelDef {
  id: string; // OpenRouter-style id
  name: string;
  provider: ModelProvider;
  endpoint: string;
  freeTier: boolean;
  contextWindow: number;
  capabilities: string[];
  tags: string[];
  icon: string;
}

export const MODELS: ModelDef[] = [
  {
    id: "muse-spark-1.2-free",
    name: "Muse Spark 1.2 (Free)",
    provider: "muse",
    endpoint: "https://muse-api.example.com/v1/chat/completions",
    freeTier: true,
    contextWindow: 32500,
    capabilities: ["chat", "code", "reasoning"],
    tags: ["free", "fast", "multilingual"],
    icon: "💡",
  },
  {
    id: "agnes-7b-instruct",
    name: "Agnes 7B Instruct",
    provider: "agnes",
    endpoint: "https://agnes-api.example.com/v1/chat/completions",
    freeTier: true,
    contextWindow: 8192,
    capabilities: ["chat", "instruction"],
    tags: ["free", "lightweight", "indonesian"],
    icon: "🤖",
  },
  {
    id: "gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    provider: "gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    freeTier: true,
    contextWindow: 1048576,
    capabilities: ["multimodal", "long-context", "code"],
    tags: ["free", "google", "multimodal"],
    icon: "✨",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    endpoint: "https://api.deepseek.com/chat/completions",
    freeTier: true,
    contextWindow: 64000,
    capabilities: ["chat", "code", "reasoning", "math"],
    tags: ["free", "coder", "reasoning"],
    icon: "🐋",
  },
  {
    id: "kissing-kimi-k2",
    name: "Kimi K2 (Moonshot)",
    provider: "kimi",
    endpoint: "https://api.moonshot.cn/v1/chat/completions",
    freeTier: true,
    contextWindow: 256000,
    capabilities: ["long-context", "chat", "code"],
    tags: ["free", "long-context", "chinese"],
    icon: "🌙",
  },
  {
    id: "openrouter/anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (OpenRouter)",
    provider: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    freeTier: false,
    contextWindow: 200000,
    capabilities: ["chat", "code", "vision"],
    tags: ["paid", "top-tier"],
    icon: "🧠",
  },
];

export function getModel(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id || m.id.includes(id));
}

export function searchModels(query: string): ModelDef[] {
  const q = query.toLowerCase();
  return MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.tags.some((t) => t.includes(q)) ||
      m.capabilities.some((c) => c.includes(q)) ||
      m.provider.includes(q)
  );
}
