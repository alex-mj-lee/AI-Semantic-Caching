import { createClient } from "redis";
import { env } from "./env.js";

export const redis = createClient({ url: env.REDIS_URL });
redis.on("error", (err) => console.error("Redis error", err));

let connected = false;
export async function ensureRedis() {
  if (!connected) {
    await redis.connect();
    connected = true;
  }
}

export const INDEX_NAME = "idx:cache";
export const HASH_PREFIX = "cache:";

export async function ensureIndex() {
  await ensureRedis();
  try {
    // Use sendCommand to send raw Redis commands
    await redis.sendCommand([
      "FT.CREATE",
      INDEX_NAME,
      "ON",
      "JSON",
      "PREFIX",
      "1",
      HASH_PREFIX,
      "SCHEMA",
      "$.query",
      "AS",
      "query",
      "TEXT",
      "$.response",
      "AS",
      "response",
      "TEXT",
      "$.ts",
      "AS",
      "ts",
      "NUMERIC",
      "$.ttl",
      "AS",
      "ttl",
      "NUMERIC",
      "$.category",
      "AS",
      "category",
      "TAG",
      "$.embedding",
      "AS",
      "embedding",
      "VECTOR",
      "HNSW",
      "6",
      "TYPE",
      "FLOAT32",
      "DIM",
      "1536",
      "DISTANCE_METRIC",
      "COSINE",
    ]);
  } catch (e: any) {
    if (!String(e?.message || "").includes("Index already exists")) {
      console.warn("ft.create:", e?.message || e);
    }
  }
}
