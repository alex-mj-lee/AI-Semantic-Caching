import express, { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import {
  embed,
  answer,
  categorize,
  putCache,
  searchSimilar,
  scoreToSimilarity,
  ttlForCategory,
  env,
} from "../lib/index.js";

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "boardy-caching-api",
  });
});

const Body = z.object({
  query: z.string().min(1),
  forceRefresh: z.boolean().optional().default(false),
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    const { query, forceRefresh } = Body.parse(req.body);
    const category = categorize(query);
    const e = await embed(query);
    if (!forceRefresh) {
      const matches = await searchSimilar(e, 3);
      if (matches.length > 0) {
        const best = matches[0];

        const sim = scoreToSimilarity(best.score);

        if (sim >= env.CACHE_THRESHOLD) {
          return res.json({
            response: best.response,
            metadata: {
              source: "cache",
              matchScore: sim,
              matchedQuery: best.query,
              category,
            },
          });
        }
      }
    }

    const llmResp = await answer(query);
    const id = crypto.createHash("sha1").update(query).digest("hex");
    const ttl = ttlForCategory(category);
    await putCache(id, {
      query,
      response: llmResp,
      ts: Math.floor(Date.now() / 1000),
      ttl,
      category,
      embedding: Array.from(e),
    });

    res.json({
      response: llmResp,
      metadata: {
        source: "llm",
        category,
        threshold: env.CACHE_THRESHOLD,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: String(e?.message || e) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
