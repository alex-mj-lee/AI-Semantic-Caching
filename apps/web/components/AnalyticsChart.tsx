"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, Brain } from "lucide-react";

interface AnalyticsData {
  cacheHits: number;
  llmCalls: number;
  freshQueries: number;
  evergreenQueries: number;
  averageResponseTime: number;
  hitRate: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData;
  className?: string;
  darkMode?: boolean;
}

export default function AnalyticsChart({
  data,
  className = "",
  darkMode = false,
}: AnalyticsChartProps) {
  const [animatedData, setAnimatedData] = useState({
    cacheHits: 0,
    llmCalls: 0,
    freshQueries: 0,
    evergreenQueries: 0,
    hitRate: 0,
  });

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setAnimatedData({
        cacheHits: Math.floor(data.cacheHits * progress),
        llmCalls: Math.floor(data.llmCalls * progress),
        freshQueries: Math.floor(data.freshQueries * progress),
        evergreenQueries: Math.floor(data.evergreenQueries * progress),
        hitRate: data.hitRate * progress,
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedData(data);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [data]);

  const metrics = [
    {
      label: "Cache Hits",
      value: animatedData.cacheHits,
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "LLM Calls",
      value: animatedData.llmCalls,
      icon: Brain,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Fresh Queries",
      value: animatedData.freshQueries,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      label: "Evergreen Queries",
      value: animatedData.evergreenQueries,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="p-4 glass bg-white/10 border dark:border-white/20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <span className="text-sm font-medium opacity-80">
                    {metric.label}
                  </span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Performance</span>
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 glass rounded-lg bg-white/10 border dark:border-white/20">
            <span className="text-sm">Hit Rate</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-1000"
                  style={{ width: `${animatedData.hitRate * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {(animatedData.hitRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 glass rounded-lg bg-white/10 border dark:border-white/20">
            <span className="text-sm">Avg Response Time</span>
            <span
              className={`text-sm font-medium ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {data.averageResponseTime}ms
            </span>
          </div>
        </div>
      </div>

      {/* Cache Efficiency */}
      <div className="p-4 glass rounded-xl bg-white/10 border dark:border-white/20">
        <h4 className="text-lg font-semibold mb-3">Cache Efficiency</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cache Utilization</span>
            <span className="font-medium">
              {data.cacheHits + data.llmCalls > 0
                ? (
                    (data.cacheHits / (data.cacheHits + data.llmCalls)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-1000"
              style={{
                width: `${
                  data.cacheHits + data.llmCalls > 0
                    ? (data.cacheHits / (data.cacheHits + data.llmCalls)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
