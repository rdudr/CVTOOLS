"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/CountUp";
import type { ProcessingStatsProps } from "@/types/processing";
import { FileText, Sparkles, Calendar, Target } from "lucide-react";

/**
 * ProcessingStats Component
 * Displays animated metrics during resume processing
 * Requirements: 9.1, 9.2, 9.3
 */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prevValue: number;
  suffix?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  prevValue,
  suffix = "",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="
        flex flex-col items-center justify-center p-4
        bg-white/5 backdrop-blur-md
        border border-white/10 rounded-xl
        min-w-[120px]
      "
    >
      <div className="text-cyan-400 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">
        <CountUp
          key={`${label}-${Math.floor(value / 10)}`}
          to={value}
          from={prevValue}
          duration={0.8}
          delay={0}
          className="tabular-nums"
          onStart={() => {}}
          onEnd={() => {}}
        />
        {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
      </div>
      <div className="text-xs text-white/50 mt-1 text-center">{label}</div>
    </motion.div>
  );
};

export const ProcessingStats: React.FC<ProcessingStatsProps> = ({
  metrics,
  isVisible,
}) => {
  // Track previous values for smooth animation
  const prevMetricsRef = React.useRef(metrics);
  
  React.useEffect(() => {
    prevMetricsRef.current = metrics;
  }, [metrics]);

  const prevMetrics = prevMetricsRef.current;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="flex gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5" />}
              label="Characters"
              value={metrics.charactersExtracted}
              prevValue={prevMetrics.charactersExtracted}
              delay={0}
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="Skills Found"
              value={metrics.skillsFound}
              prevValue={prevMetrics.skillsFound}
              delay={0.1}
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="Years Exp."
              value={metrics.experienceYears}
              prevValue={prevMetrics.experienceYears}
              delay={0.2}
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Confidence"
              value={Math.round(metrics.confidenceScore * 100)}
              prevValue={Math.round(prevMetrics.confidenceScore * 100)}
              suffix="%"
              delay={0.3}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingStats;
