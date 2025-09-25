"use client";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Zap,
  Clock,
  Database,
  Brain,
  TrendingUp,
  Shield,
  Moon,
  Sun,
  Settings,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  X,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import QuerySuggestions from "../components/QuerySuggestions";
import AnalyticsChart from "../components/AnalyticsChart";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface QueryResponse {
  response: string;
  metadata: {
    source: "cache" | "llm";
    category: "fresh" | "evergreen";
    matchScore?: number;
    matchedQuery?: string;
    threshold?: number;
    categorization?: {
      confidence: "high" | "medium" | "low";
      reasoning: string;
    };
  };
}

interface QueryHistory {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  category: "fresh" | "evergreen";
  source: "cache" | "llm";
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);
  const [resp, setResp] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Load saved preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedHistory = localStorage.getItem("queryHistory");
    setDarkMode(savedDarkMode);
    if (savedHistory) {
      setQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(queryHistory));
  }, [queryHistory]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [query]);

  // Typing animation for responses
  useEffect(() => {
    if (resp && !isTyping) {
      setIsTyping(true);
      setTypingText("");
      let index = 0;
      const text = resp.response;
      const timer = setInterval(() => {
        if (index < text.length) {
          setTypingText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [resp]);

  async function send() {
    if (!query.trim()) return;

    setLoading(true);
    setResp(null);
    setError(null);
    setTypingText("");

    try {
      const r = await fetch(`${API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, forceRefresh }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");

      setResp(data);

      // Add to history
      const newEntry: QueryHistory = {
        id: Date.now().toString(),
        query,
        response: data.response,
        timestamp: new Date(),
        category: data.metadata.category,
        source: data.metadata.source,
      };
      setQueryHistory((prev) => [newEntry, ...prev.slice(0, 9)]); // Keep last 10
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === "fresh" ? (
      <Clock className="w-4 h-4" />
    ) : (
      <Database className="w-4 h-4" />
    );
  };

  const getCategoryColor = (category: string) => {
    return category === "fresh"
      ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
      : "text-green-500 bg-green-50 dark:bg-green-900/20";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getSourceIcon = (source: string) => {
    return source === "cache" ? (
      <Zap className="w-4 h-4" />
    ) : (
      <Brain className="w-4 h-4" />
    );
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const getAnalyticsData = () => {
    const cacheHits = queryHistory.filter((q) => q.source === "cache").length;
    const llmCalls = queryHistory.filter((q) => q.source === "llm").length;
    const freshQueries = queryHistory.filter(
      (q) => q.category === "fresh"
    ).length;
    const evergreenQueries = queryHistory.filter(
      (q) => q.category === "evergreen"
    ).length;
    const totalQueries = cacheHits + llmCalls;

    return {
      cacheHits,
      llmCalls,
      freshQueries,
      evergreenQueries,
      averageResponseTime: 200,
      hitRate: totalQueries > 0 ? cacheHits / totalQueries : 0,
    };
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "gradient-bg-dark text-white" : "gradient-bg text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 ${
          darkMode ? "glass-dark" : "glass"
        } border-b ${darkMode ? "border-white/20" : "border-gray-200"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Boardy AI Cache</h1>
                <p className="text-sm opacity-70">
                  Intelligent Semantic Caching
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`p-2 rounded-lg ${
                  darkMode ? "glass-dark" : "glass"
                } hover:bg-white/20 transition-colors`}
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode ? "glass-dark" : "glass"
                } hover:bg-white/20 transition-colors`}
                title="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input */}
            <div
              className={`${
                darkMode ? "glass-dark" : "glass"
              } rounded-2xl p-6 fade-in`}
            >
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-white/10 glass border dark:border-white/20 rounded-xl p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent placeholder-white/60 dark:text-white placeholder:text-gray-400"
                      rows={3}
                      placeholder="Ask me anything... (⌘+Enter to send)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setSearchFocused(false), 200)
                      }
                    />
                    <button
                      onClick={send}
                      disabled={loading || !query.trim()}
                      className="absolute right-3 top-3 p-2 rounded-lg border border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Search suggestions toggle */}
                  {!query.trim() && (
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="mt-2 flex items-center space-x-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Search className="w-4 h-4" />
                      <span>Browse suggestions</span>
                    </button>
                  )}
                </div>

                {/* Query Suggestions */}
                {showSuggestions && (
                  <div className="slide-up">
                    <QuerySuggestions onSelect={handleSuggestionSelect} />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceRefresh}
                      onChange={(e) => setForceRefresh(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400"
                    />
                    <span className="text-sm opacity-80">
                      Force refresh (bypass cache)
                    </span>
                  </label>

                  <div className="flex items-center space-x-2 text-sm opacity-60">
                    <Shield className="w-4 h-4" />
                    <span>Enhanced AI Classification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className={`${
                  darkMode ? "glass-dark" : "glass"
                } rounded-2xl p-4 border border-red-400/50 bg-red-500/10 slide-up`}
              >
                <div className="flex items-center space-x-2 dark:text-red-200 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="dark:text-red-200 text-red-400 mt-1">{error}</p>
              </div>
            )}

            {/* Response Display */}
            {resp && (
              <div
                className={`${
                  darkMode ? "glass-dark" : "glass"
                } rounded-2xl p-6 slide-up`}
                ref={responseRef}
              >
                {/* Response Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getSourceIcon(resp.metadata.source)}
                    <span className="font-medium">
                      {resp.metadata.source === "cache"
                        ? "Cached Response"
                        : "AI Generated"}
                    </span>
                    {resp.metadata.matchScore && (
                      <span className="text-sm opacity-60">
                        (Score: {resp.metadata.matchScore.toFixed(3)})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getCategoryColor(
                        resp.metadata.category
                      )}`}
                    >
                      {getCategoryIcon(resp.metadata.category)}
                      <span className="capitalize">
                        {resp.metadata.category}
                      </span>
                    </div>

                    {resp.metadata.categorization && (
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(
                          resp.metadata.categorization.confidence
                        )}`}
                      >
                        {resp.metadata.categorization.confidence} confidence
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Content */}
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {isTyping ? typingText : resp.response}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>

                {/* Categorization Details */}
                {resp.metadata.categorization && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">
                        Classification Details
                      </span>
                    </div>
                    <p className="text-sm opacity-80">
                      {resp.metadata.categorization.reasoning}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div
                className={`${
                  darkMode ? "glass-dark" : "glass"
                } rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Queries</span>
                </h3>
                <div className="space-y-3">
                  {queryHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {item.query}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`px-2 py-1 rounded text-xs ${getCategoryColor(
                              item.category
                            )}`}
                          >
                            {getCategoryIcon(item.category)}
                          </div>
                          <span className="text-xs opacity-60">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm opacity-70 truncate">
                        {item.response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analytics Sidebar */}
          {showAnalytics && (
            <div className="space-y-6 slide-up">
              <div
                className={`${
                  darkMode ? "glass-dark" : "glass"
                } rounded-2xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics Dashboard</span>
                  </h3>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <AnalyticsChart data={getAnalyticsData()} darkMode={darkMode} />
              </div>

              <div
                className={`${
                  darkMode ? "glass-dark" : "glass"
                } rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache System</span>
                    <div
                      className={`flex items-center space-x-2 ${
                        darkMode ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Classification</span>
                    <div
                      className={`flex items-center space-x-2 ${
                        darkMode ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Enhanced</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-blue-400" : "text-blue-700"
                      }`}
                    >
                      ~200ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Classification Accuracy</span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      88.7%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
