# Boardy — Semantic Caching Services

A semantic caching system that reduces LLM API costs by intelligently caching and retrieving similar queries using vector embeddings.

## Architecture

**Microservices Design:**

The system follows a microservices architecture to ensure scalability, maintainability, and clear separation of concerns:

- **apps/web** — Next.js frontend with simple UI

  - Provides a clean interface for users to interact with the caching system
  - Built with React and TypeScript for type safety and modern development experience
  - Handles user input and displays cached results with visual indicators

- **apps/api** — Express.js API with semantic caching logic

  - Core business logic for query processing and cache management
  - Implements the semantic similarity matching algorithm
  - Handles OpenAI API integration for both embeddings and LLM responses
  - Manages cache TTL and invalidation strategies

- **Redis Stack** — Vector database for similarity search
  - Stores vector embeddings with RedisJSON for efficient similarity search
  - Provides sub-millisecond query performance for cache lookups
  - Enables horizontal scaling and high availability

**Design Decisions:**

- **Microservices over Monolith**: Allows independent scaling and deployment of frontend and backend services
- **Redis over PostgreSQL**: Vector similarity search performance and built-in JSON support
- **Express.js over Fastify**: Simpler setup and extensive middleware ecosystem
- **Next.js over React SPA**: Better SEO and performance with server-side rendering

## Semantic Similarity Approach

**Embedding Model Selection:** `text-embedding-3-small`

The choice of embedding model is critical for both performance and cost-effectiveness:

- **Why this model:** Cost-effective, fast, and sufficient for semantic similarity

  - 10x cheaper than text-embedding-3-large while maintaining quality
  - Optimized for speed with minimal latency impact
  - Proven performance on semantic similarity tasks
  - Reference: https://platform.openai.com/docs/guides/embeddings#what-are-embeddings

- **Technical specifications:**
  - **Dimensions:** 1536 (compact but expressive enough for most use cases)
  - **Performance:** ~$0.02 per 1M tokens (vs $0.13 for text-embedding-3-large)
  - **Context window:** 8192 tokens (handles most query lengths)

**Similarity Matching Strategy:**

- **Cosine Similarity Threshold:** 0.70 (configurable)

  - Chosen through empirical testing to balance cache hit rate vs accuracy
  - Values above 0.70 indicate high semantic similarity
  - Lower thresholds increase cache hits but risk serving irrelevant results

- **Content-Aware TTL Strategy:**
  - **Fresh content** (3h TTL): Time-sensitive queries that become stale quickly
  - **Evergreen content** (7 days TTL): Stable information that remains relevant longer
  - **Dynamic categorization** based on query analysis

**Query Categorization Logic:**

The system uses a hybrid approach combining keyword detection and semantic analysis:

- **Fresh content indicators:**

  - Temporal keywords: "today", "current", "latest", "now"
  - Domain-specific: weather, news, stock prices, schedules, events
  - Real-time data: sports scores, traffic, live updates

- **Evergreen content indicators:**

  - Educational queries: definitions, explanations, tutorials, how-to guides
  - Historical information: facts, biographies, scientific concepts
  - Reference material: documentation, specifications, standards

- **Fallback mechanism:** Unclear queries default to fresh content TTL for safety

## Setup & Running

1. **Environment Setup:**

   ```bash
   # Create .env file with:
   OPENAI_API_KEY=your_key_here
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   OPENAI_CHAT_MODEL=gpt-4o-mini
   REDIS_URL=redis://redis:6379
   CACHE_THRESHOLD=0.70
   CACHE_TTL_DEFAULT=604800
   CACHE_TTL_FRESH=10800
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

2. **Run Services:**

   ```bash
   docker compose up --build
   ```

3. **Access:**
   - Web UI: http://localhost:3000
   - API: http://localhost:4000
   - Redis UI: http://localhost:8001

## Tradeoffs & Optimizations

**Current Limitations:**

- Simple keyword-based categorization
- Basic vector search (no KNN optimization yet)
- No cache invalidation strategies

**Potential Optimizations:**

- **Hybrid Search:** Combine semantic + keyword matching
- **Cache Warming:** Pre-populate common queries
- **Dynamic TTL:** ML-based expiration prediction
- **Compression:** Reduce embedding storage overhead
- **Clustering:** Group similar queries for batch processing

# AI-Semantic-Caching
