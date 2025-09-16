import { redis, ensureIndex, INDEX_NAME, HASH_PREFIX } from "./redis.js";
import { env } from "./env.js";
import { float32ToBase64 } from "./vec.js";

function calculateCosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export async function searchSimilar(embedding: Float32Array, k = 3) {
  await ensureIndex();
  const now = Math.floor(Date.now() / 1000);

  try {
    // Get all cached items and calculate similarity manually
    const res: any = await (redis as any).ft.search(INDEX_NAME, "*", {
      RETURN: [
        "$.query",
        "$.response",
        "$.ts",
        "$.ttl",
        "$.category",
        "$.embedding",
      ],
      LIMIT: { from: 0, size: 100 },
    });

    const items = (res?.documents || [])
      .map((d: any) => {
        const cachedEmbedding = d.value?.["$.embedding"];

        if (!cachedEmbedding) {
          return null;
        }

        // Parse embedding if it's a string (Redis sometimes returns arrays as strings)
        let embeddingArray;
        if (typeof cachedEmbedding === "string") {
          try {
            // Try JSON.parse first
            embeddingArray = JSON.parse(cachedEmbedding);
          } catch (e) {
            try {
              // If JSON.parse fails, try parsing as comma-separated numbers
              embeddingArray = cachedEmbedding.split(",").map(Number);
            } catch (e2) {
              return null;
            }
          }
        } else if (Array.isArray(cachedEmbedding)) {
          embeddingArray = cachedEmbedding;
        } else {
          return null;
        }

        if (!Array.isArray(embeddingArray)) {
          return null;
        }

        // Calculate cosine similarity between embeddings
        const similarity = calculateCosineSimilarity(
          embedding,
          new Float32Array(embeddingArray)
        );
        const distance = 1 - similarity; // Convert similarity to distance

        return {
          id: d.id,
          score: distance,
          query: d.value?.["$.query"],
          response: d.value?.["$.response"],
          ts: parseInt(d.value?.["$.ts"] || "0", 10),
          ttl: parseInt(d.value?.["$.ttl"] || "0", 10),
          category: d.value?.["$.category"],
        };
      })
      .filter((it: any) => it && now - it.ts < it.ttl)
      .sort((a: any, b: any) => a.score - b.score) // Sort by distance (lower is better)
      .slice(0, k);

    return items;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function putCache(keyId: string, item: any) {
  await ensureIndex();
  await redis.json.set(`${HASH_PREFIX}${keyId}`, "$", item);
}

export function scoreToSimilarity(distance: number) {
  // For COSINE distance metric:
  // - distance 0.0 = perfect similarity (identical vectors) -> similarity 1.0
  // - distance 1.0 = orthogonal vectors (no similarity) -> similarity 0.0
  // - distance 2.0 = maximum dissimilarity (opposite vectors) -> similarity -1.0 (clamped to 0.0)
  const sim = 1 - distance;
  return Math.max(0, Math.min(1, sim));
}

export function ttlForCategory(category: string) {
  return category === "fresh" ? env.CACHE_TTL_FRESH : env.CACHE_TTL_DEFAULT;
}
