import ollama from "ollama";

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
}

export async function sendToOllama(
  prompt: string,
  model: string = process.env.OLLAMA_MODEL || "llama2"
): Promise<string | null> {
  try {
    const response = (await ollama.chat({
      model,
      messages: [{ role: "user", content: prompt }],
    })) as OllamaChatResponse;

    return response?.message?.content ?? null;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Erro ao falar com Ollama:", errorMessage);
    return null;
  }
}
