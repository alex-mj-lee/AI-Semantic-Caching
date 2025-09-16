export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_EMBEDDING_MODEL:
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  REDIS_URL: process.env.REDIS_URL || "redis://redis:6379",
  CACHE_THRESHOLD: parseFloat(process.env.CACHE_THRESHOLD || "0.7"),
  CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT || "604800", 10),
  CACHE_TTL_FRESH: parseInt(process.env.CACHE_TTL_FRESH || "10800", 10),
};
