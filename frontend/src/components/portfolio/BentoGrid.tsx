"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ParticleCard } from "./ParticleCard";
import type { BentoGridProps, Achievement } from "@/types/portfolio";
import "@/components/MagicBento.css";

/**
 * BentoGrid Component with MagicBento Effects
 * Achievement statistics in bento box grid layout with particle effects
 * Requirements: 7.1 - Provide real-time progress feedback to users
 */

// Animated number counter hook
function useAnimatedNumber(value: number, duration: number = 2000) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (value - startValue) * easeOutQuart);
      setDisplayValue(currentValue);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return { displayValue, ref };
}

// Parse value to extract number and suffix
function parseValue(value: string | number): { number: number; suffix: string; prefix: string } {
  if (typeof value === "number") {
    return { number: value, suffix: "", prefix: "" };
  }
  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    return {
      prefix: match[1] || "",
      number: parseFloat(match[2]),
      suffix: match[3] || "",
    };
  }
  return { number: 0, suffix: value, prefix: "" };
}


interface BentoCardProps {
  achievement: Achievement;
  index: number;
  size: "small" | "medium" | "large";
}

function BentoCard({ achievement, index, size }: BentoCardProps) {
  const { number, suffix, prefix } = parseValue(achievement.value);
  const { displayValue, ref } = useAnimatedNumber(number, 1500 + index * 200);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 md:col-span-2 row-span-1",
    large: "col-span-1 md:col-span-2 row-span-2",
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
      className={cn(sizeClasses[size])}
    >
      <ParticleCard
        className="h-full rounded-xl"
        enableParticles={true}
        particleCount={6}
      >
        <Card
          className={cn(
            "border-white/10 backdrop-blur-xl bg-zinc-950/80 h-full",
            "hover:bg-zinc-900/90 hover:border-cyan-500/30",
            "transition-all duration-300 overflow-hidden group relative rounded-xl"
          )}
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent
            className={cn(
              "flex flex-col justify-center items-center text-center h-full relative z-10",
              size === "large" ? "p-8" : "p-6"
            )}
          >
            {/* Icon */}
            {achievement.icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="text-3xl md:text-4xl mb-3 opacity-80"
              >
                {achievement.icon}
              </motion.div>
            )}

            {/* Animated value */}
            <div className="flex items-baseline gap-1">
              {prefix && (
                <span className="text-xl md:text-2xl text-cyan-400">{prefix}</span>
              )}
              <span
                ref={ref}
                className={cn(
                  "font-bold text-white tabular-nums",
                  size === "large"
                    ? "text-4xl md:text-6xl"
                    : size === "medium"
                    ? "text-3xl md:text-5xl"
                    : "text-2xl md:text-4xl"
                )}
                style={{ textShadow: "0 0 30px rgba(34, 211, 238, 0.5)" }}
              >
                {displayValue}
              </span>
              {suffix && (
                <span className="text-lg md:text-xl text-cyan-400">{suffix}</span>
              )}
            </div>

            {/* Label */}
            <p
              className={cn(
                "text-white/60 mt-2",
                size === "large" ? "text-base md:text-lg" : "text-sm md:text-base"
              )}
            >
              {achievement.label}
            </p>

            {/* Description */}
            {achievement.description && size !== "small" && (
              <p className="text-xs text-white/40 mt-2 max-w-[200px]">
                {achievement.description}
              </p>
            )}
          </CardContent>
        </Card>
      </ParticleCard>
    </motion.div>
  );
}

function getCardSize(index: number, total: number): "small" | "medium" | "large" {
  if (total <= 3) return index === 0 ? "large" : "medium";
  if (total <= 4) return index === 0 ? "large" : "small";
  if (index === 0) return "large";
  if (index % 5 === 1 || index % 7 === 3) return "medium";
  return "small";
}

export function BentoGrid({ achievements, theme }: BentoGridProps) {
  return (
    <section className={cn("w-full py-12 md:py-16 bento-section", theme)}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Achievements
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
          {achievements.map((achievement, index) => (
            <BentoCard
              key={achievement.id}
              achievement={achievement}
              index={index}
              size={getCardSize(index, achievements.length)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
