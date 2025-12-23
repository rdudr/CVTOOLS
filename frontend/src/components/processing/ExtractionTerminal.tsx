"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExtractionTerminalProps, ExtractionEntry } from "@/types/processing";

/**
 * ExtractionTerminal Component
 * CMD-inspired terminal box showing real-time extraction data
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

// Format timestamp as HH:MM:SS (client-side only, consistent format)
const formatTimestamp = (date: Date): string => {
  // Use UTC methods to ensure consistent output between server and client
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Terminal entry component with typewriter effect
const TerminalEntry: React.FC<{ entry: ExtractionEntry; index: number }> = ({ entry, index }) => {
  const [displayedContent, setDisplayedContent] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure we only render dynamic content on client
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    
    let currentIndex = 0;
    const content = entry.content;
    
    // Typewriter effect - reveal characters progressively
    const interval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedContent(content.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 15); // 15ms per character for smooth typewriter effect

    return () => clearInterval(interval);
  }, [entry.content, isMounted]);

  // Label color mapping
  const labelColors: Record<string, string> = {
    NAME: "text-cyan-400",
    TITLE: "text-emerald-400",
    SKILL: "text-purple-400",
    EXPERIENCE: "text-amber-400",
    EDUCATION: "text-blue-400",
    CONTACT: "text-pink-400",
    TEXT: "text-white/60",
    PROJECT: "text-orange-400",
    SUMMARY: "text-teal-400",
  };

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="font-mono text-sm leading-relaxed"
    >
      <span className="text-white/40">[{formatTimestamp(entry.timestamp)}]</span>
      <span className={`ml-2 ${labelColors[entry.label] || "text-white/60"}`}>
        [{entry.label}]
      </span>
      <span className="ml-2 text-white/90">
        {displayedContent}
        {!isComplete && (
          <span className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
        )}
      </span>
    </motion.div>
  );
};

export const ExtractionTerminal: React.FC<ExtractionTerminalProps> = ({
  entries,
  isVisible,
  isComplete,
  onFadeComplete,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showCompletion, setShowCompletion] = React.useState(false);

  // Auto-scroll to bottom when new entries arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  // Show completion message when extraction is complete
  React.useEffect(() => {
    if (isComplete && entries.length > 0) {
      const timer = setTimeout(() => {
        setShowCompletion(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, entries.length]);

  // Handle fade out after completion
  React.useEffect(() => {
    if (showCompletion && onFadeComplete) {
      const timer = setTimeout(() => {
        onFadeComplete();
      }, 2000); // Fade out 2 seconds after completion message
      return () => clearTimeout(timer);
    }
  }, [showCompletion, onFadeComplete]);

  return (
    <AnimatePresence onExitComplete={onFadeComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <div
            className="
              bg-black/80 backdrop-blur-md 
              border border-cyan-500/30 
              rounded-lg shadow-2xl shadow-cyan-500/10
              overflow-hidden
            "
          >
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-cyan-500/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-2 text-xs font-mono text-white/50">
                refolio-extraction-stream
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400/60">
                  {entries.length} entries
                </span>
                {!isComplete && (
                  <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Terminal Content */}
            <div
              ref={scrollRef}
              className="p-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
            >
              {entries.length === 0 ? (
                <div className="text-white/40 font-mono text-sm">
                  Waiting for extraction data...
                  <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-1">
                  {entries.map((entry, index) => (
                    <TerminalEntry key={entry.id} entry={entry} index={index} />
                  ))}
                  
                  {/* Completion Message */}
                  <AnimatePresence>
                    {showCompletion && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 pt-3 border-t border-cyan-500/20"
                      >
                        <span className="font-mono text-sm text-emerald-400">
                          ✓ Extraction complete. Generating portfolio...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExtractionTerminal;
