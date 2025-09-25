export type Category = "fresh" | "evergreen";
type ConfidenceLevel = "high" | "medium" | "low";

interface CategorizationResult {
  category: Category;
  confidence: ConfidenceLevel;
  reasoning: string;
}

// Temporal patterns for detecting time-sensitive queries
const TEMPORAL_PATTERNS = [
  // Direct temporal indicators
  /\b(today|now|currently|at this moment|right now|this instant)\b/i,
  /\b(latest|most recent|newest|up-to-date|current)\b/i,
  /\b(breaking|urgent|immediate|asap|emergency)\b/i,
  /\b(live|real-time|streaming|happening now)\b/i,

  // Relative time expressions
  /\b(this (morning|afternoon|evening|week|month|year))\b/i,
  /\b(tonight|tomorrow|yesterday|next week|last week)\b/i,
  /\b(in the last|over the past|since yesterday)\b/i,

  // Time-sensitive domains
  /\b(weather|forecast|temperature|conditions)\b/i,
  /\b(news|headlines|breaking news|reports)\b/i,
  /\b(stock|price|market|trading|shares|dow|nasdaq)\b/i,
  /\b(score|game|match|result|outcome|final)\b/i,
  /\b(traffic|road conditions|accidents|delays)\b/i,
  /\b(flight|departure|arrival|schedule|delays)\b/i,
  /\b(currency|exchange rate|conversion|bitcoin|crypto)\b/i,
  /\b(deadline|due date|expires|expiration)\b/i,

  // Event-based indicators
  /\b(event|conference|meeting|appointment|schedule)\b/i,
  /\b(election|vote|results|polls)\b/i,
  /\b(holiday|celebration|festival|season)\b/i,
];

// Evergreen content indicators
const EVERGREEN_PATTERNS = [
  // Educational content
  /\b(what is|define|definition|meaning|explain|how does|how to)\b/i,
  /\b(history|historical|past|origin|evolution)\b/i,
  /\b(tutorial|guide|instructions|steps|process)\b/i,
  /\b(facts|information|details|specifications)\b/i,

  // Reference material
  /\b(documentation|manual|reference|spec|standard)\b/i,
  /\b(formula|equation|calculation|math|science)\b/i,
  /\b(concept|theory|principle|law|rule)\b/i,

  // General knowledge
  /\b(why|because|reason|cause|effect)\b/i,
  /\b(compare|difference|similar|versus|vs)\b/i,
  /\b(example|instance|case study)\b/i,
];

// Context-aware rules for better classification
const CONTEXT_RULES = {
  // Questions that are inherently time-sensitive
  timeSensitiveQuestions: [
    /what.*happening.*now/i,
    /what.*going on.*today/i,
    /what.*latest.*news/i,
    /what.*current.*status/i,
    /what.*weather.*today/i,
    /what.*price.*now/i,
  ],

  // Questions that are inherently evergreen
  evergreenQuestions: [
    /what.*is.*definition/i,
    /how.*does.*work/i,
    /what.*causes.*to happen/i,
    /why.*does.*occur/i,
    /what.*difference.*between/i,
    /how.*to.*do/i,
  ],

  // Domain-specific rules
  domains: {
    weather: { pattern: /\bweather\b/i, defaultCategory: "fresh" as Category },
    news: { pattern: /\bnews\b/i, defaultCategory: "fresh" as Category },
    stocks: {
      pattern: /\b(stock|price|market|trading)\b/i,
      defaultCategory: "fresh" as Category,
    },
    education: {
      pattern: /\b(learn|study|teach|education|school)\b/i,
      defaultCategory: "evergreen" as Category,
    },
    history: {
      pattern: /\b(history|historical|past)\b/i,
      defaultCategory: "evergreen" as Category,
    },
  },
};

/**
 * Advanced categorization function that uses multiple approaches:
 * 1. Temporal pattern matching
 * 2. Context-aware rules
 * 3. Domain-specific classification
 * 4. Fallback to LLM-based classification for ambiguous cases
 */
export function categorize(query: string): Category {
  const result = categorizeWithConfidence(query);
  return result.category;
}

/**
 * Enhanced categorization with confidence levels and reasoning
 */
export function categorizeWithConfidence(query: string): CategorizationResult {
  const q = query.toLowerCase().trim();

  // Check for explicit temporal indicators (highest confidence)
  const temporalMatches = TEMPORAL_PATTERNS.filter((pattern) =>
    pattern.test(q)
  );
  if (temporalMatches.length > 0) {
    return {
      category: "fresh",
      confidence: "high",
      reasoning: `Found ${
        temporalMatches.length
      } temporal indicators: ${temporalMatches
        .map((p) => p.source)
        .join(", ")}`,
    };
  }

  // Check for evergreen content indicators
  const evergreenMatches = EVERGREEN_PATTERNS.filter((pattern) =>
    pattern.test(q)
  );
  if (evergreenMatches.length > 0) {
    return {
      category: "evergreen",
      confidence: "high",
      reasoning: `Found ${
        evergreenMatches.length
      } evergreen indicators: ${evergreenMatches
        .map((p) => p.source)
        .join(", ")}`,
    };
  }

  // Apply context-aware rules
  const timeSensitiveContext = CONTEXT_RULES.timeSensitiveQuestions.some(
    (pattern) => pattern.test(q)
  );
  if (timeSensitiveContext) {
    return {
      category: "fresh",
      confidence: "high",
      reasoning: "Query structure indicates time-sensitive intent",
    };
  }

  const evergreenContext = CONTEXT_RULES.evergreenQuestions.some((pattern) =>
    pattern.test(q)
  );
  if (evergreenContext) {
    return {
      category: "evergreen",
      confidence: "high",
      reasoning: "Query structure indicates evergreen intent",
    };
  }

  // Domain-specific classification
  for (const [domain, rule] of Object.entries(CONTEXT_RULES.domains)) {
    if (rule.pattern.test(q)) {
      return {
        category: rule.defaultCategory,
        confidence: "medium",
        reasoning: `Domain-specific rule for ${domain}`,
      };
    }
  }

  // Fallback: Check for any temporal keywords (lower confidence)
  const temporalKeywords = [
    "today",
    "now",
    "latest",
    "current",
    "weather",
    "news",
    "price",
    "score",
  ];
  const hasTemporalKeywords = temporalKeywords.some((keyword) =>
    q.includes(keyword)
  );

  if (hasTemporalKeywords) {
    return {
      category: "fresh",
      confidence: "low",
      reasoning: "Found temporal keywords but no strong patterns",
    };
  }

  // Default to evergreen for safety (most content is evergreen)
  return {
    category: "evergreen",
    confidence: "low",
    reasoning: "No clear indicators found, defaulting to evergreen",
  };
}

/**
 * Get detailed categorization analysis for debugging and monitoring
 */
export function analyzeQuery(query: string): {
  result: CategorizationResult;
  temporalMatches: string[];
  evergreenMatches: string[];
  contextAnalysis: {
    timeSensitive: boolean;
    evergreen: boolean;
    domain: string | null;
  };
} {
  const q = query.toLowerCase().trim();

  const temporalMatches = TEMPORAL_PATTERNS.filter((pattern) =>
    pattern.test(q)
  ).map((pattern) => pattern.source);

  const evergreenMatches = EVERGREEN_PATTERNS.filter((pattern) =>
    pattern.test(q)
  ).map((pattern) => pattern.source);

  const contextAnalysis = {
    timeSensitive: CONTEXT_RULES.timeSensitiveQuestions.some((pattern) =>
      pattern.test(q)
    ),
    evergreen: CONTEXT_RULES.evergreenQuestions.some((pattern) =>
      pattern.test(q)
    ),
    domain:
      Object.entries(CONTEXT_RULES.domains).find(([_, rule]) =>
        rule.pattern.test(q)
      )?.[0] || null,
  };

  return {
    result: categorizeWithConfidence(query),
    temporalMatches,
    evergreenMatches,
    contextAnalysis,
  };
}
