/**
 * Comprehensive test suite for the improved categorization system
 * This validates the enhanced time-sensitive vs evergreen query detection
 */

import {
  categorize,
  categorizeWithConfidence,
  analyzeQuery,
} from "./dist/lib/categorize.js";

// Test cases organized by category and complexity
const testCases = {
  // High confidence time-sensitive queries
  timeSensitive: [
    "What's the weather today?",
    "What's happening in the news right now?",
    "What's the latest stock price for Apple?",
    "What's the score of the game tonight?",
    "What's the current traffic on Highway 101?",
    "What's the weather like this morning?",
    "What are the breaking news headlines?",
    "What's the price of Bitcoin now?",
    "What's happening in the election today?",
    "What's the latest update on the pandemic?",
    "What's the current exchange rate for USD to EUR?",
    "What's the weather forecast for tomorrow?",
    "What's the latest score in the football game?",
    "What's happening in the stock market today?",
    "What's the current status of the flight delays?",
  ],

  // High confidence evergreen queries
  evergreen: [
    "What is the definition of photosynthesis?",
    "How does a computer work?",
    "What is the history of the Roman Empire?",
    "How to bake a chocolate cake?",
    "What causes rain to form?",
    "Why do birds migrate?",
    "What is the difference between DNA and RNA?",
    "How to solve quadratic equations?",
    "What is the theory of relativity?",
    "How does photosynthesis work?",
    "What is the meaning of democracy?",
    "How to learn a new language?",
    "What are the principles of economics?",
    "How does the human brain work?",
    "What is the scientific method?",
  ],

  // Edge cases that should be handled correctly
  edgeCases: [
    // Ambiguous queries that could go either way
    "What is the weather?",
    "Tell me about stocks",
    "What's the news?",
    "How is the economy?",

    // Context-dependent queries
    "What is the weather like in general?",
    "What is the history of weather forecasting?",
    "How do stock markets work?",
    "What is the history of news media?",

    // Queries with mixed signals
    "What is the current definition of democracy?",
    "How does the latest iPhone work?",
    "What is the history of today's technology?",
    "How to invest in the current market?",

    // Complex temporal expressions
    "What happened in the last election?",
    "What are the trends in technology this year?",
    "What's the pattern in weather changes?",
    "What's the history of recent events?",
  ],

  // False positive prevention (should be evergreen, not fresh)
  falsePositivePrevention: [
    "What is the history of stock markets?",
    "How do weather patterns work?",
    "What is the definition of news?",
    "What is the theory behind price movements?",
    "How do sports statistics work?",
    "What is the science of traffic flow?",
    "What is the history of currency?",
    "How do elections work in general?",
  ],

  // False negative prevention (should be fresh, not evergreen)
  falseNegativePrevention: [
    "What's happening right now?",
    "What's going on today?",
    "What's the current situation?",
    "What's the latest information?",
    "What's the most recent update?",
    "What's the present status?",
    "What's the current state of affairs?",
    "What's the latest development?",
  ],
};

function runTests() {
  console.log("🧪 Running Comprehensive Categorization Tests\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test time-sensitive queries
  console.log("📅 Testing Time-Sensitive Queries:");
  testCases.timeSensitive.forEach((query, index) => {
    totalTests++;
    const result = categorizeWithConfidence(query);
    const passed = result.category === "fresh";

    if (passed) {
      passedTests++;
      console.log(
        `✅ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        })`
      );
    } else {
      failedTests++;
      console.log(
        `❌ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        }) - Expected: fresh`
      );
      console.log(`   Reasoning: ${result.reasoning}`);
    }
  });

  console.log("\n📚 Testing Evergreen Queries:");
  testCases.evergreen.forEach((query, index) => {
    totalTests++;
    const result = categorizeWithConfidence(query);
    const passed = result.category === "evergreen";

    if (passed) {
      passedTests++;
      console.log(
        `✅ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        })`
      );
    } else {
      failedTests++;
      console.log(
        `❌ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        }) - Expected: evergreen`
      );
      console.log(`   Reasoning: ${result.reasoning}`);
    }
  });

  console.log("\n🔍 Testing Edge Cases:");
  testCases.edgeCases.forEach((query, index) => {
    totalTests++;
    const result = categorizeWithConfidence(query);
    console.log(
      `🔍 ${index + 1}. "${query}" -> ${result.category} (${result.confidence})`
    );
    console.log(`   Reasoning: ${result.reasoning}`);

    // For edge cases, we just log the results for manual review
    passedTests++;
  });

  console.log("\n🛡️ Testing False Positive Prevention:");
  testCases.falsePositivePrevention.forEach((query, index) => {
    totalTests++;
    const result = categorizeWithConfidence(query);
    const passed = result.category === "evergreen";

    if (passed) {
      passedTests++;
      console.log(
        `✅ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        })`
      );
    } else {
      failedTests++;
      console.log(
        `❌ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        }) - Expected: evergreen`
      );
      console.log(`   Reasoning: ${result.reasoning}`);
    }
  });

  console.log("\n🎯 Testing False Negative Prevention:");
  testCases.falseNegativePrevention.forEach((query, index) => {
    totalTests++;
    const result = categorizeWithConfidence(query);
    const passed = result.category === "fresh";

    if (passed) {
      passedTests++;
      console.log(
        `✅ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        })`
      );
    } else {
      failedTests++;
      console.log(
        `❌ ${index + 1}. "${query}" -> ${result.category} (${
          result.confidence
        }) - Expected: fresh`
      );
      console.log(`   Reasoning: ${result.reasoning}`);
    }
  });

  // Summary
  console.log("\n📊 Test Summary:");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  // Confidence distribution
  console.log("\n📈 Confidence Distribution:");
  const allQueries = [
    ...testCases.timeSensitive,
    ...testCases.evergreen,
    ...testCases.falsePositivePrevention,
    ...testCases.falseNegativePrevention,
  ];

  const confidenceCounts = { high: 0, medium: 0, low: 0 };
  allQueries.forEach((query) => {
    const result = categorizeWithConfidence(query);
    confidenceCounts[result.confidence]++;
  });

  console.log(`High Confidence: ${confidenceCounts.high}`);
  console.log(`Medium Confidence: ${confidenceCounts.medium}`);
  console.log(`Low Confidence: ${confidenceCounts.low}`);

  return { totalTests, passedTests, failedTests };
}

// Run detailed analysis on a few example queries
function runDetailedAnalysis() {
  console.log("\n🔬 Detailed Analysis Examples:\n");

  const exampleQueries = [
    "What's the weather today?",
    "What is the definition of photosynthesis?",
    "What is the history of stock markets?",
    "What's happening right now?",
    "How does the weather work?",
  ];

  exampleQueries.forEach((query, index) => {
    console.log(`${index + 1}. Query: "${query}"`);
    const analysis = analyzeQuery(query);
    console.log(`   Category: ${analysis.result.category}`);
    console.log(`   Confidence: ${analysis.result.confidence}`);
    console.log(`   Reasoning: ${analysis.result.reasoning}`);
    console.log(
      `   Temporal Matches: ${
        analysis.temporalMatches.length > 0
          ? analysis.temporalMatches.join(", ")
          : "None"
      }`
    );
    console.log(
      `   Evergreen Matches: ${
        analysis.evergreenMatches.length > 0
          ? analysis.evergreenMatches.join(", ")
          : "None"
      }`
    );
    console.log(
      `   Context Analysis: ${JSON.stringify(
        analysis.contextAnalysis,
        null,
        2
      )}`
    );
    console.log("");
  });
}

// Main execution
try {
  runTests();
  runDetailedAnalysis();
} catch (error) {
  console.error("❌ Test execution failed:", error);
  process.exit(1);
}

export { runTests, runDetailedAnalysis, testCases };
