"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/lib/theme-context";
import { ParticleCard } from "./ParticleCard";
import type { HeroTerminalProps } from "@/types/portfolio";
import { HeroTheme as HeroThemeEnum } from "@/types/portfolio";

/**
 * HeroTerminal Component
 * Terminal-style hero section with typewriter effects for technical professionals
 * Requirements: 3.2 - Render terminal hero sections with typewriter effects
 * Requirements: 1.5 - Apply a cohesive color palette that matches the candidate's professional style
 */

interface TerminalThemeConfig {
  bgColor: string;
}

// Local theme variations for background only
// Text colors are derived from global theme CSS variables
const themeBackgrounds: Record<string, TerminalThemeConfig> = {
  matrix: {
    bgColor: "bg-black/90",
  },
  cyberpunk: {
    bgColor: "bg-purple-950/90",
  },
  minimal: {
    bgColor: "bg-zinc-900/90",
  },
};

// Typewriter hook for animated text
function useTypewriter(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    setDisplayText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
}

// Terminal line component with typewriter effect
function TerminalLine({
  command,
  index,
  isActive,
}: {
  command: string;
  index: number;
  isActive: boolean;
}) {
  const { displayText, isComplete } = useTypewriter(command, 40, index * 1500);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 1.5, duration: 0.3 }}
      className="flex items-start gap-2 font-mono text-sm md:text-base"
    >
      <span className="text-emerald-400 select-none">❯</span>
      <span className="text-cyan-400">
        {displayText}
        {isActive && !isComplete && <BlinkingCursor />}
      </span>
    </motion.div>
  );
}

// Blinking cursor component
function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 ml-0.5 bg-cyan-400 align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Terminal window buttons
function WindowButtons() {
  return (
    <div className="flex gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500/80" />
      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
      <div className="w-3 h-3 rounded-full bg-green-500/80" />
    </div>
  );
}

export function HeroTerminal({
  theme = HeroThemeEnum.MATRIX,
  commands,
  name,
  title,
}: HeroTerminalProps) {
  // Get global theme colors for consistent styling
  const themeColors = useThemeColors();
  
  // Use local background variation
  const themeBg = themeBackgrounds[theme]?.bgColor || themeBackgrounds.matrix.bgColor;
  
  const [activeLineIndex, setActiveLineIndex] = React.useState(0);

  // Progress through command lines
  React.useEffect(() => {
    if (activeLineIndex < commands.length - 1) {
      const timer = setTimeout(() => {
        setActiveLineIndex((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeLineIndex, commands.length]);

  // Build display commands with user info
  const displayCommands = React.useMemo(() => {
    const baseCommands = [
      `whoami`,
      `echo "${name}"`,
      `cat title.txt`,
      `> ${title}`,
      ...commands,
    ];
    return baseCommands;
  }, [name, title, commands]);

  return (
    <div className="relative w-full min-h-[400px] md:min-h-[500px] flex items-center justify-center p-6 md:p-12">
      {/* Background glow effect - uses global theme glow */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, rgba(34, 211, 238, 0.3) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Terminal window */}
      <ParticleCard className="rounded-xl max-w-3xl w-full" enableParticles={true} particleCount={10}>
        <Card
          className={cn(
            "border-white/10 backdrop-blur-xl overflow-hidden rounded-xl",
            themeBg
          )}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
            <WindowButtons />
            <span className="text-xs text-white/50 font-mono">
              {name.toLowerCase().replace(/\s+/g, "_")}@portfolio ~ %
            </span>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          {/* Terminal content */}
          <CardContent className="p-6 md:p-8 min-h-[300px]">
            <div className="space-y-3">
              <AnimatePresence>
                {displayCommands.slice(0, activeLineIndex + 1).map((cmd, index) => (
                  <TerminalLine
                    key={index}
                    command={cmd}
                    index={index}
                    isActive={index === activeLineIndex}
                  />
                ))}
              </AnimatePresence>

              {/* Final cursor after all commands */}
              {activeLineIndex >= displayCommands.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: displayCommands.length * 1.5 + 1 }}
                  className="flex items-center gap-2 font-mono text-sm md:text-base"
                >
                  <span className="text-emerald-400 select-none">❯</span>
                  <BlinkingCursor />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </ParticleCard>

      {/* Scanline effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />
    </div>
  );
}

export default HeroTerminal;
