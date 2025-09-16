
import OpenAI from "openai";
import { env } from "./env.js";
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function answer(query: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: "You are a helpful, concise assistant. Keep answers short but accurate." },
      { role: "user", content: query }
    ],
    temperature: 0.2
  });
  return res.choices[0]?.message?.content || "Sorry, I have no answer.";
}
