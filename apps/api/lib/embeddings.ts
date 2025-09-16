
import OpenAI from "openai";
import { env } from "./env.js";
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function embed(text: string): Promise<Float32Array> {
  const res = await client.embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: text
  });
  return Float32Array.from(res.data[0].embedding);
}
