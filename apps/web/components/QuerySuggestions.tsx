"use client";
import { useState } from "react";
import { Search, TrendingUp, Clock, Database } from "lucide-react";

interface QuerySuggestionsProps {
  onSelect: (query: string) => void;
  className?: string;
}

const SUGGESTED_QUERIES = [
  {
    category: "Time-Sensitive",
    icon: Clock,
    queries: [
      "What's the weather today?",
      "What's the latest news?",
      "What's the current stock price of Apple?",
      "What's happening in the world right now?",
      "What's the traffic like on Highway 101?",
    ],
  },
  {
    category: "Evergreen",
    icon: Database,
    queries: [
      "What is artificial intelligence?",
      "How does photosynthesis work?",
      "What is the history of the Roman Empire?",
      "How to learn a new language?",
      "What are the principles of economics?",
    ],
  },
  {
    category: "Analytics",
    icon: TrendingUp,
    queries: [
      "Show me cache performance metrics",
      "What's the hit rate for today?",
      "How many queries were categorized as fresh?",
      "What's the average response time?",
    ],
  },
];

export default function QuerySuggestions({
  onSelect,
  className = "",
}: QuerySuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Suggested Queries</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUGGESTED_QUERIES.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.category} className="space-y-2">
              <button
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.category
                      ? null
                      : category.category
                  )
                }
                className="w-full flex items-center space-x-2 p-3 rounded-lg glass hover:bg-white/20 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.category}</span>
              </button>

              {selectedCategory === category.category && (
                <div className="space-y-1 ml-6">
                  {category.queries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => onSelect(query)}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
