"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ParticleCard } from "./ParticleCard";
import type { SkillDotsProps, Skill } from "@/types/portfolio";

/**
 * SkillDots Component
 * 1-5 dot skill indicators with neon glow effects for creative professionals
 * Requirements: 2.4 - Implement neon dot visualizations with glowing effects
 */

interface SkillDotRowProps {
  skill: Skill;
  maxLevel: number;
  index: number;
}

function SkillDotRow({ skill, maxLevel, index }: SkillDotRowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Normalize skill level to 1-5 range
  const normalizedLevel = Math.min(Math.max(Math.round(skill.level), 1), maxLevel);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors"
    >
      {/* Skill name */}
      <span className="text-sm md:text-base text-white/80 group-hover:text-white transition-colors flex-1 min-w-0 truncate">
        {skill.name}
      </span>

      {/* Category badge */}
      {skill.category && (
        <span className="text-xs text-white/40 hidden md:block">
          {skill.category}
        </span>
      )}

      {/* Dot indicators */}
      <div className="flex gap-1.5">
        {Array.from({ length: maxLevel }).map((_, dotIndex) => {
          const isActive = dotIndex < normalizedLevel;
          return (
            <motion.div
              key={dotIndex}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{
                delay: index * 0.1 + dotIndex * 0.05,
                duration: 0.3,
                type: "spring",
                stiffness: 200,
              }}
              className="relative"
            >
              {/* Base dot */}
              <div
                className={cn(
                  "w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-cyan-400"
                    : "bg-white/10 border border-white/20"
                )}
              />

              {/* Glow effect for active dots */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-400"
                  animate={{
                    boxShadow: [
                      "0 0 8px rgba(34, 211, 238, 0.5)",
                      "0 0 16px rgba(34, 211, 238, 0.5)",
                      "0 0 8px rgba(34, 211, 238, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: dotIndex * 0.2,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Group skills by category
function groupSkillsByCategory(skills: Skill[]): Map<string, Skill[]> {
  const grouped = new Map<string, Skill[]>();

  skills.forEach((skill) => {
    const category = skill.category || "General";
    const existing = grouped.get(category) || [];
    grouped.set(category, [...existing, skill]);
  });

  return grouped;
}

export function SkillDots({ skills, maxLevel = 5, theme }: SkillDotsProps) {
  const groupedSkills = React.useMemo(() => groupSkillsByCategory(skills), [skills]);
  const categories = Array.from(groupedSkills.keys());

  return (
    <section className={cn("w-full py-12 md:py-16", theme)}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Skills
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
        </motion.div>

        {/* Skills grid by category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            >
              <ParticleCard className="rounded-xl h-full" enableParticles={true} particleCount={6}>
                <Card className="border-white/10 backdrop-blur-xl bg-zinc-950/80 h-full rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-cyan-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {groupedSkills.get(category)?.map((skill, skillIndex) => (
                      <SkillDotRow
                        key={skill.name}
                        skill={skill}
                        maxLevel={maxLevel}
                        index={categoryIndex * 10 + skillIndex}
                      />
                    ))}
                  </CardContent>
                </Card>
              </ParticleCard>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
            <span>Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/60" />
              ))}
            </div>
            <span>Proficient</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-400" />
              ))}
            </div>
            <span>Expert</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SkillDots;
