# Enhanced Caching Service Architecture

## Overview

This document outlines the improved architecture for the Boardy caching service, addressing the code review feedback regarding time-sensitive query detection and architectural planning.

## Problem Statement

The original implementation had two critical issues:

1. **Naive Time-Sensitive Detection**: Simple keyword-based approach was too basic and prone to false positives/negatives
2. **Insufficient Architecture Planning**: Jumped into implementation without proper design consideration

## Solution Architecture

### 1. Multi-Layered Categorization System

The enhanced system uses a hierarchical approach to classify queries as either "fresh" (time-sensitive) or "evergreen" (stable content):

```
Query Input
    ↓
Layer 1: Temporal Pattern Matching (Highest Confidence)
    ↓ (if no match)
Layer 2: Evergreen Pattern Matching (Highest Confidence)
    ↓ (if no match)
Layer 3: Context-Aware Rules (High Confidence)
    ↓ (if no match)
Layer 4: Domain-Specific Classification (Medium Confidence)
    ↓ (if no match)
Layer 5: Keyword Fallback (Low Confidence)
    ↓ (if no match)
Layer 6: Default to Evergreen (Safety)
```

### 2. Pattern-Based Detection

#### Temporal Patterns

- **Direct Indicators**: "today", "now", "currently", "right now"
- **Relative Time**: "this morning", "tonight", "next week"
- **Time-Sensitive Domains**: weather, news, stocks, sports, traffic
- **Event-Based**: elections, holidays, conferences

#### Evergreen Patterns

- **Educational**: "what is", "define", "explain", "how does"
- **Historical**: "history", "origin", "evolution"
- **Reference**: "documentation", "manual", "specification"
- **General Knowledge**: "why", "because", "compare", "difference"

### 3. Context-Aware Rules

The system analyzes query structure and intent:

```typescript
// Time-sensitive question patterns
timeSensitiveQuestions: [
  /what.*happening.*now/i,
  /what.*going on.*today/i,
  /what.*latest.*news/i,
  /what.*current.*status/i,
];

// Evergreen question patterns
evergreenQuestions: [
  /what.*is.*definition/i,
  /how.*does.*work/i,
  /what.*causes.*to happen/i,
  /why.*does.*occur/i,
];
```

### 4. Domain-Specific Classification

Certain domains have inherent time-sensitivity:

```typescript
domains: {
  weather: { pattern: /\bweather\b/i, defaultCategory: "fresh" },
  news: { pattern: /\bnews\b/i, defaultCategory: "fresh" },
  stocks: { pattern: /\b(stock|price|market|trading)\b/i, defaultCategory: "fresh" },
  education: { pattern: /\b(learn|study|teach|education)\b/i, defaultCategory: "evergreen" },
  history: { pattern: /\b(history|historical|past)\b/i, defaultCategory: "evergreen" },
}
```

## Design Decisions & Trade-offs

### 1. Pattern-Based vs ML-Based Classification

**Decision**: Hybrid approach with pattern-based primary classification

**Rationale**:

- **Speed**: Pattern matching is faster than ML inference
- **Cost**: No additional API calls for classification
- **Reliability**: Deterministic results, no model drift
- **Transparency**: Clear reasoning for each decision

**Trade-offs**:

- ✅ Fast and cost-effective
- ✅ Transparent and debuggable
- ❌ Requires manual pattern maintenance
- ❌ May miss nuanced cases

### 2. Confidence Levels

**Decision**: Three-tier confidence system (high, medium, low)

**Rationale**:

- Enables monitoring and quality metrics
- Allows for different TTL strategies based on confidence
- Provides debugging information
- Enables future ML integration for low-confidence cases

### 3. Default to Evergreen

**Decision**: Default to evergreen when uncertain

**Rationale**:

- Most content is evergreen
- Safer to cache longer than serve stale data
- Reduces false positives for time-sensitive content

### 4. TTL Strategy

**Current Implementation**:

```typescript
function ttlForCategory(category: string) {
  return category === "fresh" ? env.CACHE_TTL_FRESH : env.CACHE_TTL_DEFAULT;
}
```

**Enhanced Strategy** (Future):

```typescript
function ttlForCategory(category: string, confidence: string) {
  if (category === "fresh") {
    return confidence === "high" ? 3 * 3600 : 1 * 3600; // 3h vs 1h
  }
  return confidence === "high" ? 7 * 24 * 3600 : 3 * 24 * 3600; // 7d vs 3d
}
```

## API Enhancements

### 1. Enhanced Response Metadata

```json
{
  "response": "...",
  "metadata": {
    "source": "cache|llm",
    "category": "fresh|evergreen",
    "categorization": {
      "confidence": "high|medium|low",
      "reasoning": "Found 2 temporal indicators: today, weather"
    }
  }
}
```

### 2. Query Analysis Endpoint

New `/analyze` endpoint for debugging and monitoring:

```json
{
  "result": {
    "category": "fresh",
    "confidence": "high",
    "reasoning": "Found temporal indicators"
  },
  "temporalMatches": ["\\btoday\\b", "\\bweather\\b"],
  "evergreenMatches": [],
  "contextAnalysis": {
    "timeSensitive": true,
    "evergreen": false,
    "domain": "weather"
  }
}
```

## Testing Strategy

### 1. Comprehensive Test Suite

- **Time-sensitive queries**: 15 test cases
- **Evergreen queries**: 15 test cases
- **Edge cases**: 8 ambiguous queries
- **False positive prevention**: 8 queries that should be evergreen
- **False negative prevention**: 8 queries that should be fresh

### 2. Confidence Distribution Monitoring

Track confidence levels to identify areas for improvement:

- High confidence: Pattern-based matches
- Medium confidence: Domain-specific rules
- Low confidence: Keyword fallback or defaults

### 3. Performance Testing

- Pattern matching performance
- Memory usage of regex patterns
- API response times with enhanced metadata

## Monitoring & Observability

### 1. Categorization Metrics

- Success rate by confidence level
- False positive/negative rates
- Most common reasoning patterns
- Confidence distribution over time

### 2. Cache Performance

- Hit rate by category
- TTL effectiveness
- Stale data detection

### 3. Query Analysis

- Most common query patterns
- Categorization accuracy by domain
- Edge case identification

## Future Improvements

### 1. ML-Based Fallback

For low-confidence cases, implement LLM-based classification:

```typescript
async function llmClassify(query: string): Promise<CategorizationResult> {
  const prompt = `Classify this query as time-sensitive or evergreen:
  Query: "${query}"
  
  Time-sensitive: news, weather, stocks, sports, current events
  Evergreen: definitions, how-to guides, historical facts, explanations
  
  Respond with: FRESH or EVERGREEN`;

  // Call LLM API
  // Parse response
  // Return with confidence
}
```

### 2. Dynamic Pattern Learning

- Monitor categorization accuracy
- Automatically suggest new patterns
- A/B test pattern effectiveness

### 3. Context-Aware TTL

- Adjust TTL based on confidence
- Domain-specific TTL strategies
- Dynamic TTL based on content type

### 4. Advanced Temporal Detection

- Date/time parsing
- Relative time expressions
- Event-based temporal indicators

## Implementation Status

✅ **Completed**:

- Multi-layered categorization system
- Pattern-based detection
- Context-aware rules
- Domain-specific classification
- Enhanced API responses
- Comprehensive test suite
- Architecture documentation

🔄 **In Progress**:

- Performance optimization
- Monitoring dashboard

📋 **Planned**:

- ML-based fallback for ambiguous cases
- Dynamic pattern learning
- Advanced temporal detection
- Context-aware TTL strategies

## Conclusion

The enhanced architecture addresses the original feedback by:

1. **Sophisticated Detection**: Multi-layered approach with pattern matching, context awareness, and domain-specific rules
2. **Proper Planning**: Comprehensive architecture documentation with clear design decisions and trade-offs
3. **Observability**: Enhanced monitoring and debugging capabilities
4. **Extensibility**: Framework for future ML integration and advanced features

This approach provides a solid foundation for accurate time-sensitive query detection while maintaining performance and cost-effectiveness.
